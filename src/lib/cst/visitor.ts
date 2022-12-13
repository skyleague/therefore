import type { CstNode } from './cst'

import type { ThereforeCst } from '../primitives/types'

export type CstVisitor<R, C = unknown, Cst extends CstNode = ThereforeCst> = {
    default: (node: Cst, context: C) => R
} & { [K in Cst['type']]?: (node: Extract<Cst, { type: K }>, context: C) => R }

export function walkCst<U, C, R = U>(obj: CstNode, visitor: CstVisitor<U, C>, context: C): R
export function walkCst<R, C>(obj: CstNode, visitor: CstVisitor<R, C>): R
export function walkCst<U, C extends { transform?: (node: CstNode, obj: U) => R }, R = U>(
    obj: CstNode,
    visitor: CstVisitor<U, C>,
    context: C
): R
export function walkCst<
    U,
    C extends { transform?: (node: CstNode, obj: U) => R } = Record<string, unknown>,
    R = U,
    Cst extends CstNode = ThereforeCst
>(obj: Cst, visitor: CstVisitor<U, C, Cst>, context: C = {} as C): R {
    const method = visitor[obj.type as Cst['type']] ?? visitor.default
    const result = method(obj as never, context)
    return context.transform?.(obj, result) ?? (result as unknown as R)
}
