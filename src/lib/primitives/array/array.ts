import type { ThereforeNode, ThereforeExpr } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

import { evaluate } from '@skyleague/axioms'

export interface ArrayOptions {
    /**
     * The minimum amount of items this array has.
     */
    minItems?: number
    /**
     * The maximum amount of items this array has.
     */
    maxItems?: number
    /**
     * Checks whether all items are unique.
     */
    uniqueItems?: boolean
}

export type ArrayType = ThereforeNode<'array', ArrayOptions, unknown, [ThereforeNode]>

/**
 * Create a new `ArrayType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $array($integer)
 *
 * $array($boolean())
 * ```
 *
 * @param items - The items on this array.
 * @param options - Additional options to pass to the array.
 *
 * @group Primitives
 */
export function $array(items: ThereforeExpr, options: SchemaOptions<ArrayOptions> = {}): ArrayType {
    return cstNode('array', options, [evaluate(items)])
}
