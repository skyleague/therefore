import { ValidatorType } from './validator/validator.js'

import type { NameNode, Node, SourceNode } from '../cst/node.js'
import type { ThereforeOutput } from '../output/types.js'
import { loadNode } from '../visitor/prepass/prepass.js'

export const validatedSymbol = Symbol('validated')

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

    public exportSymbol({
        symbol,
        sourcePath,
        sourceSymbol,
    }: {
        symbol: Node
        sourcePath: string
        sourceSymbol: string | undefined
    }) {
        const root =
            symbol.definition.validator !== undefined && !(validatedSymbol in symbol) ? new ValidatorType(symbol) : symbol
        symbol.sourcePath = sourcePath
        root.sourcePath = sourcePath
        if (sourceSymbol !== undefined) {
            // symbol.name = sourceSymbol
            root.name = sourceSymbol
        }
        const evaluated = loadNode(root)

        const hasName = (node: Node): node is NameNode => 'name' in node
        if (!hasName(evaluated)) {
            throw new Error('Exported node must have a name')
        }
        const hasSourcePath = (node: Node): node is SourceNode => 'sourcePath' in node
        if (!hasSourcePath(evaluated)) {
            throw new Error('Exported node must have a sourcePath')
        }

        for (const hook of [...(evaluated.hooks?.onExport ?? []), ...this.generators.flatMap((g) => g.hooks?.onExport ?? [])]) {
            hook(evaluated)
        }
        ;(symbol as unknown as { [validatedSymbol]: boolean })[validatedSymbol] = true

        return evaluated
    }

    public loadSymbol(symbol: Node) {
        for (const hook of [...(symbol.hooks?.onLoad ?? []), ...this.generators.flatMap((g) => g.hooks?.onLoad ?? [])]) {
            hook(symbol)
        }
    }

    public generateSymbol(symbol: Node) {
        for (const hook of [...(symbol.hooks?.onGenerate ?? []), ...this.generators.flatMap((g) => g.hooks?.onGenerate ?? [])]) {
            hook(symbol)
        }
    }
}

export const therefore = new Therefore()
