import type { JsonStringInstance } from '../../../json'
import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category $string
 */
export interface StringOptions {
    minLength?: number
    maxLength?: number
    pattern?: RegExp | string
    format?: JsonStringInstance['format'] & ('date-time' | 'date' | 'hostname')
}

export type StringType = ThereforeNode<'string', StringOptions>

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $string
 */
export function $string(options: SchemaOptions<StringOptions> = {}): StringType {
    return cstNode('string', options)
}
