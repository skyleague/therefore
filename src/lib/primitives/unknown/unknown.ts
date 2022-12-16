import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

export interface UnknownOptions {
    /**
     * Restrict the unknown values to json values
     */
    json: boolean
}

export type UnknownType = ThereforeNode<'unknown', UnknownOptions>

/**
 * Create a new `RefType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $unknown
 *
 * $unknown()
 * ```
 *
 * @param options - Additional options to pass to the number.
 *
 * @group Primitives
 */
export function $unknown(options: SchemaOptions<UnknownOptions> = {}): ThereforeNode<'unknown', UnknownOptions> {
    return cstNode('unknown', options)
}
