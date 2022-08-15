import type { CstNode, CstSubNode } from '../../cst/cst'

import { evaluate } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export function $nullable(literal: CstSubNode): CstNode<string, unknown, unknown, unknown[]> {
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
