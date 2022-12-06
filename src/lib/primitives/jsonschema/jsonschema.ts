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
import type { CstNode } from '../../cst/cst'
import { prepass } from '../../visitor/prepass'
import { $array } from '../array'
import type { SchemaMeta, SchemaOptions } from '../base'
import { descriptionKeys } from '../base'
import { $boolean } from '../boolean'
import { $const } from '../const'
import { $dict } from '../dict'
import { $enum } from '../enum'
import { $integer } from '../integer'
import { $intersection } from '../intersection'
import { $number } from '../number'
import type { ObjectType } from '../object'
import { $object } from '../object'
import { $optional } from '../optional'
import type { RefType } from '../ref'
import { $ref } from '../ref'
import type { StringOptions } from '../string'
import { $string } from '../string'
import { $tuple } from '../tuple'
import type { ThereforeCst } from '../types'
import { $union } from '../union'
import { $unknown } from '../unknown'

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
    let indexSignature: CstNode | undefined = undefined
    let indexPatterns: Record<string, CstNode> | undefined = undefined
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
                        node: v,
                        visitor: schemaWalker,
                        childProperty: undefined,
                        context,
                        name: name.toString(),
                    }),
                ] as const
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
    references: Map<string, [name: string, value: () => CstNode]>
    root: JsonSchema
    cache: Map<string, () => ThereforeCst>
    exportAllSymbols: boolean
    name?: string | undefined
    allowIntersectionTypes?: boolean
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
        references = new Map<string, [name: string, value: () => CstNode]>(),
        root = node,
        cache = new Map<string, () => ThereforeCst>(),
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
            const refName = split[split.length - 1]

            references.set(childRef, [
                refName,
                memoize(() => walkJsonschema({ node: ref, visitor, name: refName, childProperty: undefined, context })),
            ])
        }

        const [refName, reference] = references.get(childRef)!
        return $ref({
            ...context,
            ...annotate(node, context),
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
        return $union(
            child.type.map((t) => visitor[t]({ ...child, type: t }, context)),
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
    metaSchemas?: Record<string, JsonSchema>
    references?: Map<string, [name: string, value: () => CstNode]>
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
export function $jsonschema(schema: JsonSchema, options: SchemaOptions<JsonSchemaOptions> = {}): ThereforeCst {
    const {
        root,
        name,
        reference,
        references = new Map<string, [name: string, value: () => CstNode]>(),
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
