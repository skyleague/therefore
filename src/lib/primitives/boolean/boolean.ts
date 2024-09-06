import { NodeTrait } from '../../cst/mixin.js'
import type { SchemaOptions } from '../base.js'

export type BooleanOptions = object

export class BooleanType extends NodeTrait {
    public override _type = 'boolean' as const

    public _options: BooleanOptions = {}

    public declare infer: boolean
    public declare input: boolean

    public constructor(options: SchemaOptions<BooleanOptions>) {
        super(options)
        this._options = options
    }
}

/**
 * Create a new `BooleanType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $boolean
 *
 * $boolean()
 * ```
 *
 * @param options - Additional options to pass to the boolean.
 *
 * @group Primitives
 */
export function $boolean(options: SchemaOptions<BooleanOptions, boolean> = {}): BooleanType {
    return new BooleanType(options)
}
