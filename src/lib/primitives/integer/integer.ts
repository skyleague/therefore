import type { IntegerGenerator } from '@skyleague/axioms'
import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

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
    public override _type = 'integer' as const

    public _options: IntegerOptions
    public declare infer: number
    public declare input: number

    public constructor({ minInclusive = true, maxInclusive = true, ...options }: SchemaOptions<Partial<IntegerOptions>>) {
        super(options)
        this._options = {
            minInclusive,
            maxInclusive,
            ...options,
        }
    }

    public arbitrary(options: Partial<IntegerGenerator>) {
        this._options.arbitrary ??= {}
        this._options.arbitrary = { ...this._options.arbitrary, ...options }
        return this
    }

    public gt(value: number) {
        this._options.min = value
        this._options.minInclusive = false
        return this
    }

    public gte(value: number) {
        this._options.min = value
        this._options.minInclusive = true
        return this
    }

    public lt(value: number) {
        this._options.max = value
        this._options.maxInclusive = false
        return this
    }

    public lte(value: number) {
        this._options.max = value
        this._options.maxInclusive = true
        return this
    }

    public positive() {
        this._options.min = 0
        this._options.minInclusive = false
        return this
    }

    public nonnegative() {
        this._options.min = 0
        this._options.minInclusive = true
        return this
    }

    public negative() {
        this._options.max = 0
        this._options.maxInclusive = false
        return this
    }

    public nonpositive() {
        this._options.max = 0
        this._options.maxInclusive = true
        return this
    }

    public multipleOf(value: number) {
        this._options.multipleOf = value
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
