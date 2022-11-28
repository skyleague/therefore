import { jsonPointer } from '../../../common/json/json'
import type {
    JsonAnnotations,
    JsonAnyInstance,
    JsonArrayInstance,
    JsonNumericInstance,
    JsonObjectInstance,
    JsonSchema,
    JsonSchema7TypeName,
    JsonStringInstance,
} from '../../../json'
import type { CstNode, CstSubNode } from '../../cst/cst'
import { prepass } from '../../visitor/prepass'
import { $array } from '../array'
import type { SchemaMeta, SchemaOptions } from '../base'
import { descriptionKeys } from '../base'
import { $boolean } from '../boolean'
import { $const } from '../const'
import { $enum } from '../enum'
import { $integer } from '../integer'
import { $intersection } from '../intersection'
import { $number } from '../number'
import type { ObjectType } from '../object'
import { $object } from '../object'
import { $optional } from '../optional'
import { $ref } from '../ref'
import type { AsyncRefType } from '../ref/ref'
import { $string } from '../string'
import type { StringOptions } from '../string'
import { $tuple } from '../tuple'
import type { AyncThereforeCst, ThereforeCst } from '../types'
import { $union } from '../union'
import { $unknown } from '../unknown'

import type { Json, UndefinedFields } from '@skyleague/axioms'
import {
    asyncCollect,
    asyncMap,
    evaluate,
    entriesOf,
    keysOf,
    isArray,
    omitUndefined,
    isBoolean,
    pick,
    omit,
} from '@skyleague/axioms'

function annotate<T = unknown>(doc: JsonAnnotations, context: JsonSchemaContext): SchemaMeta<T> {
    return omitUndefined({
        name: context.name,
        title: doc.title,
        description: doc.description,
        default: doc.default as T,
        readonly: doc.readonly,
        // writeonly?: boolean
        examples: doc.examples as T[],
        deprecated: doc.deprecated,
    })
}

