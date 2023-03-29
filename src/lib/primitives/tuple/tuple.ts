import type { ThereforeNode, ThereforeExpr } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

import type { RequireKeys } from '@skyleague/axioms'
import { evaluate, entriesOf, isArray } from '@skyleague/axioms'

export interface TupleOptions {}

export type TupleType = ThereforeNode<
    'tuple',
    TupleOptions,
    unknown,
    Omit<ThereforeNode, 'name'>[] | RequireKeys<ThereforeNode, 'name'>[]
>

/**
 * Create a new `TupleType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $tuple([$integer, $string])
 *
 * $tuple({foo: $integer, bar: $string})
 * ```
 *
 * @param items - The items in the tuple.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Primitives
 */
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
