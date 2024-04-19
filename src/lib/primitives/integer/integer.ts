import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

import type { IntegerGenerator } from '@skyleague/axioms'

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
    multipleOf?: number | undefined

    /**
     * A number is valid if the value is lower than or equal to the parameter.
     *
     * @example
     * Given `$integer({maximum: 1.0})`
     *
     *  - input: 1 (validates)
     *  - input: 2 (invalid)
     */
    max?: number | undefined
    maxInclusive: boolean

    /**
     * A number is valid if the value is greater than or equal to the parameter.
     *
     * @example
     * Given `$integer({minimum: 1.0})`
     *
     *  - input: 0 (invalid)
     *  - input: 1 (validates)
     */
    min?: number | undefined
    minInclusive: boolean

    arbitrary?: Partial<IntegerGenerator> | undefined
}

export class IntegerType extends NodeTrait {
    public override type = 'integer' as const

    public options: IntegerOptions
    public declare infer: number

    public constructor({ minInclusive = true, maxInclusive = true, ...options }: SchemaOptions<Partial<IntegerOptions>>) {
        super(options)
        this.options = {
            minInclusive,
            maxInclusive,
            ...options,
        }
    }

    public arbitrary(options: Partial<IntegerGenerator>) {
        this.options.arbitrary ??= {}
        this.options.arbitrary = { ...this.options.arbitrary, ...options }
        return this
    }

    public gt(value: number) {
        this.options.min = value
        this.options.minInclusive = false
        return this
    }

    public gte(value: number) {
        this.options.min = value
        this.options.minInclusive = true
        return this
    }

    public lt(value: number) {
        this.options.max = value
        this.options.maxInclusive = false
        return this
    }

    public lte(value: number) {
        this.options.max = value
        this.options.maxInclusive = true
        return this
    }

    public positive() {
        this.options.min = 0
        this.options.minInclusive = false
        return this
    }

    public nonnegative() {
        this.options.min = 0
        this.options.minInclusive = true
        return this
    }

    public negative() {
        this.options.max = 0
        this.options.maxInclusive = false
        return this
    }

    public nonpositive() {
        this.options.max = 0
        this.options.maxInclusive = true
        return this
    }
}

/**
 * Create a new `IntegerType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $integer
 *
 * $integer()
 *
 * $integer({maximum: 3.15})
 * ```
 *
 * @param options - Additional options to pass to the integer.
 *
 * @group Primitives
 */
export function $integer(options: SchemaOptions<Partial<IntegerOptions>, number> = {}): IntegerType {
    return new IntegerType(options)
}