export function retrievePropertiesFromPattern(indexPattern: string) {
    const strPattern = indexPattern.replaceAll('\\', '')
    // check if simple regex
    const [, literal] = strPattern.match(/^\^?\(?([/a-zA-Z0-9/\-_|$@#]+?)\)?\$?$/) ?? []
    if (literal !== undefined && literal.length > 0) {
        const split = literal.split('|')
        const hasStartToken = strPattern.startsWith('^')
        const hasEndToken = strPattern.endsWith('$')
        if (hasStartToken && hasEndToken) {
            return { names: split }
        }
    }
    return { pattern: indexPattern }
}

export async function indexProperties(node: JsonAnnotations & JsonAnyInstance & JsonObjectInstance, context: JsonSchemaContext) {
    let indexSignature: CstNode | undefined = undefined
    let indexPatterns: Record<string, CstNode> | undefined = undefined
    let additionalProperties: boolean | undefined = undefined
    const properties: Record<string, JsonSchema> = {}
    if (node.additionalProperties !== undefined) {
        if (isBoolean(node.additionalProperties)) {
            additionalProperties = node.additionalProperties ? true : undefined
        } else {
            indexSignature = await walkJsonschema({
                node: node.additionalProperties,
                visitor: schemaWalker,
                childProperty: undefined,
                context,
            })
        }
    } else if (context.strict === false) {
        additionalProperties = true
    }

    if (node.patternProperties !== undefined) {
        for (const [pattern, value] of Object.entries(node.patternProperties)) {
            const property = retrievePropertiesFromPattern(pattern)
            if ('pattern' in property) {
                indexPatterns ??= {}
                indexPatterns[pattern] = await walkJsonschema({
                    node: value,
                    visitor: schemaWalker,
                    childProperty: undefined,
                    context,
                })
            } else {
                for (const name of property.names) {
                    properties[name] = value
                }
            }
        }
    }

    return {
        properties,
        additionalProperties,
        indexSignature,
        indexPatterns,
    }
}

type JsonSchemaWalker = Record<
    JsonSchema7TypeName | 'const' | 'enum',
    (
        node: JsonSchema & { type?: JsonSchema['type'] | 'const' | 'enum' },
        context: JsonSchemaContext
    ) => Promise<ThereforeCst> | ThereforeCst
>
const schemaWalker: JsonSchemaWalker = {
    object: async (node: JsonAnnotations & JsonAnyInstance & JsonObjectInstance, context: JsonSchemaContext) => {
        if (
            (node.properties === undefined || keysOf(node.properties).length === 0) &&
            (node.additionalProperties === false ||
                node.additionalProperties === undefined ||
                (isBoolean(node.additionalProperties) && keysOf(node.additionalProperties).length === 0)) &&
            (node.patternProperties === undefined || keysOf(node.patternProperties).length === 0)
        ) {
            return $unknown({ ...annotate(node, context), json: true })
        }
        const { properties, indexSignature, indexPatterns, additionalProperties } = await indexProperties(node, context)
        const mergedProperties = { ...properties, ...node.properties }
        const subSchemas = await asyncCollect(
            asyncMap(
                entriesOf(mergedProperties),
                async ([name, v]) =>
                    [
                        name,
                        await walkJsonschema({
                            node: v,
                            visitor: schemaWalker,
                            childProperty: undefined,
                            context,
                            name: name.toString(),
                        }),
                    ] as const
            )
        )
        return $object({
            properties: Object.fromEntries(
                subSchemas.map(([name, schema]) => {
                    const value = {
                        ...schema,
                    }
                    return [name, node.required?.includes(name.toString()) ? value : $optional(value)]
                })
            ),
            additionalProperties,
            indexSignature,
            indexPatterns,
            ...annotate(node, context),
        })
    },
    array: async (node: JsonAnnotations & JsonAnyInstance & JsonArrayInstance, context: JsonSchemaContext) =>
        $array(await walkJsonschema({ node, visitor: schemaWalker, childProperty: 'items', context }), {
            ...annotate(node, context),
            minItems: node.minItems,
            maxItems: node.maxItems,
            uniqueItems: node.uniqueItems,
        }),
    boolean: (node: JsonAnnotations, context) => $boolean(annotate<boolean>(node, context)),
    integer: (node: JsonAnnotations & JsonNumericInstance, context) =>
        $integer({
            ...annotate<number>(node, context),
            multipleOf: node.multipleOf,
            maximum: node.maximum,
            minimum: node.minimum,
        }),
    null: (node, context) => $const(null, annotate<null>(node, context)),
    number: (node: JsonAnnotations & JsonNumericInstance, context) =>
        $number({
            ...annotate<number>(node, context),
            multipleOf: node.multipleOf,
            maximum: node.maximum,
            minimum: node.minimum,
        }),
    string: (node: JsonAnnotations & JsonStringInstance, context) =>
        $string({
            ...annotate<string>(node, context),
            minLength: node.minLength,
            maxLength: node.maxLength,
            pattern: node.pattern,
            format: node.format as StringOptions['format'],
        }),
    enum: (node: JsonAnnotations & JsonAnyInstance, context) =>
        $enum(node.enum as Json[], {
            ...annotate<string>(node, context),
        }),
    const: (node: JsonAnnotations & JsonAnyInstance, context) =>
        $const(node.const as Json, {
            ...annotate<string>(node, context),
        }),
}

interface JsonSchemaContext {
    strict: boolean
    metaSchemas: Record<string, Promise<JsonSchema>>
    references: Map<string, [name: string, value: () => Promise<CstSubNode>]>
    root: JsonSchema
    cache: Map<string, Promise<AyncThereforeCst>>
    exportAllSymbols: boolean
    name?: string | undefined
    allowIntersectionTypes?: boolean
}

async function walkJsonschema({
    node,
    visitor,
    childProperty,
    name,
    context: maybeContext = {},
}: {
    node: JsonSchema
    visitor: JsonSchemaWalker
    name?: string | undefined
    childProperty?: keyof Pick<JsonSchema, 'items'> | undefined
    context?: SchemaOptions<UndefinedFields<JsonSchemaContext>>
}): Promise<AyncThereforeCst> {
    const {
        metaSchemas = {},
        references = new Map<string, [name: string, value: () => Promise<CstSubNode>]>(),
        root = node,
        cache = new Map<string, Promise<AyncThereforeCst>>(),
        exportAllSymbols = false,
        strict = true,
        allowIntersectionTypes = false,
        ...rest
    } = maybeContext
    const context = {
        metaSchemas,
        references,
        root,
        cache,
        name,
        exportAllSymbols,
        strict,
        ...omit(pick(rest, descriptionKeys), ['name']),
    }
    const child = childProperty !== undefined ? node[childProperty] ?? { type: 'object' } : node

    if (isArray(child)) {
        // tuple json schema definition
        return $tuple(
            await asyncCollect(asyncMap(child, (c) => walkJsonschema({ node: c, visitor, childProperty: undefined, context }))),
            annotate(node, context)
        )
    }
    if (child.enum !== undefined) {
        return visitor['enum'](child, context)
    }
    if (child.const !== undefined) {
        return visitor['const'](child, context)
    }
    const childRef = child.$ref
    if (childRef !== undefined) {
        //solve reference
        if (!references.has(childRef)) {
            const ref = await jsonPointer({ schema: root, ptr: child, metaSchemas })
            if (ref === undefined) {
                throw new Error('invalid json ptr')
            }
            const split = childRef.split('/')
            const refName = split[split.length - 1]

            references.set(childRef, [
                refName,
                async () => {
                    if (cache.has(childRef)) {
                        return cache.get(childRef) as Promise<CstNode>
                    }
                    const sub = walkJsonschema({ node: ref, visitor, name: refName, childProperty: undefined, context })
                    cache.set(childRef, sub)
                    return sub
                },
            ])
        }

        const [refName, reference] = references.get(childRef)!
        return $ref({
            ...context,
            ...annotate(node, context),
            exportSymbol: exportAllSymbols,
            reference: [name ?? refName, reference()],
        })
    }

    if (child.anyOf !== undefined) {
        return $union(
            await asyncCollect(
                asyncMap(child.anyOf, (c) =>
                    walkJsonschema({
                        node: omitUndefined({ ...c }),
                        visitor,
                        childProperty: undefined,
                        context,
                    })
                )
            ),
            annotate(node, context)
        )
    }

    if (child.oneOf !== undefined) {
        return $union(
            await asyncCollect(
                asyncMap(child.oneOf, (c) =>
                    walkJsonschema({
                        node: omitUndefined({ ...c }),
                        visitor,
                        childProperty: undefined,
                        context,
                    })
                )
            ),
            annotate(node, context)
        )
    }

    const validAllOf = child.allOf?.filter((c) => c.properties !== undefined || c.$ref !== undefined) ?? []
    if (validAllOf.length > 0) {
        if (allowIntersectionTypes) {
            return $intersection(
                (await asyncCollect(
                    asyncMap(child.allOf!, (c) =>
                        walkJsonschema({
                            node: omitUndefined({ ...c }),
                            visitor,
                            childProperty: undefined,
                            context,
                        })
                    )
                )) as (AsyncRefType | ObjectType)[],
                annotate(node, context)
            )
        } else {
            console.warn('Encountered intersection type in jsonschema without explicitly allowing it, defaulting to unknown')
        }
    }

    if (isArray(child.type)) {
        return $union(
            await asyncCollect(asyncMap(child.type, async (t) => visitor[t ?? 'object']({ ...child, type: t }, context))),
            context
        )
    }

    return visitor[child.type ?? 'object'](child, context)
}

/**
 * @category JsonSchema
 */
export interface JsonSchemaOptions {
    strict?: boolean
    metaSchemas?: Record<string, Promise<JsonSchema>>
    references?: Map<string, [name: string, value: () => Promise<CstSubNode>]>
    reference?: string
    exportAllSymbols?: boolean
    root?: JsonSchema
    dereferenceRoot?: boolean
    allowIntersectionTypes?: boolean
}

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $jsonschema
 */
export async function $jsonschema(schema: JsonSchema, options: SchemaOptions<JsonSchemaOptions> = {}): Promise<ThereforeCst> {
    const {
        root,
        name,
        reference,
        references = new Map<string, [name: string, value: () => Promise<CstSubNode>]>(),
        dereferenceRoot = true,
    } = options

    if (reference !== undefined && references.has(reference)) {
        return evaluate(references.get(reference)?.[1]) as Promise<ThereforeCst>
    }

    const self = walkJsonschema({
        name,
        node: schema,
        visitor: schemaWalker,
        childProperty: undefined,
        context: { ...options, references, root: root ?? schema },
    })
    references.set('#', [reference!, async () => self])

    let value = await self
    if (dereferenceRoot && value.type === 'ref') {
        value = evaluate(value.children[0]) as ThereforeCst
    }

    return prepass(value)
}
