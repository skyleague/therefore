import { isNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectOptions, ObjectShape, ObjectType } from '../object/object.js'
import { $object } from '../object/object.js'

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
 * @deprecated
 */
export function $query(properties: ObjectShape | ObjectType, options?: SchemaOptions<ObjectOptions>) {
    // biome-ignore lint/suspicious/noExplicitAny: we dont really care about inferrence here
    return (isNode(properties) ? properties : $object(properties, options as any)).strict(false).validator({
        coerce: true,
    })
}
