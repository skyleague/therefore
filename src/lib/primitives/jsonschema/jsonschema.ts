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
import { $number } from '../number'
import { $object } from '../object'
import { $optional } from '../optional'
import { $ref } from '../ref'
import { $string } from '../string'
import type { StringOptions } from '../string'
import { $tuple } from '../tuple'
import type { AyncThereforeCst, ThereforeCst } from '../types'
import { $union } from '../union'
import { $unknown } from '../unknown'

import type { Json, UndefinedFields } from '@skyleague/axioms'
import { asyncCollect, evaluate, entriesOf, keysOf, isArray, omitUndefined, isBoolean, pick, omit } from '@skyleague/axioms'

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
    const properties: Record<string, JsonSchema> = {}
    if (node.additionalProperties !== undefined && node.additionalProperties !== false) {
        indexSignature = await walkJsonschema({
            node: node.additionalProperties,
            visitor: schemaWalker,
            childProperty: undefined,
            context,
        })
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
            return $unknown({ ...annotate(node, context) })
        }
        const { properties, indexSignature, indexPatterns } = await indexProperties(node, context)
        const mergedProperties = { ...properties, ...node.properties }
        const subSchemas = await asyncCollect(
            entriesOf(mergedProperties).map(
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
    metaSchemas: Record<string, Promise<JsonSchema>>
    references: Map<string, [name: string, value: () => Promise<CstSubNode>]>
    root: JsonSchema
    cache: Map<string, Promise<AyncThereforeCst>>
    exportAllSymbols: boolean
    name?: string | undefined
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
        ...rest
    } = maybeContext
    const context = {
        metaSchemas,
        references,
        root,
        cache,
        name,
        exportAllSymbols,
        ...omit(pick(rest, descriptionKeys), ['name']),
    }
    const child = childProperty !== undefined ? node[childProperty] ?? { type: 'object' } : node

    if (isArray(child)) {
        // tuple json schema definition
        return $tuple(
            await asyncCollect(child.map((c) => walkJsonschema({ node: c, visitor, childProperty: undefined, context }))),
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

    if (child.oneOf !== undefined) {
        return $union(
            await asyncCollect(
                child.oneOf.map((c) =>
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

    if (isArray(child.type)) {
        return $union(
            await asyncCollect(child.type.map(async (t) => visitor[t ?? 'object']({ ...child, type: t }, context))),
            context
        )
    }

    return visitor[child.type ?? 'object'](child, context)
}

/**
 * @category JsonSchema
 */
export interface JsonSchemaOptions {
    metaSchemas?: Record<string, Promise<JsonSchema>>
    references?: Map<string, [name: string, value: () => Promise<CstSubNode>]>
    exportAllSymbols?: boolean
    root?: JsonSchema
    dereferenceRoot?: boolean
}

/**
 *
 * @param options - additional options to pass to the property
 *
 * @category $jsonschema
 */
export async function $jsonschema(schema: JsonSchema, options: SchemaOptions<JsonSchemaOptions> = {}): Promise<ThereforeCst> {
    const { root, name, dereferenceRoot = true } = options
    const value = await walkJsonschema({
        name,
        node: schema,
        visitor: schemaWalker,
        childProperty: undefined,
        context: { ...options, root: root ?? schema },
    })
    if (dereferenceRoot && value.type === 'ref') {
        return evaluate(value.children[0]) as ThereforeCst
    }
    return prepass(value)
}
