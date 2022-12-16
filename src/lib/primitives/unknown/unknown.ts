import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category $unknown
 */
export interface UnknownOptions {
    json: boolean
}

export type UnknownType = ThereforeNode<'unknown', UnknownOptions>

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $unknown
 */
export function $unknown(options: SchemaOptions<UnknownOptions> = {}): ThereforeNode<'unknown', UnknownOptions> {
    return cstNode('unknown', options)
}
