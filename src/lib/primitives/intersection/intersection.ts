import { evaluate } from '@skyleague/axioms'
import type { Simplify, UnionToIntersection } from '@skyleague/axioms/types'
import { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectType } from '../object/object.js'

export type IntersectionOptions = object

export class IntersectionType<const Elements extends Node[] = Node[]> extends NodeTrait {
    public override _type = 'intersection' as const
    public override _children: Node[]
    public override _isCommutative = false

    public _options: IntersectionOptions = {}

    public declare infer: Simplify<UnionToIntersection<Elements[number]['infer']>>
    public declare input: Simplify<UnionToIntersection<Elements[number]['input']>>
    public declare intrinsic: Intrinsic<Elements[number]>

    public constructor(
        intersection: Node[],
        options: SchemaOptions<IntersectionOptions, UnionToIntersection<Elements[number]['infer']>>,
    ) {
        super(options)
        this._options = options
        this._children = intersection.map(evaluate)
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
