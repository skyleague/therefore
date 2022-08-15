import type { CstNode, CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { evaluate } from '@skyleague/axioms'

export interface UnionOptions {}

export type UnionType = CstNode<'union', UnionOptions, unknown, CstNode[]>

export function $union(union: CstSubNode[], options: SchemaOptions<UnionOptions> = {}): UnionType {
    return cstNode('union', options, union.map(evaluate))
}
