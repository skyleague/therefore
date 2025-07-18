import 'tsx'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isFailure, isFunction, mapTry } from '@skyleague/axioms'
import type { ThereforeOutput } from '../../commands/generate/output/types.js'
import { setDefaultNames } from '../../commands/generate/output/typescript.js'
import { renderTemplate } from '../../common/template/template.js'
import type {} from '../../lib/cst/node.js'
import { isNode } from '../cst/cst.js'
import type { NameNode, Node, SourceNode } from '../cst/node.js'
import { toJsonSchema } from '../visitor/jsonschema/jsonschema.js'
import { autoRef, loadNode } from '../visitor/prepass/prepass.js'
import { $ref } from './ref/ref.js'
import { ValidatorType } from './validator/validator.js'
import type { ZodSchema } from './zod/type.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
async function requireModule(module: string): Promise<Record<string, Node | unknown>> {
    const relative = path.relative(__dirname, module).replace(/\\/g, '/')
    const mod = (await import(relative.startsWith('.') ? relative : `./${relative}`)) as Record<string, unknown>
    // const mod = await import(module.replace(/\.ts$/, '.js'))
    return (mod.default ?? mod) as Record<string, Node | unknown>
}

export function loadNodes({
    sourceSymbol,
    node,
    sourcePath,
    seen = new Set<string>(),
}: {
    sourceSymbol: string | undefined
    node: Node
    sourcePath: string | undefined
    seen?: Set<string>
}): Node[] {
    if (seen.has(node._id)) {
        return []
    }

    const evaluated = therefore.exportSymbol({ symbol: node, sourcePath, sourceSymbol })

    seen.add(evaluated._id)

    // DFS on hypergraph
    const nodes: Node[] = []
    for (const connection of evaluated._connections ?? []) {
        nodes.push(
            ...loadNodes({
                sourceSymbol: undefined,
                node: connection,
                sourcePath: evaluated._sourcePath,
                seen,
            }),
        )
    }
    nodes.push(evaluated)

    return nodes
}

// We use createRequire to handle both ESM and CJS modules consistently
// const requireModule = createRequire(import.meta.url)

export interface GeneratorHooks {
    onLoad: ((node: Node) => void)[]
    onExport: ((node: Node) => void)[]
    onGenerate: ((node: Node) => void)[]
}

export interface OutputGenerator {
    fromSymbol({ symbol, output }: { symbol: SourceNode; output: ThereforeOutput }): void
    hooks?: Partial<GeneratorHooks>
}

export class Therefore {
    public generators: OutputGenerator[] = []

    public zodCache: WeakMap<ZodSchema, Node> | undefined = new WeakMap()

    public static moduleSymbols = new Map<string, Node[]>()
    public static jsonSchemaCache = new WeakMap<Node, { schema: unknown; fallbackName?: string | undefined }>()

    public static async scanModule({
        entry,
        sourcePath,
        sourceFiles,
        require = requireModule,
        seenNodes = new WeakSet<Node>(),
        logger = console,
    }: {
        entry: string
        sourcePath: string | undefined
        sourceFiles: Set<string>
        require?: (module: string) => Promise<Record<string, Node | unknown>>
        seenNodes?: WeakSet<Node>
        logger?: typeof console | undefined
    }) {
        if (Therefore.moduleSymbols.has(entry)) {
            // biome-ignore lint/style/noNonNullAssertion: we just checked
            return Therefore.moduleSymbols.get(entry)!
        }

        const module = await mapTry(await require(entry), (x) => x)
        if (isFailure(module)) {
            return []
        }
        const exports: Node[] = []

        for (const [nodeName, nodePromise] of Object.entries(module)) {
            const node = await Therefore.awaitSymbol(nodePromise)
            if (isFailure(node) || node === undefined || node === null) {
                continue
            }

            const evaluated = loadNodes({ sourceSymbol: nodeName, node: node as Node, sourcePath })
            exports.push(...evaluated)
        }

        const allNodes: Node[] = []
        // Helper function to perform recursive DFS
        function dfs(node: Node) {
            if (!seenNodes.has(node)) {
                seenNodes.add(node)
                allNodes.push(node)

                if (node._connections) {
                    for (const connection of node._connections) {
                        dfs(connection)
                    }
                }

                if (node._children) {
                    for (const child of node._children) {
                        dfs(child)
                    }
                }
            }
        }
        // Perform DFS starting from each export
        for (const node of exports) {
            dfs(node)
        }

        for (const node of allNodes) {
            if (node._guessedTrace?.source && !sourceFiles.has(node._guessedTrace.source)) {
                const fileExists = await fs.promises
                    .access(node._guessedTrace.source, fs.constants.F_OK)
                    .then(() => true)
                    .catch(() => false)
                if (fileExists) {
                    logger?.warn(` - ${node._guessedTrace.source} not found in source files`)
                    sourceFiles.add(node._guessedTrace.source)
                    exports.push(
                        ...(await Therefore.scanModule({
                            entry: node._guessedTrace.source,
                            sourcePath: undefined,
                            sourceFiles,
                            seenNodes,
                            require,
                        })),
                    )
                }
            }
        }

        logger?.log(` - found ${[...new Set(exports.map((e) => e._name))].join(', ')}`)
        Therefore.moduleSymbols.set(entry, exports)
        return exports
    }

