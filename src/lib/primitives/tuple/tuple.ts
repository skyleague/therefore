import type { CstNode, CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import type { RequireKeys } from '@skyleague/axioms'
import { evaluate, entriesOf, isArray } from '@skyleague/axioms'

export interface TupleOptions {}

export type TupleType = CstNode<'tuple', TupleOptions, unknown, Omit<CstNode, 'name'>[] | RequireKeys<CstNode, 'name'>[]>

export function $tuple(items: CstSubNode[] | Record<string, CstSubNode>, options: SchemaOptions<TupleOptions> = {}): TupleType {
    return cstNode(
        'tuple',
        options,
        isArray(items) ? items.map(evaluate) : entriesOf(items).map(([name, node]) => ({ name, ...evaluate(node) }))
    )
}
