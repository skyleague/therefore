import type { ThereforeNode, ThereforeExpr } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

import { evaluate } from '@skyleague/axioms'

export interface DictOptions {}

export type DictType = ThereforeNode<'dict', DictOptions, unknown, [ThereforeNode]>

/**
 * Create a new `DictType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $dict($integer)
 *
 * $dict($boolean())
 * ```
 *
 * @param items - The items on this dict.
 * @param options - Additional options to pass to the dict.
 *
 * @group Primitives
 */
export function $dict(items: ThereforeExpr, options: SchemaOptions<DictOptions> = {}): DictType {
    return cstNode('dict', options, [evaluate(items)])
}
