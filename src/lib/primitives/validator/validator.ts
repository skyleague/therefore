import type { ThereforeExpr } from '../../cst/cst'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export interface ValidatorOptions {
    assert: boolean
}

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
