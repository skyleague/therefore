import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import type { RequireKeys } from '@skyleague/axioms'
import { evaluate, entriesOf, isArray } from '@skyleague/axioms'

export interface TupleOptions {}

export type TupleType = ThereforeNode<
    'tuple',
    TupleOptions,
    unknown,
    Omit<ThereforeNode, 'name'>[] | RequireKeys<ThereforeNode, 'name'>[]
>

export function $tuple(
    items: Record<string, ThereforeExpr> | ThereforeExpr[],
    options: SchemaOptions<TupleOptions> = {}
): TupleType {
    return cstNode(
        'tuple',
        options,
        isArray(items) ? items.map(evaluate) : entriesOf(items).map(([name, node]) => ({ name, ...evaluate(node) }))
    )
}
