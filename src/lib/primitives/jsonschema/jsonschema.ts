import { jsonPointer } from '../../../common/json/json.js'
import type {
    JsonAnnotations,
    JsonAnyInstance,
    JsonArrayInstance,
    JsonNumericInstance,
    JsonObjectInstance,
    JsonSchema,
    JsonSchema7TypeName,
    JsonStringInstance,
} from '../../../json.js'
import type { ThereforeNode } from '../../cst/cst.js'
import { prepass } from '../../visitor/prepass/prepass.js'
import { $array } from '../array/index.js'
import type { SchemaMeta, SchemaOptions } from '../base.js'
import { descriptionKeys } from '../base.js'
import { $boolean } from '../boolean/index.js'
import { $const } from '../const/index.js'
import { $dict } from '../dict/index.js'
import { $enum } from '../enum/index.js'
import { $integer } from '../integer/index.js'
import { $intersection } from '../intersection/index.js'
import { $number } from '../number/index.js'
import type { ObjectType } from '../object/index.js'
import { $object } from '../object/index.js'
import { $optional } from '../optional/index.js'
import type { RefType } from '../ref/index.js'
import { $ref } from '../ref/index.js'
import type { StringOptions } from '../string/index.js'
import { $string } from '../string/index.js'
import { $tuple } from '../tuple/index.js'
import type { ThereforeCst } from '../types.js'
import { $union } from '../union/index.js'
import { $unknown } from '../unknown/index.js'

import type { Json, UndefinedFields } from '@skyleague/axioms'
import { entriesOf, evaluate, isArray, isBoolean, keysOf, memoize, omit, omitUndefined, pick } from '@skyleague/axioms'

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
        nullable: doc.nullable,
    })
}

