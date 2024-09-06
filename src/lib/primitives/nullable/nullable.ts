import { type ConstExpr, evaluate } from '@skyleague/axioms'
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

export class NullableType<T extends Node = Node> extends Node {
    public override _type = 'nullable' as const
    public override _children: [Node]
    public declare infer: T['infer'] | null
    public declare input: T['input'] | null

    public constructor(item: T, options: SchemaOptions<unknown> = {}) {
        super(options)
        this._children = [item as Node]
        if (this._name === undefined && item._name !== undefined) {
            this._name = item._name
        }
    }

    public unwrap(): T {
        return this._children[0] as T
    }

    public static from<T extends Node>(item: T, options: SchemaOptions<unknown> = {}): NullableType<T> {
        if (item instanceof NullableType) {
            return item as NullableType<T>
        }
        return new NullableType(item, options) as NullableType<T>
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
    return NullableType.from(subNode)
}
