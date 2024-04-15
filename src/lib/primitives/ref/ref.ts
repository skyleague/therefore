import type { RefOptions } from './type.js'
import { RefType } from './type.js'

import type { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { Schema } from '../../types.js'
import type { SchemaOptions } from '../base.js'
import { $jsonschema } from '../jsonschema/jsonschema.js'

import { type ConstExpr, isFunction } from '@skyleague/axioms'
import type { JsonSchema } from '../../../json.js'

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
export function $ref<const Reference extends Node>(
    reference: ConstExpr<Reference> | Schema<unknown>,
    options: SchemaOptions<RefOptions, Reference['infer']> = {},
): RefType<Intrinsic<Reference>> {
    if ('is' in reference && isFunction(reference.is)) {
        return $jsonschema(reference.schema as JsonSchema, options) as RefType<Intrinsic<Reference>>
    }
    return RefType.from(reference as ConstExpr<Reference>, options)
}
