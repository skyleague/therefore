import type { CstNode, CstSubNode } from '../../cst/cst'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export interface ValidatorOptions {
    assert: boolean
}

export function $validator(node: CstSubNode, { assert = true }: Partial<ValidatorOptions> = {}): CstNode {
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
    }
}
