import type { ThereforeOutput } from '../../commands/generate/output/types.js'
import type { NameNode, Node, SourceNode } from '../cst/node.js'
import { loadNode } from '../visitor/prepass/prepass.js'
import { ValidatorType } from './validator/validator.js'
import type { ZodSchema } from './zod/type.js'

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

    public zodCache: WeakMap<ZodSchema, Node> | undefined = undefined

    public exportSymbol({
        symbol,
        sourcePath,
        sourceSymbol,
    }: {
        symbol: Node
        sourcePath: string
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
