import type { CstNode, CstSubNode } from '../../cst/cst'

import { evaluate, omitUndefined } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export function $optional(literal: CstSubNode, value: 'explicit' | 'implicit' = 'implicit'): CstNode {
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
