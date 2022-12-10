import type { ThereforeNode } from '../../cst/cst'
import { isThereforeNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'
import type { LazyObjectOptions, ObjectPropertiesArg } from '../object/object'
import { $object } from '../object/object'
import { $validator } from '../validator/validator'

/**
 * Create a new headers instance with the given options.
 *
 * ### Example
 * ```ts
 * $headers({
 *   foo: $string
 *   bar: $integer
 * })
 * ```
 *
 * @param properties - Key value pairs that define the headers object.
 * @param options - Additional options to pass to the headers.
 *
 * @group HTTP
 */
export function $headers(properties: ObjectPropertiesArg | ThereforeNode, options?: SchemaOptions<LazyObjectOptions>) {
    const validator = $validator(
        isThereforeNode(properties) ? properties : $object(properties, { additionalProperties: true, ...options })
    )
    validator.description.ajvOptions = { ...validator.description.ajvOptions, coerceTypes: true }
    return validator
}
