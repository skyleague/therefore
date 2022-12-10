import type { SchemaOptions } from '../base'
import type { EnumOptions, EnumType } from '../enum'
import { $enum } from '../enum'

import type { Json } from '@skyleague/axioms'

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
export function $const<T extends Json>(value: T, options: SchemaOptions<EnumOptions> = {}): EnumType {
    return $enum<T>([value], options)
}
