import { entriesOf, evaluate } from '@skyleague/axioms'
import { renderTemplate } from '../../../common/template/template.js'
import type { GenericOutput } from '../../../lib/cst/cst.js'
import type { Node, SourceNode } from '../../../lib/cst/node.js'
import type { GeneratorHooks } from '../../../lib/primitives/therefore.js'
import { type Prettier, formatContent } from '../format.js'
import { References } from './references.js'
import type { ThereforeOutput } from './types.js'
import type { TypescriptFileOutput } from './typescript.js'

export class GenericFileOutput {
    public path: string
    public references = new References('generic')
    public content?: {
        output: GenericOutput
        content: string
    }

    public cleanFn: (() => void)[] = []

    public static hooks: Partial<GeneratorHooks> = {}

    public constructor({ path }: { path: string }) {
        this.path = path
    }

    public bind() {
        const data = this.references.data()
        const duplicates = entriesOf(Object.groupBy(entriesOf(data), ([, values]) => values))
            .map(([_, second]) => second)
            .filter((records) => records !== undefined)
            .map((records) => records.filter(([, name]) => !(name.startsWith('{{') || name.endsWith('}}'))))
            .filter((records) => records.length > 1)

        const unmappedDuplicates = duplicates.map((records) =>
            records.filter(([name]) => this.references.key2node.get(name)?._attributes.typescript.aliasName === undefined),
        )

        const suffixes = unmappedDuplicates.flatMap((dups) => dups.map(([key], i) => [key, `${i > 0 ? i + 1 : ''}`] as const))

        for (const [key, suffix] of suffixes) {
            this.references.transform[key]?.((current) => {
                return `${current}${suffix}`
            })
        }
    }

    public static fromSymbol({ symbol, output }: { symbol: SourceNode; output: ThereforeOutput }) {
        const generators = (symbol._output ?? []).filter((o): o is GenericOutput => o.type === 'file')

        for (const generator of generators) {
            let outputGenerator: GenericFileOutput | TypescriptFileOutput | undefined
            let targetPath: string
            try {
                targetPath = generator.targetPath(symbol)
                outputGenerator = output[targetPath] ??= new GenericFileOutput({
                    path: targetPath,
                })
            } catch {
                continue
            }

            if (!(outputGenerator instanceof GenericFileOutput)) {
                throw new Error('Expected GenericFileOutput, got something else')
            }

            if (generator.clean !== undefined) {
                outputGenerator.cleanFn.push(() => generator.clean?.(targetPath))
            }

            if (generator.enabled?.(symbol) !== false) {
                outputGenerator.addSymbol({ symbol, output: generator, targetPath })
            }
        }
    }

    public addSymbol({ symbol, output, targetPath }: { symbol: Node; output: GenericOutput; targetPath: string }) {
        for (const hook of output.onExport ?? []) {
            hook(symbol)
        }

        if (this.content === undefined) {
            this.content = { output, content: output.content(output, { references: this.references }) }
        } else {
            throw new Error(
                `Cannot add multiple symbols to a single file ${targetPath}. Symbol name ${symbol._name} is being defined by multiple sources`,
            )
        }
    }

    public render({ prettier }: { prettier?: Prettier } = {}) {
        if (this.content === undefined) {
            return
        }
        const contents = this.content.content

        const data = this.references.resolveData(this.references.data())
        const file = renderTemplate(this.references.render(contents.toString()), data)

        if (this.content.output.prettify?.() !== false) {
            return formatContent({ prettier, input: file, file: this.path, type: evaluate(this.content.output.subtype) })
        }
        return file
    }

    public clean() {
        for (const cleanFn of this.cleanFn ?? []) {
            cleanFn()
        }
    }
}
