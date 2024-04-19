import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

import type { UnknownGenerator } from '@skyleague/axioms'

export interface UnknownOptions {
    /**
     * Restrict the unknown values to json values
     */
    restrictToJson: boolean | undefined

    arbitrary?: Partial<UnknownGenerator> | undefined
}

export class UnknownType extends NodeTrait {
    public override type = 'unknown' as const

    public options: UnknownOptions

    public constructor({ restrictToJson = false, ...options }: SchemaOptions<Partial<UnknownOptions>>) {
        super(options)
        this.options = { restrictToJson, ...options }
    }

    public arbitrary(options: Partial<UnknownGenerator>) {
        this.options.arbitrary ??= {}
        this.options.arbitrary = { ...this.options.arbitrary, ...options }
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
