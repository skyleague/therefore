import { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import type { SchemaOptions } from '../base.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'

export type UnionOptions = object

type ToInfer<Elements extends Node[]> = {
    [K in keyof Elements]: Elements[K]['infer']
}

type ToInput<Elements extends Node[]> = {
    [K in keyof Elements]: Elements[K]['input']
}
type ConstExprTuple<Elements extends [...Node[]]> = {
    [K in keyof Elements]: ConstExpr<Elements[K]>
}
type _TupleElements<Elements extends [...ConstExpr<Node>[]]> = {
    [K in keyof Elements]: Elements[K] extends Node ? Elements[K] : never
}
export type TupleElements<Elements extends [...ConstExpr<Node>[]]> = _TupleElements<{
    // biome-ignore lint/suspicious/noExplicitAny: this needs to be any to match correctly
    [K in keyof Elements]: Elements[K] extends (...args: any[]) => infer R ? R : Elements[K]
}>

export class UnionType<const Elements extends [...Node[]] = Node[]> extends NodeTrait {
    public override _type = 'union' as const
    public override _children: Node[]
    public override _isCommutative = false
    public _options: UnionOptions = {}
    public declare infer: ToInfer<Elements>[number]
    public declare input: ToInput<Elements>[number]
    public declare intrinsic: Intrinsic<Elements[number]>

    protected declare _discriminator?: string | undefined

    public constructor(union: ConstExprTuple<Elements>, options: SchemaOptions<UnionOptions, ToInfer<Elements>[number]>) {
        super(options)
        this._options = options
        this._children = union.map((x) => evaluate(x)) as unknown as Node[]
    }

    public get options() {
        return this._children
    }
}

export class DiscriminatedUnionType<const Elements extends [...Node[]] = Node[]> extends UnionType<Elements> {
    public declare _discriminator?: string
}

/**
 * Create a new `UnionType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $union([$integer, $string])
 *
 * $union([$object({foo: $integer}), $object({bar: $string}])
 * ```
 *
 * @param union - The items in the union.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Primitives
 */
export function $union<const Elements extends [...ConstExpr<Node>[]]>(
    union: Elements,
    options: SchemaOptions<UnionOptions, NoInfer<ToInfer<TupleElements<Elements>>[number]>> = {},
): UnionType<TupleElements<Elements>> {
    return new UnionType<TupleElements<Elements>>(union as ConstExprTuple<TupleElements<Elements>>, options)
}
