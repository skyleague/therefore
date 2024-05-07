import type { RefOptions } from './type.js'
import { RefType } from './type.js'

import type { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { Schema } from '../../types.js'
import type { SchemaOptions } from '../base.js'
import { $jsonschema } from '../jsonschema/jsonschema.js'

import { type ConstExpr, isFunction, isObject } from '@skyleague/axioms'
import { toJSONSchema } from '@typeschema/all'
import type { Infer, Schema as TypeSchema } from '@typeschema/all'
import type { JsonSchema } from '../../../json.js'
import { isNode } from '../../cst/cst.js'

/**
 * Create a new `RefType` instance with the given options.
 *
 * ### Example
 * ```ts
 * const foo = $number()
 * $ref(foo)
 *
 * $ref(["foobar", foo])
 * ```
 *
 * @param reference - The schema to reference.
 * @param options - Additional options to pass to the number.
 *
 * @group Primitives
 */

export function $ref<T>(reference: Schema<T>, options?: SchemaOptions<RefOptions>): RefType<NodeTrait & { infer: T }>
export function $ref<const Reference extends Node>(
    reference: ConstExpr<Reference>,
    options?: SchemaOptions<RefOptions, Reference['infer']>,
): RefType<Intrinsic<Reference>>
export function $ref<T extends TypeSchema>(
    reference: T,
    options?: SchemaOptions<RefOptions>,
): Promise<RefType<NodeTrait & { infer: Infer<T> }>>
export function $ref<const Reference extends Node>(
    reference: ConstExpr<Reference> | Schema<unknown> | TypeSchema,
    options: SchemaOptions<RefOptions, Reference['infer']> = {},
): RefType<Intrinsic<Reference>> | Promise<RefType<NodeTrait & { infer: unknown }>> {
    if (isObject(reference)) {
        if ('is' in reference && isFunction(reference.is)) {
            return $jsonschema(reference.schema as JsonSchema, options) as RefType<Intrinsic<Reference>>
        }
        if (!isNode(reference)) {
            // biome-ignore lint/suspicious/noExplicitAny: just roll with it
            return toJSONSchema(reference).then((schema) => $jsonschema(schema as any, options)) as Promise<
                RefType<NodeTrait & { infer: unknown }>
            >
        }
    }

    return RefType.from(reference as ConstExpr<Reference>, options)
}
