import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'
import type { ObjectType } from '../object/object'
import type { RefType } from '../ref/ref'

import { evaluate } from '@skyleague/axioms'

export interface IntersectionOptions {}

export type IntersectionType = CstNode<'intersection', IntersectionOptions, unknown, (ObjectType | RefType)[]>

export function $intersection(
    intersection: (ObjectType | RefType)[],
    options: SchemaOptions<IntersectionOptions> = {}
): IntersectionType {
    return cstNode('intersection', options, intersection.map(evaluate))
}
