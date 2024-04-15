import { References } from './references.js'
import type { ThereforeOutput } from './types.js'

import { type Prettier, formatFile } from '../../commands/generate/format.js'
import { renderTemplate } from '../../common/template/template.js'
import type { GenericOutput } from '../cst/cst.js'
import type { Node, SourceNode } from '../cst/node.js'
import type { GeneratorHooks } from '../primitives/therefore.js'

import { evaluate } from '@skyleague/axioms'

export class GenericFileOutput {
    public path: string
    public references = new References('generic')
    public content?: {
        output: GenericOutput
        content: string
    }

    public static hooks: Partial<GeneratorHooks> = {}

    public constructor({ path }: { path: string }) {
        this.path = path
    }

    public bind() {
        //
    }

    public static fromSymbol({ symbol, output }: { symbol: SourceNode; output: ThereforeOutput }) {
        const generators = (symbol.output ?? []).filter((o): o is GenericOutput => o.type === 'file')

        for (const generator of generators) {
            const targetPath = generator.targetPath(symbol)
            output[targetPath] ??= new GenericFileOutput({
                path: targetPath,
            })
            const outputGenerator = output[targetPath]
            if (!(outputGenerator instanceof GenericFileOutput)) {
                throw new Error('Expected GenericFileOutput, got something else')
            }
            outputGenerator.addSymbol({ symbol, output: generator })
        }
    }

    public addSymbol({ symbol, output }: { symbol: Node; output: GenericOutput }) {
        for (const hook of output.onExport ?? []) {
            hook(symbol)
        }

        if (this.content === undefined) {
            this.content = { output, content: output.content(output, { references: this.references }) }
        } else {
            throw new Error('Cannot add multiple symbols to a single file')
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
            return formatFile({ prettier, input: file, file: this.path, type: evaluate(this.content.output.subtype) })
        }
        return file
    }

    public clean() {
        this.content?.output.clean?.(this.path)
    }
}
