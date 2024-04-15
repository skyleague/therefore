import type { SetRequired } from '@skyleague/axioms/types'
import { replaceExtension } from '../../../common/template/path.js'
import { constants } from '../../constants.js'
import type { TypescriptOutput } from '../../cst/cst.js'
import type { Node } from '../../cst/node.js'

export type DefinedTypescriptOutput = SetRequired<TypescriptOutput, 'targetPath' | 'definition'>
export function defaultTypescriptOutput(_: Node, typescript?: Partial<TypescriptOutput>): DefinedTypescriptOutput {
    const { onExport, ...rest } = typescript ?? {}
    return {
        type: 'typescript',
        onExport: [...(onExport ?? [])],
        targetPath: ({ sourcePath }) => {
            return replaceExtension(sourcePath, constants.defaultTypescriptOutExtension)
        },
        definition: (self, context) => {
            return `${context.declare('type', self)} = ${context.render(self)}`
        },
        ...rest,
    } satisfies DefinedTypescriptOutput
}
