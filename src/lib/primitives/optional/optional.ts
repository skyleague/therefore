import { evaluate } from '@skyleague/axioms'
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

export class OptionalType<T extends Node = Node> extends Node {
    public override _type = 'optional' as const
    public override _children: [Node]
    public declare infer: T['infer'] | undefined

    public constructor(item: T, options: SchemaOptions<unknown> = {}) {
        super(options)
        this._children = [item as Node]
    }

    public unwrap(): T {
        return this._children[0] as T
    }
}
export interface OptionalType extends Node, NodeTrait {}

/**
 * Create a new `ThereforeNode` instance with the given options.
 *
 * ### Example
 * ```ts
 * $object({
 *   foo: $optional($string)
 * })
 * ```
 *
 * @param literal - The schema to make an optional property.
 * @param value - Controls how the optional value is rendered, where `explict` adds the undefined as a union explicitly.
 *
 * @group Modifiers
 */
export function $optional<T extends Node>(literal: T | (() => T)): OptionalType<T> {
    const subNode = evaluate(literal)
    return new OptionalType(subNode)
}