export function retrievePropertiesFromPattern(indexPattern: string) {
    const strPattern = indexPattern.replaceAll('\\', '')
    // check if simple regex
    const [, literal] = strPattern.match(/^\^?\(?([/a-zA-Z0-9/\-_|$@#]+?)\)?\$?$/) ?? [undefined, undefined]
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

export function indexProperties(node: JsonAnnotations & JsonAnyInstance & JsonObjectInstance, context: JsonSchemaContext) {
    let indexSignature: ThereforeNode | undefined = undefined
    let indexPatterns: Record<string, ThereforeNode> | undefined = undefined
    let additionalProperties: boolean | undefined = undefined
    const properties: Record<string, JsonSchema> = {}
    if (node.additionalProperties !== undefined) {
        if (isBoolean(node.additionalProperties)) {
            additionalProperties = node.additionalProperties ? true : undefined
        } else {
            indexSignature = walkJsonschema({
                node: node.additionalProperties,
                visitor: schemaWalker,
                childProperty: undefined,
                context,
            })
        }
    } else if (!context.strict) {
        additionalProperties = true
    }

    if (node.patternProperties !== undefined) {
        for (const [pattern, value] of Object.entries(node.patternProperties)) {
            const property = retrievePropertiesFromPattern(pattern)
            if ('pattern' in property) {
                indexPatterns ??= {}
                indexPatterns[pattern] = walkJsonschema({
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
    (node: JsonSchema & { type?: JsonSchema['type'] | 'const' | 'enum' }, context: JsonSchemaContext) => ThereforeCst
>
const schemaWalker: JsonSchemaWalker = {
    object: (node: JsonAnnotations & JsonAnyInstance & JsonObjectInstance, context: JsonSchemaContext) => {
        if (
            (node.properties === undefined || keysOf(node.properties).length === 0) &&
            (node.additionalProperties === false ||
                node.additionalProperties === undefined ||
                (isBoolean(node.additionalProperties) && keysOf(node.additionalProperties).length === 0)) &&
            (node.patternProperties === undefined || keysOf(node.patternProperties).length === 0)
        ) {
            if (node.type === 'object') {
                return $dict($unknown(), { ...annotate(node, context) })
            }
            return $unknown({ ...annotate(node, context), json: true })
        }
        const { properties, indexSignature, indexPatterns, additionalProperties } = indexProperties(node, context)
        const mergedProperties = { ...properties, ...node.properties }
        const subSchemas = entriesOf(mergedProperties).map(
            ([name, v]) =>
                [
                    name,
                    walkJsonschema({
                        node: omitUndefined({
                            ...v,
                            nullable:
                                v.nullable ?? (context.optionalNullable && !node.required?.includes(name)) ? true : undefined,
                        }),
                        visitor: schemaWalker,
                        childProperty: undefined,
                        context,
                        name: name.toString(),
                    }),
                ] as const
        )

        return $object({
            properties: Object.fromEntries(
                subSchemas
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, schema]) => {
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
    array: (node: JsonAnnotations & JsonAnyInstance & JsonArrayInstance, context: JsonSchemaContext) =>
        $array(walkJsonschema({ node, visitor: schemaWalker, childProperty: 'items', context }), {
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
    metaSchemas: Record<string, JsonSchema>
    references: Map<string, [name: string, value: () => ThereforeNode]>
    root: JsonSchema
    cache: Map<string, () => ThereforeCst>
    exportAllSymbols: boolean
    name?: string | undefined
    allowIntersectionTypes?: boolean
    optionalNullable: boolean
}

function walkJsonschema({
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
}): ThereforeCst {
    const {
        metaSchemas = {},
        references = new Map<string, [name: string, value: () => ThereforeNode]>(),
        root = node,
        cache = new Map<string, () => ThereforeCst>(),
        exportAllSymbols = false,
        strict = true,
        allowIntersectionTypes = false,
        optionalNullable = false,
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
        allowIntersectionTypes,
        optionalNullable,
        ...omit(pick(rest, descriptionKeys), ['name']),
    }

    const child = childProperty !== undefined ? node[childProperty] ?? { type: 'object' } : node

    if (isArray(child)) {
        // tuple json schema definition
        return $tuple(
            child.map((c) => walkJsonschema({ node: c, visitor, childProperty: undefined, context })),
            annotate(node, context)
        )
    }
    if (child.enum !== undefined) {
        return visitor.enum(child, context)
    }
    if (child.const !== undefined) {
        return visitor.const(child, context)
    }
    const childRef = child.$ref
    if (childRef !== undefined) {
        //solve reference
        if (!references.has(childRef)) {
            const ref = jsonPointer({ schema: root, ptr: child, metaSchemas })
            if (ref === undefined) {
                throw new Error('invalid json ptr')
            }
            const split = childRef.split('/')
            const refName = split[split.length - 1]!

            references.set(childRef, [
                refName,
                memoize(() => walkJsonschema({ node: ref, visitor, name: refName, childProperty: undefined, context })),
            ])
        }

        const [refName, reference] = references.get(childRef)!
        return $ref({
            ...context,
            exportSymbol: exportAllSymbols,
            reference: [name ?? refName, reference],
        })
    }

    if (child.anyOf !== undefined) {
        return $union(
            child.anyOf.map((c) =>
                walkJsonschema({
                    node: omitUndefined({ ...c }),
                    visitor,
                    childProperty: undefined,
                    context,
                })
            ),
            annotate(node, context)
        )
    }

    if (child.oneOf !== undefined) {
        return $union(
            child.oneOf.map((c) =>
                walkJsonschema({
                    node: omitUndefined({ ...c }),
                    visitor,
                    childProperty: undefined,
                    context,
                })
            ),
            annotate(node, context)
        )
    }

    const validAllOf = child.allOf?.filter((c) => c.properties !== undefined || c.$ref !== undefined) ?? []
    if (validAllOf.length > 0) {
        if (allowIntersectionTypes) {
            return $intersection(
                validAllOf.map((c) =>
                    walkJsonschema({
                        node: omitUndefined({ ...c }),
                        visitor,
                        childProperty: undefined,
                        context,
                    })
                ) as (ObjectType | RefType)[],
                annotate(node, context)
            )
        } else {
            console.warn('Encountered intersection type in jsonschema without explicitly allowing it, defaulting to unknown')
        }
    }

    if (isArray(child.type)) {
        const isNullable = child.nullable === true || (optionalNullable && !node.required?.includes(childProperty as string))
        const types: JsonSchema7TypeName[] = [...child.type, ...((isNullable ? ['null'] : []) satisfies JsonSchema7TypeName[])]
        return $union(
            types.map((t) => visitor[t]({ ...child, type: t }, context)),
            context
        )
    }

    return visitor[child.type ?? 'object'](child, context)
}

/**
 * @category JsonSchema
 */
export interface JsonSchemaOptions {
    /**
     * Toggles whether additional properties should be allowed by default on objects. (is used when
     * no additionalProperties is set on the schema)
     *
     * @defaultValue false
     */
    strict?: boolean
    metaSchemas?: Record<string, JsonSchema>
    references?: Map<string, [name: string, value: () => ThereforeNode]>
    reference?: string
    exportAllSymbols?: boolean
    root?: JsonSchema
    dereferenceRoot?: boolean
    /**
     * If true, intersection types are being calculated from the `allOf` clause.
     *
     * @defaultValue false
     */
    allowIntersectionTypes?: boolean
    /**
     * If true, all non-required fields will also be allowed to be `null`
     */
    optionalNullable?: boolean
}

/**
 * Create a new `ThereforeCst` instance with the given options.
 *
 * ### Example
 * ```ts
 * $jsonschema({type: 'object', properties: {foo: {type: "string"}}})
 * ```
 *
 * @param schema - The JSON Draft 7 schema.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Schema
 */
export function $jsonschema(schema: JsonSchema, options: SchemaOptions<JsonSchemaOptions> = {}): ThereforeCst {
    const {
        root,
        name,
        reference,
        references = new Map<string, [name: string, value: () => ThereforeNode]>(),
        dereferenceRoot = true,
    } = options

    if (reference !== undefined && references.has(reference)) {
        return evaluate(references.get(reference)?.[1]) as ThereforeCst
    }

    references.set('#', [
        reference!,
        memoize(() =>
            walkJsonschema({
                name,
                node: schema,
                visitor: schemaWalker,
                childProperty: undefined,
                context: { ...options, references, root: root ?? schema },
            })
        ),
    ])

    let value = references.get('#')![1]()

    if (dereferenceRoot && value.type === 'ref') {
        value = evaluate(value.children[0]) as ThereforeCst
    }
    value.description = omitUndefined({
        ...omit(options, ['root']),
        ...value.description,
    })

    return prepass(value as ThereforeCst)
}
