import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

/**
 * @category $integer
 */
export interface IntegerOptions {
    /**
     * The resulting property will only be valid when the value divided by this parameter
     * results in a strict integer. (exluding zero)
     *
     * @example
     * Given `$integer({multipleOf: 0.2})`
     *
     *  - input: 10 -> 10 / 0.2 = 50 (validates)
     *  - input: 10.5 -> 10.5 / 0.2 = 52.5 (invalid)
     */
    multipleOf?: number

    /**
     * A number is valid if the value is lower than or equal to the parameter.
     *
     * @example
     * Given `$integer({maximum: 1.0})`
     *
     *  - input: 1 (validates)
     *  - input: 2 (invalid)
     */
    maximum?: number

    /**
     * A number is valid if the value is greater than or equal to the parameter.
     *
     * @example
     * Given `$integer({minimum: 1.0})`
     *
     *  - input: 0 (invalid)
     *  - input: 1 (validates)
     */
    minimum?: number
}

export type IntegerType = CstNode<'integer', IntegerOptions>

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $integer
 */
export function $integer(options: SchemaOptions<IntegerOptions, number> = {}): IntegerType {
    return cstNode('integer', options)
}
