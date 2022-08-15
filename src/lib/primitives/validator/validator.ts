import type { CstNode, CstSubNode } from '../../cst/cst'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export function $validator(node: CstSubNode): CstNode {
    const evaluatedNode = evaluate(node)
    return {
        ...evaluatedNode,
        uuid: uuid(),
        description: {
            ...evaluatedNode.description,
            generateValidator: true,
        },
    }
}
