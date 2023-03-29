import type { ThereforeNode } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

export interface BooleanOptions {}

export type BooleanType = ThereforeNode<'boolean', BooleanOptions>

/**
 * Create a new `BooleanType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $boolean
 *
 * $boolean()
 * ```
 *
 * @param options - Additional options to pass to the boolean.
 *
 * @group Primitives
 */
export function $boolean(options: SchemaOptions<BooleanOptions, boolean> = {}): BooleanType {
    return cstNode('boolean', options)
}
