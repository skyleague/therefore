import type { JsonValue } from '@skyleague/axioms/types'
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

export type ConstOptions = object

export class ConstType<T = unknown> extends Node {
    public override _type = 'const' as const
    public _options: ConstOptions = {}
    public const: unknown

    public declare infer: T

    public constructor(value: unknown, options: SchemaOptions<ConstOptions>) {
        super(options)
        this._options = options
        this.const = value
    }
}

export interface ConstTyp extends Node, NodeTrait {}

/**
 * Create a new `EnumType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $const(1)
 *
 * $const("foobar")
 * ```
 *
 * @param options - Additional options to pass to the constant.
 *
 * @group Primitives
 */
export function $const<T extends JsonValue | undefined>(value: T, options: SchemaOptions<ConstOptions> = {}): ConstType<T> {
    return new ConstType(value, options)
}
