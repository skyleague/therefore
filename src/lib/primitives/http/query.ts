import type { ThereforeNode } from '../../cst/cst.js'
import { isThereforeNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'
import type { LazyObjectOptions, ObjectPropertiesArg } from '../object/object.js'
import { $object } from '../object/object.js'
import { $validator } from '../validator/validator.js'

/**
 * Create a new query parameters instance with the given options.
 *
 * ### Example
 * ```ts
 * $query({
 *   foo: $string
 *   bar: $integer
 * })
 * ```
 *
 * @param properties - Key value pairs that define the query parameters object.
 * @param options - Additional options to pass to the query parameters.
 *
 * @group HTTP
 */
export function $query(properties: ObjectPropertiesArg | ThereforeNode, options?: SchemaOptions<LazyObjectOptions>) {
    const validator = $validator(
        isThereforeNode(properties) ? properties : $object(properties, { additionalProperties: true, ...options })
    )
    validator.description.ajvOptions = { ...validator.description.ajvOptions, coerceTypes: true }
    return validator
}
