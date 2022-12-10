import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'
import type { ObjectType } from '../object/object'
import type { RefType } from '../ref/ref'

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
