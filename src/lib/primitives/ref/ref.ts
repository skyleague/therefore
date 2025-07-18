import { type ConstExpr, isFunction, isObject } from '@skyleague/axioms'
import type { JsonSchema } from '../../../json.js'
import { isNode } from '../../cst/cst.js'
import type { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { Schema } from '../../types.js'
import type { SchemaOptions } from '../base.js'
import { $jsonschema } from '../jsonschema/jsonschema.js'
import { therefore } from '../therefore.js'
import type { ZodSchema, ZodSchemaAsNode } from '../zod/type.js'
import { $zod } from '../zod/zod.js'
import type { SchemaAsNode } from './node.js'
import type { RefOptions } from './type.js'
import { RefType } from './type.js'

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

export function $ref<Reference extends Node>(
    reference: ConstExpr<Reference>,
    options?: SchemaOptions<RefOptions, Reference['infer']>,
): RefType<Intrinsic<Reference>>
export function $ref<T extends ZodSchema>(reference: T, options?: SchemaOptions<RefOptions>): ZodSchemaAsNode<T>
export function $ref<T>(reference: Schema<T>, options?: SchemaOptions<RefOptions>): SchemaAsNode<T>
export function $ref<const Reference extends Node, T extends ZodSchema>(
    reference: ConstExpr<Reference> | Schema<unknown>,
    options: SchemaOptions<RefOptions, Reference['infer']> = {},
): RefType<Intrinsic<Reference>> | Promise<RefType<NodeTrait & { infer: unknown }>> | ZodSchemaAsNode<T> | SchemaAsNode<T> {
    if (isObject(reference)) {
        if ('is' in reference && isFunction(reference.is) && !('_def' in reference)) {
            return $jsonschema(reference.schema as JsonSchema, options) as unknown as SchemaAsNode<T>
        }
        if (!isNode(reference)) {
            if ('_def' in reference) {
                // biome-ignore lint/suspicious/noExplicitAny: just roll with it
                return $zod(reference as any, { ...(therefore.zodCache && { cache: therefore.zodCache }) }) as any
            }
            throw new Error('Unsupported reference')
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: just roll with it
    return RefType._from(reference as ConstExpr<Reference>, options) as any
}
