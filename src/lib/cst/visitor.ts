import type { ThereforeNode } from './cst'

import type { ThereforeCst, ThereforeSchema } from '../primitives/types'

export type ThereforeVisitor<R, C = unknown, Cst extends ThereforeNode = ThereforeSchema> = {
    default: (node: Cst, context: C) => R
} & { [K in Cst['type']]?: (node: Extract<Cst, { type: K }>, context: C) => R }

export function walkTherefore<U, C, R = U>(obj: ThereforeNode, visitor: ThereforeVisitor<U, C>, context: C): R
export function walkTherefore<R, C>(obj: ThereforeNode, visitor: ThereforeVisitor<R, C>): R
export function walkTherefore<U, C extends { transform?: (node: ThereforeNode, obj: U) => R }, R = U>(
    obj: ThereforeNode,
    visitor: ThereforeVisitor<U, C>,
    context: C
): R
export function walkTherefore<
    U,
    C extends { transform?: (node: ThereforeNode, obj: U) => R } = Record<string, unknown>,
    R = U,
    Cst extends ThereforeNode = ThereforeCst
>(obj: Cst, visitor: ThereforeVisitor<U, C, Cst>, context: C = {} as C): R {
    const method = visitor[obj.type as Cst['type']] ?? visitor.default
    const result = method(obj as never, context)
    return context.transform?.(obj, result) ?? (result as unknown as R)
}
