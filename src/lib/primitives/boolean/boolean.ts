import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category $boolean
 */
export interface BooleanOptions {}

export type BooleanType = CstNode<'boolean', BooleanOptions>

/**
 *
 * @param options - additional options to pass to the property
 *
 * @example
 *      $object({
 *          isUser: $boolean(),
 *          flagged: $boolean
 *      })
 *
 * @category $boolean
 * @public
 */
export function $boolean(options: SchemaOptions<BooleanOptions, boolean> = {}): BooleanType {
    return cstNode('boolean', options)
}
