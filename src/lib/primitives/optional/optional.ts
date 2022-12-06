import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'

import { evaluate, omitUndefined } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

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
