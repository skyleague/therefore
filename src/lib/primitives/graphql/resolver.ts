import { $field } from './field.js'

import type { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'
import type { ObjectType } from '../object/object.js'

export type ResolverOptions = object
export interface ResolverArgs {
    args?: ObjectType | undefined
    type: Node
}

export function $resolver(root: ObjectType, fieldName: string, options: SchemaOptions<ResolverOptions> & ResolverArgs) {
    const { args, type } = options
    const field = $field({ type, args })
    root.shape[fieldName] = field
    root._children.push(field)
    return field
}
