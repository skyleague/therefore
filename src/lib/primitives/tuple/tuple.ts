import { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

import type { ConstExpr } from '@skyleague/axioms'
import { evaluate } from '@skyleague/axioms'

type TupleToInfer<Elements extends Node[]> = {
    [K in keyof Elements]: Elements[K]['infer']
}
type ConstExprTuple<Elements extends [...Node[]]> = {
    [K in keyof Elements]: ConstExpr<Elements[K]>
}

export interface TupleOptions<Rest extends Node | undefined = undefined> {
    rest?: Rest
}

export class TupleType<
    const Elements extends [Node, ...Node[]] = [Node, ...Node[]],
    Rest extends Node | undefined = undefined,
> extends NodeTrait {
    public override _type = 'tuple' as const
    public declare _children: Node[]
    public override _isCommutative = false

    public _options: TupleOptions<Rest> = {}
    public items: Node[]

    public declare infer: Rest extends { infer: unknown }
        ? [...TupleToInfer<Elements>, ...Rest['infer'][]]
        : TupleToInfer<Elements>

    public constructor(elements: ConstExprTuple<Elements>, options: SchemaOptions<TupleOptions<Rest>, TupleToInfer<Elements>>) {
        super(options)
        this._options = options
        this.items = elements.map(evaluate)
        this._children = [...this.items]
        if (options.rest) {
            this._children.push(evaluate(options.rest))
        }
    }

    public rest<T extends Node>(rest: ConstExpr<T>): TupleType<Elements, T> {
        const clone = Node._clone(this) as unknown as TupleType<Elements, T>
        clone._options.rest = evaluate(rest)
        clone._children = [...this.items, this._options.rest] as unknown as typeof this._children
        return clone
    }
}

/**
 * Create a new `TupleType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $tuple([$integer, $string])
 * ```
 *
 * @param items - The items in the tuple.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Primitives
 */
export function $tuple<const Elements extends [Node, ...Node[]] = [Node, ...Node[]], Rest extends Node | undefined = undefined>(
    items: ConstExprTuple<Elements>,
    options: SchemaOptions<TupleOptions<Rest>, TupleToInfer<Elements>> = {},
): TupleType<Elements, Rest> {
    return new TupleType<Elements, Rest>(items, options)
}
