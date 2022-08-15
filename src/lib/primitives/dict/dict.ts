import type { CstNode, CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { evaluate } from '@skyleague/axioms'

export interface DictOptions {}

export type DictType = CstNode<'dict', DictOptions, unknown, [CstNode]>

export function $dict(items: CstSubNode, options: SchemaOptions<DictOptions> = {}): DictType {
    return cstNode('dict', options, [evaluate(items)])
}
