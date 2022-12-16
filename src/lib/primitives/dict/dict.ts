import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { evaluate } from '@skyleague/axioms'

export interface DictOptions {}

export type DictType = ThereforeNode<'dict', DictOptions, unknown, [ThereforeNode]>

export function $dict(items: ThereforeExpr, options: SchemaOptions<DictOptions> = {}): DictType {
    return cstNode('dict', options, [evaluate(items)])
}
