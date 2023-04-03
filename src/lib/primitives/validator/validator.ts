import type { ThereforeExpr } from '../../cst/cst.js'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export interface ValidatorOptions {
    /**
     * Toggles whether an assert function should be generated.
     *
     * @defaultvalue true
     */
    assert: boolean
}

/**
 * Enable the generation of validator code to this schema.
 *
 * ### Example
 * ```ts
 * $validator(
 *   $object({
 *       foo: $string,
 *   })
 * )
 * ```
 *
 * @param node - The schema to enable the validator for.
 * @param options - The validator options.
 *
 * @group Modifiers
 */
export function $validator<Node extends ThereforeExpr>(node: Node, { assert = true }: Partial<ValidatorOptions> = {}): Node {
    const evaluatedNode = evaluate(node)
    return {
        ...evaluatedNode,
        uuid: uuid(),
        description: {
            ...evaluatedNode.description,
            validator: {
                enabled: true,
                assert,
            },
        },
    } as Node
}
