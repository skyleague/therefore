import { isNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectOptions, ObjectShape, ObjectType } from '../object/object.js'
import { $object } from '../object/object.js'

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
 * @deprecated
 */
export function $headers(properties: ObjectShape | ObjectType, options?: SchemaOptions<ObjectOptions>) {
    // biome-ignore lint/suspicious/noExplicitAny: we dont really care about inferrence here
    return (isNode(properties) ? properties : $object(properties, options as any)).strict(false).validator({
        coerce: true,
    })
}
