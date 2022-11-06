import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'
import type { ObjectType } from '../object/object'
import type { AsyncRefType } from '../ref/ref'

import { evaluate } from '@skyleague/axioms'

export interface IntersectionOptions {}

export type IntersectionType = CstNode<'intersection', IntersectionOptions, unknown, (AsyncRefType | ObjectType)[]>

export function $intersection(
    intersection: (AsyncRefType | ObjectType)[],
    options: SchemaOptions<IntersectionOptions> = {}
): IntersectionType {
    return cstNode('intersection', options, intersection.map(evaluate))
}
