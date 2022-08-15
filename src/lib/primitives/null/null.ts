import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category $null
 */
export interface NullOptions {}

export type NullType = CstNode<'null', NullOptions>

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $null
 */
export function $null(options: SchemaOptions<NullOptions, boolean> = {}): NullType {
    return cstNode('null', options)
}
