import type { Node } from '../../cst/node.js'

import { evaluate } from '@skyleague/axioms'

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
export function $optional<T extends Node>(literal: T | (() => T)): T {
    const subNode = evaluate(literal)
    return subNode.optional() as T
}
