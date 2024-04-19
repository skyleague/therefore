import { References } from './references.js'
import type { ThereforeOutput } from './types.js'

import packageJson from '../../../package.json' with { type: 'json' }
import { generatedBy } from '../../commands/generate/constants.js'
import { type Prettier, formatFile } from '../../commands/generate/format.js'
import { renderTemplate } from '../../common/template/template.js'
import type { TypescriptOutput } from '../cst/cst.js'
import type { Node, SourceNode } from '../cst/node.js'
import type { GeneratorHooks } from '../primitives/therefore.js'
import { generateNode, loadNode } from '../visitor/prepass/prepass.js'
import { type DefinedTypescriptOutput, defaultTypescriptOutput } from '../visitor/typescript/cst.js'
import { type TypescriptWalkerContext, buildContext } from '../visitor/typescript/typescript.js'
import { createWriter } from '../writer.js'

import { entriesOf, groupBy, second } from '@skyleague/axioms'
import camelcase from 'camelcase'

import path from 'node:path'

const { version } = packageJson

export function sanitizeTypescriptTypeName(symbol: string): string {
    return symbol
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .trimStart()
        .replace(/^[0-9\s]+/g, '')
}

export const setDefaultNames = (self: Node) => {
    if (self.name !== undefined) {
        const readableSymbolName = camelcase(sanitizeTypescriptTypeName(self.name), {
            pascalCase: true,
            preserveConsecutiveUppercase: true,
        })
        //  we lied to the compiler in the definition
        self.attributes.typescript.symbolName ??= readableSymbolName
        self.attributes.generic.symbolName ??= readableSymbolName
    }
}

export const importGroups = ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'] as const
export type ImportGroup = (typeof importGroups)[number]
export class TypescriptFileOutput {
    public path: string

    public content: (readonly [Node, string])[] = []
    public references = new References('typescript', {
        fallbackStrategy: (node, type) => {
            if (type === 'referenceName' && node.attributes.typescript.path !== this.path) {
                return 'aliasName'
            }
            return 'symbolName'
        },
    })
    public locals: Node[] = []

