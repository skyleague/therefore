import type { UnknownGenerator } from '@skyleague/axioms'
import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

export interface UnknownOptions {
    /**
     * Restrict the unknown values to json values
     */
    restrictToJson: boolean | undefined

    arbitrary?: Partial<UnknownGenerator> | undefined
}

export class UnknownType extends NodeTrait {
    public override _type = 'unknown' as const

    public _options: UnknownOptions

    public constructor({ restrictToJson = false, ...options }: SchemaOptions<Partial<UnknownOptions>>) {
        super(options)
        this._options = { restrictToJson, ...options }
    }

    public arbitrary(options: Partial<UnknownGenerator>) {
        this._options.arbitrary ??= {}
        this._options.arbitrary = { ...this._options.arbitrary, ...options }
        return this
    }
}

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
export function $unknown(options: SchemaOptions<Partial<UnknownOptions>> = {}): UnknownType {
    return new UnknownType(options)
}
