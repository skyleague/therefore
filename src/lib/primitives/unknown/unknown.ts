import type { ThereforeNode } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

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
