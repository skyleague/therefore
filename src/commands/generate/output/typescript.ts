import fs from 'node:fs'
import path from 'node:path'
import { entriesOf } from '@skyleague/axioms'
import camelcase from 'camelcase'
import { renderTemplate } from '../../../common/template/template.js'
import type { Node, SourceNode } from '../../../lib/cst/node.js'
import type { GeneratorHooks } from '../../../lib/primitives/therefore.js'
import { generateNode, loadNode, mustBeLazyDefined } from '../../../lib/visitor/prepass/prepass.js'
import { type DefinedTypescriptOutput, defaultTypescriptOutput } from '../../../lib/visitor/typescript/cst.js'
import type { TypescriptTypeWalkerContext } from '../../../lib/visitor/typescript/typescript-type.js'
import { createWriter } from '../../../lib/writer.js'
import { generatedBy } from '../constants.js'
import { formatContent, type Prettier } from '../format.js'
import { References } from './references.js'
import type { ThereforeOutput } from './types.js'

export function sanitizeTypescriptTypeName(symbol: string): string {
    return symbol
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .trimStart()
        .replace(/^[0-9\s]+/g, '')
}

export const setDefaultNames = (self: Node) => {
    if (self._name !== undefined) {
        const readableSymbolName = camelcase(sanitizeTypescriptTypeName(self._name), {
            pascalCase: true,
            preserveConsecutiveUppercase: true,
        })
        //  we lied to the compiler in the definition
        self._attributes.typescript.symbolName ??= readableSymbolName
        self._attributes.generic.symbolName ??= readableSymbolName
    }
}

