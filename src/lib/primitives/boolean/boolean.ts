import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

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
