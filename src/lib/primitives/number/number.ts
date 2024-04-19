import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

import type { FloatGenerator } from '@skyleague/axioms'

export interface NumberOptions {
    /**
     * The resulting property will only be valid when the value divided by this parameter
     * results in a strict integer. (exluding zero)
     *
     * ### Example
     * Given `$integer({multipleOf: 0.2})`
     *
     *  - input: 10 -> 10 / 0.2 = 50 (validates)
     *  - input: 10.5 -> 10.5 / 0.2 = 52.5 (invalid)
     */
    multipleOf?: number | undefined

    /**
     * A number is valid if the value is lower than or equal to the parameter.
     *
     * ### Example
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
     * ### Example
     * Given `$integer({minimum: 1.0})`
     *
     *  - input: 0 (invalid)
     *  - input: 1 (validates)
     */
    min?: number | undefined
    minInclusive: boolean

    arbitrary?: Partial<FloatGenerator> | undefined
}

export class NumberType extends NodeTrait {
    public override type = 'number' as const
    public options: NumberOptions

    public declare infer: number

    public constructor({ minInclusive = true, maxInclusive = true, ...options }: SchemaOptions<Partial<NumberOptions>>) {
        super(options)
        this.options = {
            minInclusive,
            maxInclusive,
            ...options,
        }
    }

    public arbitrary(options: Partial<FloatGenerator>) {
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
 * Create a new `NumberType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $number
 *
 * $number()
 *
 * $number({maximum: 3.15})
 * ```
 *
 * @param options - Additional options to pass to the number.
 *
 * @group Primitives
 */
export function $number(options: SchemaOptions<Partial<NumberOptions>, number> = {}): NumberType {
    return new NumberType(options)
}
