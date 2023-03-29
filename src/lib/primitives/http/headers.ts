import type { ThereforeNode } from '../../cst/cst.js'
import { isThereforeNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'
import type { LazyObjectOptions, ObjectPropertiesArg } from '../object/object.js'
import { $object } from '../object/object.js'
import { $validator } from '../validator/validator.js'

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
