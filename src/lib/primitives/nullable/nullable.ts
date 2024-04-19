import type { Node } from '../../cst/node.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'

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
export function $nullable<T extends Node>(literal: ConstExpr<T>): T {
    const subNode = evaluate(literal)
    return subNode.nullable() as T
}