    public static hooks: Partial<GeneratorHooks> = {
        onExport: [
            (self) => {
                // propagate entry export name
                if (self.connections !== undefined && self.isCommutative) {
                    for (const connection of self.connections) {
                        if (connection.name === undefined) {
                            connection.name = self.name
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
        const generators = TypescriptFileOutput.tsGenerators(symbol)

        for (const generator of generators) {
            const targetPath = generator.targetPath(symbol)
            output[targetPath] ??= new TypescriptFileOutput({
                path: targetPath,
            })
            const outputGenerator = output[targetPath]
            if (!(outputGenerator instanceof TypescriptFileOutput)) {
                throw new Error('Expected TypescriptFileOutput, got something else')
            }
            outputGenerator.addSymbol({ symbol, output: generator })
        }
    }

    /**
     * @deprecated for testing purposes only
     */
    public static define({
        symbol,
        render = false,
    }: {
        symbol: Node
        context?: TypescriptWalkerContext
        render?: boolean
    }) {
        for (const hook of TypescriptFileOutput.hooks.onLoad ?? []) {
            hook(symbol)
        }
        generateNode(symbol)

        const [generator] = TypescriptFileOutput.tsGenerators(symbol)
        if (generator === undefined) {
            throw new Error('Expected exactly one generator')
        }
        const output = new TypescriptFileOutput({ path: 'test.ts' })
        output.addSymbol({ symbol, output: generator })
        // context ??= buildContext({ symbol, exportSymbol: true, references: new References('typescript'), locals: [] })

        // output.onLoad?.forEach((hook) => hook(symbol))

        // let definition = output.definition(symbol, context)
        for (const local of output.locals) {
            loadNode(local)
            generateNode(local)
            for (const localOutput of TypescriptFileOutput.tsGenerators(local)) {
                output.addSymbol({ symbol: local, output: localOutput, exportSymbol: false })
            }
        }

        let definition = output.content.map(second).join('\n')
        if (render) {
            const data = output.references.resolveData(output.references.data())
            definition = renderTemplate(definition, data)
        }
        return definition
    }

    private static tsGenerators(symbol: Node): DefinedTypescriptOutput[] {
        return (
            (symbol.output ?? [defaultTypescriptOutput(symbol)])
                .filter((o): o is TypescriptOutput => o.type === 'typescript')
                // load in the defaults
                .map((o) => defaultTypescriptOutput(symbol, o))
        )
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
        context?: TypescriptWalkerContext
    }) {
        if (this.seen.has(symbol.id)) {
            return
        }
        this.seen.add(symbol.id)

        // set the target location of the symbol
        symbol.attributes.typescript.path = this.path

        for (const hook of output.onExport ?? []) {
            hook(symbol)
        }

        context ??= buildContext({ symbol: symbol, exportSymbol, references: this.references, locals: this.locals })
        const content = output.definition(symbol, context)
        if (content !== undefined) {
            // this.imports.push(...output.imports(symbol))
            this.content.push([symbol, content])
            if (output.clean !== undefined) {
                this._clean.push(() => output.clean?.(this.path))
            }
        }
    }

    public bind() {
        const data = this.references.data()
        const duplicates = entriesOf(groupBy(entriesOf(data), ([, values]) => values))
            .map(second)
            .map((records) => records.filter(([, name]) => !(name.startsWith('{{') || name.endsWith('}}'))))
            .filter((records) => records.length > 1)

        const unmappedDuplicates = duplicates.map((records) =>
            records.filter(([name]) => this.references.key2node.get(name)?.attributes.typescript.aliasName === undefined),
        )

        const suffixes = unmappedDuplicates.flatMap((dups) => dups.map(([key], i) => [key, `${i > 0 ? i + 1 : ''}`] as const))

        for (const [key, suffix] of suffixes) {
            this.references.transform[key]?.((current) => {
                return `${current}${suffix}`
            })
        }
    }

    public async render({ prettier }: { prettier: Prettier }) {
        for (const local of this.locals) {
            loadNode(local)
            generateNode(local)

            for (const localOutput of TypescriptFileOutput.tsGenerators(local)) {
                this.addSymbol({ symbol: local, output: localOutput, exportSymbol: false })
            }
        }

        if (this.content.length === 0) {
            return
        }

        const contents = createWriter()
        contents
            .writeLine('/**')
            .writeLine(`* ${generatedBy}@v${version}`)
            .writeLine('* Do not manually touch this')
            .newLineIfLastNot()
            .closeComment()
            .writeLine('/* eslint-disable */')
            .writeLine('')

        const typeDependencies: Record<string, string[]> = {}
        const dependencies: Record<string, string[]> = {}
        const alias: Record<string, string> = {}
        for (const symbol of this.references.symbols.values()) {
            // first check if we referenced the symbol in the first place
            if (
                this.references.references.get(symbol.id)?.has('referenceName') !== true ||
                symbol.attributes.typescript.path === this.path ||
                symbol.sourcePath === undefined
            ) {
                continue
            }

            let importPath =
                symbol.attributes.typescript.isModule === true
                    ? symbol.attributes.typescript.path
                    : path.relative(path.dirname(this.path), symbol.attributes.typescript.path)
            if (symbol.attributes.typescript.isModule !== true && !importPath.startsWith('../')) {
                importPath = `./${importPath}`
            }
            const reference = this.references.reference(symbol, 'symbolName')
            if (this.references.references.get(symbol.id)?.has('value')) {
                dependencies[importPath] ??= []
                dependencies[importPath]?.push(reference)
            } else {
                typeDependencies[importPath] ??= []
                typeDependencies[importPath]?.push(reference)
            }
            if (symbol.attributes.typescript.aliasName !== undefined) {
                alias[reference] =
                    symbol.transform?.aliasName?.(symbol.attributes.typescript.aliasName) ??
                    symbol.attributes.typescript.aliasName
            }
        }
        const data = this.references.resolveData(this.references.data())

        const imports: [ImportGroup, string][] = []
        for (const [type, targetPath, deps] of [
            ...Object.entries(typeDependencies).map(([targetPath, deps]) => ['type ', targetPath, deps] as const),
            ...Object.entries(dependencies).map(([targetPath, deps]) => ['', targetPath, deps] as const),
        ]) {
            const group = targetPath.startsWith('../')
                ? 'parent'
                : targetPath.startsWith('./')
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

        const groupedImports = Object.values(groupBy(imports, (i) => i[0]))
            .map((imports) => imports.sort((a, z) => importGroups.indexOf(a[0]) - importGroups.indexOf(z[0])))
            .map((imports) =>
                imports
                    .map(([, line]) => line)
                    // sort on the path of the import string with regex
                    .sort(
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

        for (const [, line] of this.content.sort((a, z) => (a[0].name ?? '').localeCompare(z[0].name ?? ''))) {
            contents.writeLine(line).newLine()
        }

        const file = this.references.render(contents.toString())
        return await formatFile({ prettier, input: renderTemplate(file, data), file: this.path, type: 'typescript' })
    }

    public clean() {
        for (const clean of this._clean) {
            clean()
        }
    }
}
