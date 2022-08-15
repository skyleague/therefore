import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category $unknown
 */
export interface UnknownOptions {}

export type UnknownType = CstNode<'unknown', UnknownOptions>

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $unknown
 */
export function $unknown(options: SchemaOptions<UnknownOptions, unknown> = {}): CstNode<'unknown', UnknownOptions> {
    return cstNode('unknown', options)
}