    public exportSymbol({
        symbol,
        sourcePath,
        sourceSymbol,
    }: {
        symbol: Node
        sourcePath: string | undefined
        sourceSymbol: string | undefined
    }) {
        const root = ValidatorType._root(loadNode(symbol))
        symbol._sourcePath = sourcePath
        root._sourcePath = sourcePath
        if (sourceSymbol !== undefined) {
            // symbol.name = sourceSymbol
            root._name = sourceSymbol
        }
        const evaluated = loadNode(root)

        const hasName = (node: Node): node is NameNode => '_name' in node
        if (!hasName(evaluated)) {
            throw new Error('Exported node must have a name')
        }
        const hasSourcePath = (node: Node): node is SourceNode => '_sourcePath' in node
        if (!hasSourcePath(evaluated)) {
            throw new Error('Exported node must have a sourcePath')
        }

        for (const hook of [...(evaluated._hooks?.onExport ?? []), ...this.generators.flatMap((g) => g.hooks?.onExport ?? [])]) {
            // biome-ignore lint/suspicious/noExplicitAny: type instantiation is too deep here
            hook(evaluated as any)
        }
        return evaluated
    }

    public static async awaitSymbol(symbol: Promise<unknown> | unknown) {
        let node = await symbol

        if (isFunction(node)) {
            node = await mapTry(node, (x) => x())
        }
        if (!isNode(node) && node !== undefined && node !== null) {
            return mapTry(node, (x) => $ref(x as Node))
        }
        return node
    }

    public static async loadSymbolTree(
        symbol: Node,
        {
            fallbackName,
            seen = new WeakSet<Node>(),
            symbols = new WeakSet<Node>(),
        }: { fallbackName?: string | undefined; seen?: WeakSet<Node>; symbols?: WeakSet<Node> } = {},
    ) {
        if (seen.has(symbol)) {
            return symbol
        }
        seen.add(symbol)

        if (!symbol._guessedTrace?.source) {
            return symbol
        }
        let found: Node = symbol
        const sourceFiles = new Set<string>([symbol._guessedTrace.source])

        // Use scanModule to do the heavy lifting of module traversal and symbol collection
        const allSymbols = await Therefore.scanModule({
            entry: symbol._guessedTrace.source,
            sourcePath: symbol._guessedTrace.source,
            sourceFiles,
            logger: undefined,
            // require: (x) => import(x.replace(/\.ts$/, '.js')),
        })
        if (!allSymbols.some((s) => s._id === symbol._id)) {
            allSymbols.push(symbol)
        }

        for (const evaluated of allSymbols) {
            symbols.add(evaluated)

            if (evaluated._guessedTrace?.symbolName) {
                evaluated._name ??= evaluated._guessedTrace.symbolName
            }

            if (evaluated._id === symbol._id) {
                found = evaluated
                await Therefore.loadSymbolTree(evaluated, { seen })
            }
        }

        if (fallbackName) {
            symbol._name ??= fallbackName
        }

        // Find our target symbol and process all symbols
        for (const evaluated of allSymbols) {
            autoRef(evaluated, symbols)
            setDefaultNames(evaluated)
        }

        return found
    }

    public static async jsonschema(node: Node, { fallbackName }: { fallbackName?: string } = {}) {
        // Check cache first
        const cached = Therefore.jsonSchemaCache.get(node)
        if (cached !== undefined && cached.fallbackName === fallbackName) {
            return cached.schema
        }

        const evaluated = await Therefore.loadSymbolTree(node, { fallbackName })
        const validator = toJsonSchema(evaluated, { formats: true, compile: false })

        const data = validator.references.resolveData(validator.references.data())
        const file = renderTemplate(validator.references.render(JSON.stringify(validator.schema)), data)
        const schema = JSON.parse(file)

        // Cache the result
        Therefore.jsonSchemaCache.set(node, { schema, fallbackName })
        return schema
    }

    public loadSymbol(symbol: Node) {
        for (const hook of [...(symbol._hooks?.onLoad ?? []), ...this.generators.flatMap((g) => g.hooks?.onLoad ?? [])]) {
            hook(symbol)
        }
    }

    public generateSymbol(symbol: Node) {
        for (const hook of [...(symbol._hooks?.onGenerate ?? []), ...this.generators.flatMap((g) => g.hooks?.onGenerate ?? [])]) {
            hook(symbol)
        }
    }
}

export const therefore = new Therefore()
