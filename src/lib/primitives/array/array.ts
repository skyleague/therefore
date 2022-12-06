import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { evaluate } from '@skyleague/axioms'

export interface ArrayOptions {
    minItems?: number
    maxItems?: number
    uniqueItems?: boolean
}

export type ArrayType = ThereforeNode<'array', ArrayOptions, unknown, [ThereforeNode]>

export function $array(items: ThereforeExpr, options: SchemaOptions<ArrayOptions> = {}): ArrayType {
    return cstNode('array', options, [evaluate(items)])
}
