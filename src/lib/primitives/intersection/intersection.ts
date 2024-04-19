import { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectType } from '../object/object.js'

import { type SimplifyOnce, type UnionToIntersection, evaluate } from '@skyleague/axioms'

export type IntersectionOptions = object

export class IntersectionType<const Elements extends Node[] = Node[]> extends NodeTrait {
    public override type = 'intersection' as const
    public override children: Node[]
    public override isCommutative = false

    public options: IntersectionOptions = {}

    public declare infer: SimplifyOnce<UnionToIntersection<Elements[number]['infer']>>
    public declare intrinsic: Intrinsic<Elements[number]>

    public constructor(
        intersection: Node[],
        options: SchemaOptions<IntersectionOptions, UnionToIntersection<Elements[number]['infer']>>,
    ) {
        super(options)
        this.options = options
        this.children = intersection.map(evaluate)
    }
}

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
export function $intersection<const Elements extends ((Node & { intrinsic: ObjectType }) | ObjectType)[]>(
    intersection: Elements,
    options: SchemaOptions<IntersectionOptions, UnionToIntersection<Elements[number]['infer']>> = {},
): IntersectionType<Elements> {
    return new IntersectionType(intersection, options)
}
