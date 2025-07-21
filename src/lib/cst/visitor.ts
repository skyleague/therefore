import type { ThereforeSchema } from '../primitives/types.js'
import type { Node } from './node.js'

export type ThereforeVisitor<R, C = unknown, Cst extends Node = ThereforeSchema> = {
    default: (node: Cst, context: C) => R
} & { [K in Cst['_type']]?: (node: Extract<Cst, { _type: K }>, context: C) => R }

export function walkTherefore<U, C, R = U>(obj: Node, visitor: ThereforeVisitor<U, C>, context: C): R
export function walkTherefore<R, C>(obj: Node, visitor: ThereforeVisitor<R, C>): R
export function walkTherefore<U, C extends { transform?: (node: Node, obj: U) => R }, R = U>(
    obj: Node,
    visitor: ThereforeVisitor<U, C>,
    context: C,
): R
export function walkTherefore<
    U,
    C extends { transform?: (node: Node, obj: U) => R } = Record<string, unknown>,
    R = U,
    Cst extends Node = ThereforeSchema,
>(obj: Cst, visitor: ThereforeVisitor<U, C, Cst>, context: C = {} as C): R {
    const method = visitor[obj._type as Cst['_type']] ?? visitor.default
    const result = method(obj as never, context)
    return context.transform?.(obj, result) ?? (result as unknown as R)
}
