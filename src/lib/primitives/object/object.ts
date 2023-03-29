import type { ThereforeNode, ThereforeExpr } from '../../cst/cst.js'
import { cstNode } from '../../cst/cst.js'
import type { SchemaOptions } from '../base.js'

import type { Dict, RequireKeys } from '@skyleague/axioms'
import { valuesOf, evaluate, omit, omitUndefined, all, entriesOf, isObject } from '@skyleague/axioms'

export type ObjectPropertiesArg = Record<string, ThereforeExpr>

export interface ObjectOptions {
    /** @deprecated */
    minProperties?: number
    /** @deprecated */
    maxProperties?: number
    indexSignature?: ThereforeNode | undefined
    indexPatterns?: Record<string, ThereforeNode>
    additionalProperties?: boolean
    defaults?: {
        additionalProperties?: boolean
    }
}

export type LazyObjectOptions = Omit<ObjectOptions, 'indexSignature'> & {
    indexSignature?: ThereforeExpr
}

export type ObjectType = ThereforeNode<'object', ObjectOptions, unknown, RequireKeys<ThereforeNode, 'name'>[]>

export function isCombinedDefinition(
    x?: Dict | (SchemaOptions<LazyObjectOptions> & { properties: ObjectPropertiesArg })
): x is SchemaOptions<LazyObjectOptions> & { properties: ObjectPropertiesArg } {
    return (
        x !== undefined &&
        'properties' in x &&
        !all(valuesOf(x), (v) => isObject(v) && 'type' in v && 'uuid' in v && 'value' in v && 'description' in v)
    )
}

/**
 * Create a new `ObjectType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $object({
 *   foo: $string
 *   bar: $integer
 * })
 * ```
 *
 * @param properties - Key value pairs that define the object.
 * @param options - Additional options to pass to the number.
 *
 * @group Primitives
 */
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