function startsWithPath(target: string, prefix: string) {
    return target.startsWith(prefix) || target.startsWith(prefix.replace(/\//g, path.sep))
}

export const importGroups = ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'] as const
export type ImportGroup = (typeof importGroups)[number]
export class TypescriptFileOutput {
    public path: string

    public content: (readonly [Node, string, DefinedTypescriptOutput])[] = []
    public references = new References('typescript', {
        fallbackStrategy: (node, type) => {
            if (type === 'referenceName' && node._attributes.typescript.path !== this.path) {
                return 'aliasName'
            }
            return 'symbolName'
        },
    })
    public locals: [Node, ((output: DefinedTypescriptOutput) => boolean) | undefined][] = []
    public isGenerated = false

    public static hooks: Partial<GeneratorHooks> = {
        onExport: [
            (self) => {
                // propagate entry export name
                if (self._connections !== undefined && self._isCommutative) {
                    for (const connection of self._connections) {
                        if (connection._name === undefined) {
                            connection._name = self._name
                        }
                    }
                }
            },
        ],
        onGenerate: [
            (self) => {
                setDefaultNames(self)
            },
        ],
    }

    public _clean: (() => void)[] = []

    public constructor({ path: targetPath }: { path: string }) {
        this.path = targetPath
    }

    public static fromSymbol({ symbol, output }: { symbol: SourceNode; output: ThereforeOutput }) {
        const generators = defaultTypescriptOutput(symbol)

        for (const generator of generators) {
            const targetPath = generator.targetPath(symbol)
            output[targetPath] ??= new TypescriptFileOutput({
                path: targetPath,
            })
            const outputGenerator = output[targetPath]
            if (!(outputGenerator instanceof TypescriptFileOutput)) {
                throw new Error('Expected TypescriptFileOutput, got something else')
            }

            if (generator.enabled?.(symbol) !== false) {
                outputGenerator.addSymbol({ symbol, output: generator })
            }
        }
    }

    /**
     * @deprecated for testing purposes only
     */
    public static define({ symbol, render = false }: { symbol: Node; context?: TypescriptTypeWalkerContext; render?: boolean }) {
        for (const hook of TypescriptFileOutput.hooks.onLoad ?? []) {
            hook(symbol)
        }
        generateNode(symbol)

        const [generator] = TypescriptFileOutput.tsGenerators(symbol)
        if (generator === undefined) {
            throw new Error('Expected exactly one generator')
        }
        const output = new TypescriptFileOutput({ path: 'test.ts' })

        output.addSymbol({ symbol, output: generator, exportSymbol: false })

        for (const [local, _] of output.locals) {
            loadNode(local)
            generateNode(local)
            for (const localOutput of TypescriptFileOutput.tsGenerators(local)) {
                output.addSymbol({ symbol: local, output: localOutput, exportSymbol: false })
            }
        }

        let definition = output.content.map(([, second]) => second).join('\n')
        if (render) {
            const data = output.references.resolveData(output.references.data())
            definition = renderTemplate(definition, data)
        }
        return definition
    }

    private static tsGenerators(symbol: Node): DefinedTypescriptOutput[] {
        return defaultTypescriptOutput(symbol).filter((o) => o.enabled?.(symbol) !== false)
    }

    public seen = new Set<string>()
    public addSymbol({
        symbol,
        output,
        exportSymbol = true,
        context,
    }: {
        symbol: Node
        output: DefinedTypescriptOutput
        exportSymbol?: boolean
        context?: TypescriptTypeWalkerContext
    }) {
        if (this.seen.has(symbol._id)) {
            return
        }
        this.seen.add(symbol._id)

        // set the target location of the symbol
        symbol._attributes.typescript.path = this.path

        this.isGenerated = this.isGenerated || (output.isGenerated?.(symbol) ?? false)

        for (const hook of output.onExport ?? []) {
            hook(symbol)
        }

        // biome-ignore lint/style/noNonNullAssertion: we know the context is defined
        context ??= output.context!({ symbol, exportSymbol, references: this.references, locals: this.locals })
        const content = output.definition(symbol, context)
        if (content !== undefined) {
            this.content.push([symbol, content, output])
            if (output.clean !== undefined) {
                this._clean.push(() => output.clean?.(this.path))
            }
        }
    }

    public bind() {
        for (const [local, isAllowed] of this.locals) {
            loadNode(local)
            generateNode(local)

            for (const localOutput of TypescriptFileOutput.tsGenerators(local).filter((o) => isAllowed?.(o) ?? true)) {
                this.addSymbol({ symbol: local, output: localOutput, exportSymbol: false })
            }
        }

        const data = this.references.data()
        const duplicates = entriesOf(Object.groupBy(entriesOf(data), ([, values]) => values))
            .map(([, second]) => second)
            .filter((records) => records !== undefined)
            .map((records) => records.filter(([, name]) => !(name.startsWith('{{') || name.endsWith('}}'))))
            .filter((records) => records.length > 1)

        const unmappedDuplicates = duplicates.map((records) =>
            records
                .filter(([name]) => {
                    return this.references.key2node.get(name)?._attributes.typescript.aliasName === undefined
                })
                .toSorted((a, z) => {
                    const aNode = this.references.key2node.get(a[0])
                    const zNode = this.references.key2node.get(z[0])
                    if (!aNode || !zNode) {
                        return 0
                    }
                    return compareNodes(aNode, zNode)
                }),
        )

        const suffixes = unmappedDuplicates.flatMap((dups) => dups.map(([key], i) => [key, `${i > 0 ? i + 1 : ''}`] as const))

        for (const [key, suffix] of suffixes) {
            this.references.transform[key]?.((current) => {
                return `${current}${suffix}`
            })
        }

        this.content.sort(([a], [z]) => compareNodes(a, z))
    }

    public async render({ prettier }: { prettier: Prettier }) {
        if (this.content.length === 0) {
            return
        }

        const contents = createWriter()

        if (this.isGenerated) {
            contents
                .writeLine('/**')
                .writeLine(`* ${generatedBy}`)
                .writeLine('* Do not manually touch this')
                .newLineIfLastNot()
                .closeComment()
                .writeLine('// biome-ignore-all lint: this file is generated')
                .writeLine('/* eslint-disable */')
                .writeLine('')
        }

        const typeDependencies: Record<string, string[]> = {}
        const dependencies: Record<string, string[]> = {}
        const alias: Record<string, string> = {}
        for (const symbol of this.references.symbols.values()) {
            // first check if we referenced the symbol in the first place
            if (
                this.references.references.get(symbol._id)?.has('referenceName') !== true ||
                symbol._attributes.typescript.path === this.path ||
                symbol._sourcePath === undefined
            ) {
                continue
            }

            const symbolPath = symbol._attributes.typescript.path
            if (symbolPath === undefined) {
                console.error('No path found for symbol', symbol._name)
                continue
            }

            let importPath =
                symbol._attributes.typescript.isModule === true ? symbolPath : path.relative(path.dirname(this.path), symbolPath)
            if (symbol._attributes.typescript.isModule !== true && !startsWithPath(importPath, '../')) {
                importPath = `.${path.sep}${importPath}`
            }
            const reference = this.references.reference(symbol, 'symbolName')
            if (this.references.references.get(symbol._id)?.has('value')) {
                dependencies[importPath] ??= []
                dependencies[importPath]?.push(reference)
            } else {
                typeDependencies[importPath] ??= []
                typeDependencies[importPath]?.push(reference)
            }
            if (symbol._attributes.typescript.aliasName !== undefined) {
                alias[reference] =
                    symbol._transform?.aliasName?.(symbol._attributes.typescript.aliasName) ??
                    symbol._attributes.typescript.aliasName
            }
        }
        const data = this.references.resolveData(this.references.data())

        const imports: [ImportGroup, string][] = []
        for (const [type, targetPath, deps] of [
            ...Object.entries(typeDependencies).map(([targetPath, deps]) => ['type ', targetPath, deps] as const),
            ...Object.entries(dependencies).map(([targetPath, deps]) => ['', targetPath, deps] as const),
        ]) {
            const group = startsWithPath(targetPath, '../')
                ? 'parent'
                : startsWithPath(targetPath, './')
                  ? 'sibling'
                  : targetPath.startsWith('node')
                    ? 'builtin'
                    : 'external'

            const target = targetPath.replace('.ts', '.js').replace(/\\/g, '/')
            const importAttributes = target.endsWith('.json') ? ' with { type: "json" }' : ''

            const allDeps = [...new Set(deps)]
            const [first] = allDeps
            if (allDeps.length === 1 && first !== undefined) {
                const symbolName = data[first.slice(2, -2)]
                const foundAlias = alias[first]
                if (foundAlias !== undefined && symbolName === 'default') {
                    imports.push([group, `import ${type}${foundAlias} from '${target}'${importAttributes}`])
                    continue
                }
            }

            imports.push([
                group,
                `import ${type}{ ${allDeps
                    .map((d) => {
                        if (alias[d] !== undefined) {
                            return `${d} as ${alias[d]}`
                        }
                        return data[d.slice(2, -2)] ?? d
                    })
                    .sort()
                    .join(', ')} } from '${target}'${importAttributes}`,
            ])
        }

        const groupedImports = Object.values(Object.groupBy(imports, (i) => i[0]))
            .map((imports) => imports.toSorted((a, z) => importGroups.indexOf(a[0]) - importGroups.indexOf(z[0])))
            .map((imports) =>
                imports
                    .map(([, line]) => line)
                    // sort on the path of the import string with regex
                    .toSorted(
                        (a, z) =>
                            (a.match(/from '(.*)'/)?.[1] ?? a).localeCompare(z.match(/from '(.*)'/)?.[1] ?? z) ||
                            a.localeCompare(z),
                    ),
            )

        for (const lines of groupedImports) {
            const seen = new Set()
            for (const line of lines) {
                if (!seen.has(line)) {
                    contents.writeLine(line)
                    seen.add(line)
                }
            }
            contents.newLine()
        }
        contents.newLineIfLastNot()

        // Replace the current sorting with topological sort
        for (const [, line] of this.sortContentTopologically()) {
            contents.writeLine(line).newLine()
        }

        const file = this.references.render(contents.toString())
        return await formatContent({ prettier, input: renderTemplate(file, data), file: this.path, type: 'typescript' })
    }

    public clean() {
        for (const clean of this._clean) {
            clean()
        }

        if (this.content.length === 0 && fs.existsSync(this.path)) {
            console.warn(`Cleaning ${this.path}`)
            fs.rmSync(this.path)
        }
    }

    private sortContentTopologically(): (readonly [Node, string, DefinedTypescriptOutput])[] {
        const inGraph = new Map<string, Set<string>>()
        const outGraph = new Map<string, Set<string>>()
        const allNodes = new Map<string, Node>()
        const nodeToRoot = new Map<string, string>()

        const rootNodes = new Set(this.content.map(([node]) => node._id))
        const validatorToType = new Map<string, string>()
        const validatedToValidator = new Map<string, string>()

        // Find validator relationships and combine them
        for (const [node] of this.content) {
            if (node._type === 'validator' && node._children?.[0]) {
                const validatedType = node._children[0]
                validatorToType.set(node._id, validatedType._id)
                validatedToValidator.set(validatedType._id, node._id)
                nodeToRoot.set(validatedType._id, node._id)
                if (rootNodes.has(validatedType._id)) {
                    rootNodes.delete(validatedType._id)
                }
            }
        }

        // Initialize root nodes in graphs
        for (const rootId of rootNodes) {
            inGraph.set(rootId, new Set())
            outGraph.set(rootId, new Set())
        }

        // Phase 1: Map nodes to their root nodes
        const mapNodesToRoots = (node: Node, rootId: string | undefined = undefined, visited = new Set<string>()) => {
            if (visited.has(node._id)) {
                return
            }
            visited.add(node._id)

            // If we hit a root node that isn't our starting point, stop traversing
            if (rootId && rootNodes.has(node._id) && node._id !== rootId) {
                return
            }

            const connection = validatedToValidator.get(node._id) ?? node._id
            const currentRoot = rootNodes.has(connection) ? connection : rootId

            if (currentRoot && !nodeToRoot.has(node._id)) {
                nodeToRoot.set(node._id, currentRoot)
            }

            allNodes.set(node._id, node)

            if (node._connections) {
                for (const conn of node._connections) {
                    if (!rootNodes.has(conn._id)) {
                        mapNodesToRoots(conn, currentRoot, visited)
                    }
                }
            }
            if (node._children) {
                for (const child of node._children) {
                    mapNodesToRoots(child, currentRoot, visited)
                }
            }
        }

        // Phase 2: Build dependency graphs between root nodes
        const buildDependencyGraph = (_from: Node, to: Node, visited = new Set<string>()) => {
            if (visited.has(to._id)) {
                return
            }
            visited.add(to._id)

            const nodeRootId = nodeToRoot.get(to._id)
            if (!nodeRootId) {
                return
            }

            const processConnection = (conn: Node) => {
                const connRootId = nodeToRoot.get(conn._id)
                if (connRootId && connRootId !== nodeRootId) {
                    const isTypeOnly = this.content.find(([n]) => n._id === connRootId)?.[2].isTypeOnly
                    if (!isTypeOnly) {
                        const effectiveNodeId = nodeToRoot.get(connRootId) ?? connRootId
                        const validatorId = Array.from(validatorToType.entries()).find(
                            ([, typeId]) => typeId === effectiveNodeId,
                        )?.[0]

                        outGraph.get(nodeRootId)?.add(effectiveNodeId)
                        inGraph.get(effectiveNodeId)?.add(nodeRootId)

                        if (validatorId) {
                            outGraph.get(effectiveNodeId)?.add(validatorId)
                            inGraph.get(validatorId)?.add(effectiveNodeId)
                        }
                    }
                }
            }

            const isLazyDefined = mustBeLazyDefined(to)
            if (to._connections && !isLazyDefined) {
                for (const conn of to._connections) {
                    processConnection(conn)
                    buildDependencyGraph(to, conn, visited)
                }
            }
            if (to._children && !isLazyDefined) {
                for (const child of to._children) {
                    processConnection(child)
                    buildDependencyGraph(to, child, visited)
                }
            }
        }

        // Execute both phases
        for (const rootId of rootNodes) {
            const rootNode = this.content.find(([node]) => node._id === rootId)?.[0]
            if (rootNode) {
                mapNodesToRoots(rootNode)
            }
        }

        for (const rootId of rootNodes) {
            const rootNode = this.content.find(([node]) => node._id === rootId)?.[0]
            if (rootNode) {
                buildDependencyGraph(rootNode, rootNode)
            }
        }

        // Create a mermaid graph visualization for debugging dependency relationships
        // let mermaidGraph = 'graph TD;\n'
        // for (const [nodeId, incomingNodes] of inGraph.entries()) {
        //     const node = this.content.find(([n]) => n._id === nodeId)?.[0]
        //     const nodeName = node?._name ?? nodeId
        //     const nodeType = node?._type ?? 'unknown'
        //     for (const incomingId of incomingNodes) {
        //         const incomingNode = this.content.find(([n]) => n._id === incomingId)?.[0]
        //         const incomingName = incomingNode?._name ?? incomingId
        //         const incomingType = incomingNode?._type ?? 'unknown'
        //         mermaidGraph += `    ${incomingName}[${incomingName}<br/>${incomingId}<br/>${incomingType}]-->${nodeName}[${nodeName}<br/>${nodeId}<br/>${nodeType}]\n`
        //     }
        // }
        // console.log('\nDependency Graph:\n```mermaid\n' + mermaidGraph + '```\n')

        // Kahn's algorithm
        const queue = Array.from(inGraph.entries())
            .filter(([id, ins]) => ins.size === 0 && this.content.some(([node]) => node._id === id))
            .map(([id]) => id)
            .toSorted((a, b) => {
                const aNode = allNodes.get(a)
                const bNode = allNodes.get(b)
                if (!aNode || !bNode) {
                    return 0
                }
                return compareNodes(aNode, bNode)
            })

        const sorted: (readonly [Node, string, DefinedTypescriptOutput])[] = []
        const processedValidatedTypes = new Set<string>()

        while (queue.length > 0) {
            // biome-ignore lint/style/noNonNullAssertion: we know the queue is not empty
            const nodeId = queue.shift()!
            const contentItem = this.content.find(([node]) => node._id === nodeId)
            if (contentItem) {
                sorted.push(contentItem)
                // If this was a validated type, add its validator to the queue immediately after
                const validatorId = validatorToType.get(nodeId)
                if (validatorId) {
                    processedValidatedTypes.add(nodeId)
                    queue.unshift(validatorId)
                }
            }

            // Process outgoing edges
            const neighbors = outGraph.get(nodeId) ?? new Set()
            for (const neighbor of neighbors) {
                inGraph.get(neighbor)?.delete(nodeId)
                if (inGraph.get(neighbor)?.size === 0) {
                    queue.push(neighbor)
                    inGraph.delete(neighbor)
                }
            }
        }

        // Check for cycles and handle remaining nodes
        if (sorted.length !== this.content.length) {
            console.error('Circular dependencies detected in the type definitions', this.path)
            const processedIds = new Set(sorted.map(([node]) => node._id))
            const remaining = this.content.filter(([node]) => !processedIds.has(node._id))
            sorted.push(...remaining)
        }

        return sorted.reverse()
    }
}

function compareNodes(a: Node, z: Node): number {
    if (a._name && z._name) {
        const nameComparison = z._name.localeCompare(a._name)
        if (nameComparison !== 0) {
            return nameComparison
        }
        const typeComparison = (z._type ?? '').localeCompare(a._type ?? '')
        if (typeComparison !== 0) {
            return typeComparison
        }
        return z._id.localeCompare(a._id)
    }
    return 0
}
