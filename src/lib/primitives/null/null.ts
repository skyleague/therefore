import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category Primitives
 */
export interface NullOptions {}

export type NullType = ThereforeNode<'null', NullOptions>

/**
 * Create a new `NullType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $null
 *
 * $null()
 * ```
 *
 * @param options - Additional options to pass to the null.
 *
 * @group Primitives
 */
export function $null(options: SchemaOptions<NullOptions, boolean> = {}): NullType {
    return cstNode('null', options)
}
