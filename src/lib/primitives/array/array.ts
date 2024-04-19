/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'

import { type ArrayGenerator, type ConstExpr, evaluate } from '@skyleague/axioms'

export interface ArrayOptions {
    /**
     * The minimum amount of items this array has.
     */
    minItems?: number | undefined
    /**
     * The maximum amount of items this array has.
     */
    maxItems?: number | undefined
    /**
     * Checks whether all items are unique.
     */
    set?: boolean | undefined

    arbitrary?: Partial<ArrayGenerator<unknown, number>> | undefined
}

export class ArrayType<Element extends Node = Node> extends Node {
    public override children: [Node]
    public override type = 'array' as const

    public options: ArrayOptions = {}
    public element: Node

    public declare infer: Element['infer'][]

    public override isCommutative = false
    public constructor(items: ConstExpr<Element>, options: SchemaOptions<ArrayOptions, Element['infer']>) {
        super(options)
        this.element = evaluate(items)
        this.children = [this.element]
        this.options = options
    }

    public arbitrary(options: Partial<ArrayGenerator<Element['infer'], number>>) {
        this.options.arbitrary ??= {}
        this.options.arbitrary = { ...this.options.arbitrary, ...options }
        return this
    }

    public minItems(minItems: number) {
        this.options.minItems = minItems
        return this
    }

    public nonempty() {
        this.options.minItems = 1
        return this
    }

    public maxItems(maxItems: number) {
        this.options.maxItems = maxItems
        return this
    }

    public set() {
        this.options.set = true
        return this
    }
}

export interface ArrayType extends Node, NodeTrait {}

/**
 * Create a new `ArrayType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $array($integer)
 *
 * $array($boolean())
 * ```
 *
 * @param items - The items on this array.
 * @param options - Additional options to pass to the array.
 *
 * @group Primitives
 */
export function $array<E extends Node = Node>(
    items: ConstExpr<E>,
    options: SchemaOptions<ArrayOptions, E['infer'][]> = {},
): ArrayType<E> {
    return new ArrayType(items, options)
}
