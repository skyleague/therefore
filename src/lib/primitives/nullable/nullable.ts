import { type ConstExpr, evaluate } from '@skyleague/axioms'
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

export class NullableType<T extends Node = Node> extends Node {
    public override _type = 'nullable' as const
    public override _children: [Node]
    public declare infer: T['infer'] | null

    public constructor(item: T, options: SchemaOptions<unknown> = {}) {
        super(options)
        this._children = [item as Node]
    }

    public unwrap(): T {
        return this._children[0] as T
    }
}
export interface NullableType extends Node, NodeTrait {}

/**
 * Create a new `ThereforeNode` instance with the given options.
 *
 * ### Example
 * ```ts
 * $object({
 *   foo: $nullable($string)
 * })
 * ```
 *
 * @param literal - The schema to make a nullable property.
 *
 * @group Modifiers
 */
export function $nullable<T extends Node>(literal: ConstExpr<T>): NullableType<T> {
    const subNode = evaluate(literal)
    return new NullableType(subNode)
}
