import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { evaluate } from '@skyleague/axioms'

export interface UnionOptions {}

export type UnionType = ThereforeNode<'union', UnionOptions, unknown, ThereforeNode[]>

export function $union(union: ThereforeExpr[], options: SchemaOptions<UnionOptions> = {}): UnionType {
    return cstNode('union', options, union.map(evaluate))
}
