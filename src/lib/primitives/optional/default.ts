import type { Node } from '../../cst/node.js'

type NoUndefined<T> = T extends undefined ? never : T
export type DefaultType<T extends Node = Node> = Omit<T, 'infer' | 'infer'> & {
    infer: NoUndefined<T['infer']>
    input: T['input']
}
