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
    public override type = 'tuple' as const
    public declare children: Node[]
    public override isCommutative = false

    public options: TupleOptions<Rest> = {}

    public elements: Omit<Node, 'name'>[]
    public declare infer: Rest extends { infer: unknown }
        ? [...TupleToInfer<Elements>, ...Rest['infer'][]]
        : TupleToInfer<Elements>

    public constructor(elements: ConstExprTuple<Elements>, options: SchemaOptions<TupleOptions<Rest>, TupleToInfer<Elements>>) {
        super(options)
        this.options = options
        this.elements = elements.map(evaluate)
        this.children = [...this.elements]
        if (options.rest) {
            this.children.push(evaluate(options.rest))
        }
    }

    public rest<T extends Node>(rest: ConstExpr<T>): TupleType<Elements, T> {
        const clone = Node.clone(this) as unknown as TupleType<Elements, T>
        clone.options.rest = evaluate(rest)
        clone.children = [...this.elements, this.options.rest] as unknown as typeof this.children
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
