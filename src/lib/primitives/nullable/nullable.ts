import type { ThereforeNode, ThereforeExpr } from '../../cst/cst.js'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

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
export function $nullable(literal: ThereforeExpr): ThereforeNode {
    const subNode = evaluate(literal)
    return {
        ...subNode,
        uuid: uuid(),
        description: {
            ...subNode.description,
            nullable: true,
        },
    }
}
