import type { ThereforeNode } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectType } from '../object/object.js'
import type { RefType } from '../ref/ref.js'

import { evaluate } from '@skyleague/axioms'

export interface IntersectionOptions {}

export type IntersectionType = ThereforeNode<'intersection', IntersectionOptions, unknown, (ObjectType | RefType)[]>

/**
 * Create a new `IntersectionType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $intersection([$object({foo: $integer}), $object({bar: $string}])
 * ```
 *
 * @param intersection - The items in the intersection.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Primitives
 */
export function $intersection(
    intersection: (ObjectType | RefType)[],
    options: SchemaOptions<IntersectionOptions> = {}
): IntersectionType {
    return cstNode('intersection', options, intersection.map(evaluate))
}
