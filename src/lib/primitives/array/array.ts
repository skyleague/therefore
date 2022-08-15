import type { CstNode, CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { evaluate } from '@skyleague/axioms'

export interface ArrayOptions {
    minItems?: number
    maxItems?: number
    uniqueItems?: boolean
}

export type ArrayType = CstNode<'array', ArrayOptions, unknown, [CstNode]>

export function $array(items: CstSubNode, options: SchemaOptions<ArrayOptions> = {}): ArrayType {
    return cstNode('array', options, [evaluate(items)])
}
