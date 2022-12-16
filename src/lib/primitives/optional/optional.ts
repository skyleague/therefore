import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'

import { evaluate, omitUndefined } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

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
export function $optional(literal: ThereforeExpr, value: 'explicit' | 'implicit' = 'implicit'): ThereforeNode {
    const subNode = evaluate(literal)
    return {
        ...subNode,
        uuid: uuid(),
        description: omitUndefined({
            ...subNode.description,
            optional: value,
        }),
    }
}
