import type { ThereforeNode, ThereforeExpr } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

import { evaluate } from '@skyleague/axioms'

export interface UnionOptions {}

export type UnionType = ThereforeNode<'union', UnionOptions, unknown, ThereforeNode[]>

/**
 * Create a new `UnionType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $union([$integer, $string])
 *
 * $union([$object({foo: $integer}), $object({bar: $string}])
 * ```
 *
 * @param union - The items in the union.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Primitives
 */
export function $union(union: ThereforeExpr[], options: SchemaOptions<UnionOptions> = {}): UnionType {
    return cstNode('union', options, union.map(evaluate))
}
