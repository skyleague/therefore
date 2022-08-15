import type { CstNode, CstSubNode } from '../../cst/cst'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export function $optional(literal: CstSubNode): CstNode<string, unknown, unknown, unknown[]> {
    const subNode = evaluate(literal)
    return {
        ...subNode,
        uuid: uuid(),
        description: {
            ...subNode.description,
            optional: true,
        },
    }
}
