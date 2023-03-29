import type { JsonStringInstance } from '../../../json.js'
import type { ThereforeNode } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

export interface StringOptions {
    /**
     * The minimum the length the string is allowed to have.
     */
    minLength?: number
    /**
     * The maximum the length the string is allowed to have.
     */
    maxLength?: number
    /**
     * The pattern the string has.
     */
    pattern?: RegExp | string
    /**
     * The format the string should follow (is not used for validation).
     */
    format?: JsonStringInstance['format'] & ('date-time' | 'date' | 'hostname')
}

export type StringType = ThereforeNode<'string', StringOptions>

/**
 * Create a new `StringType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $string
 *
 * $string()
 *
 * $string({maxLength: 3})
 * ```
 *
 * @param options - Additional options to pass to the string.
 * @returns A StringType.
 *
 * @group Primitives
 */
export function $string(options: SchemaOptions<StringOptions> = {}): StringType {
    return cstNode('string', options)
}
