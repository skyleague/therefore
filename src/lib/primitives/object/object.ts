import type { CstNode, CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import type { Dict, RequireKeys } from '@skyleague/axioms'
import { valuesOf, evaluate, omit, omitUndefined, all, entriesOf, isObject } from '@skyleague/axioms'

export type ObjectPropertiesArg = Record<string, CstSubNode>

export interface ObjectOptions {
    /** @deprecated */
    minProperties?: number
    /** @deprecated */
    maxProperties?: number
    indexSignature?: CstNode | undefined
    indexPatterns?: Record<string, CstNode>
}

type LazyObjectOptions = Omit<ObjectOptions, 'indexSignature'> & {
    indexSignature?: CstSubNode
}

export type ObjectType = CstNode<'object', ObjectOptions, unknown, RequireKeys<CstNode, 'name'>[]>

export function isCombinedDefinition(
    x?: Dict | (SchemaOptions<LazyObjectOptions> & { properties: ObjectPropertiesArg })
): x is SchemaOptions<LazyObjectOptions> & { properties: ObjectPropertiesArg } {
    return (
        x !== undefined &&
        'properties' in x &&
        !all(valuesOf(x), (v) => isObject(v) && 'type' in v && 'uuid' in v && 'value' in v && 'description' in v)
    )
}

export function $object(properties: SchemaOptions<LazyObjectOptions> & { properties: ObjectPropertiesArg }): ObjectType
export function $object(properties: ObjectPropertiesArg, options?: SchemaOptions<LazyObjectOptions>): ObjectType
export function $object(
    properties?: ObjectPropertiesArg | (SchemaOptions<LazyObjectOptions> & { properties: ObjectPropertiesArg }),
    options: SchemaOptions<LazyObjectOptions> = {}
): ObjectType {
    if (isCombinedDefinition(properties)) {
        return cstNode(
            'object',
            omitUndefined({ ...omit(properties, ['properties']), indexSignature: evaluate(properties.indexSignature) }),
            entriesOf(properties.properties).map(([name, node]) => ({ name, ...evaluate(node) }))
        )
    }
    return cstNode(
        'object',
        omitUndefined({ ...options, indexSignature: evaluate(options.indexSignature) }),
        entriesOf(properties ?? {}).map(([name, node]) => ({ name, ...evaluate(node) }))
    )
}
