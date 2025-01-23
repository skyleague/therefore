import { evaluate, isArray, isBoolean, isObject, keysOf, memoize, omit, omitUndefined, pick } from '@skyleague/axioms'
import type { JsonValue } from '@skyleague/axioms/types'
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
import type { ThereforeNodeDefinition } from '../../cst/cst.js'
import { type Node, definitionKeys } from '../../cst/node.js'
import { loadNode } from '../../visitor/prepass/prepass.js'
import { $array, type ArrayOptions } from '../array/array.js'
import type { SchemaOptions } from '../base.js'
import { $boolean } from '../boolean/boolean.js'
import { $const } from '../const/const.js'
import { $enum } from '../enum/enum.js'
import { $integer, type IntegerOptions } from '../integer/integer.js'
import { $intersection } from '../intersection/intersection.js'
import { $nullable, NullableType } from '../nullable/nullable.js'
import { $number, type NumberOptions } from '../number/number.js'
import { type ObjectOptions, type ObjectShape, ObjectType } from '../object/object.js'
import { $optional } from '../optional/optional.js'
import { $ref } from '../ref/ref.js'
import { $string, type StringFormat, type StringOptions } from '../string/string.js'
import { $tuple } from '../tuple/tuple.js'
import type { ThereforeSchema } from '../types.js'
import { $union, DiscriminatedUnionType } from '../union/union.js'
import { $unknown, type UnknownOptions, UnknownType } from '../unknown/unknown.js'
import type { ValidatorInputOptions } from '../validator/types.js'

export const jsonschemaKeys = ['examples', 'title', 'writeonly'] as const satisfies Exclude<
    keyof JsonAnnotations,
    keyof ThereforeNodeDefinition
>[]

type JSONDefinitionKeys = keyof ThereforeNodeDefinition & keyof JsonAnnotations
export const jsonDefinitionKeys = keysOf({
    description: true,
    default: true,
    readonly: true,
    deprecated: true,
} satisfies Record<JSONDefinitionKeys, true>)

export function asNullable<N extends Node>(node: N, doc: JsonAnnotations & { optional?: boolean }) {
    if (doc.nullable === true) {
        return $nullable(node)
    }
    return node
}

export function annotateNode<N extends Node>(node: N, doc: JsonAnnotations & { optional?: boolean }, context: JsonSchemaContext) {
    // properly propagate the name
    // if it contains ascii
    if (context.name !== undefined && /[a-zA-Z]+/.test(context.name)) {
        node._name = context.name
    }

    const jsonschema = omitUndefined(pick(doc, jsonschemaKeys))
    if (Object.entries(jsonschema).length > 0) {
        node._definition.jsonschema ??= {}
        Object.assign(node._definition.jsonschema, jsonschema)
    }
    const definition = omitUndefined(pick(doc, jsonDefinitionKeys))
    Object.assign(node._definition, definition)
    return node
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
    let recordType: Node | undefined = undefined
    let patternProperties: Record<string, Node> | undefined = undefined
    let strict: boolean | undefined = undefined
    const properties: Record<string, JsonSchema> = {}
    if (node.additionalProperties !== undefined) {
        if (isBoolean(node.additionalProperties)) {
            strict = node.additionalProperties ? false : undefined
        } else {
            recordType = context.render(node.additionalProperties)
        }
    } else if (context.strict) {
        strict = true
    }

    if (node.patternProperties !== undefined) {
        for (const [pattern, value] of Object.entries(node.patternProperties)) {
            const property = retrievePropertiesFromPattern(pattern)
            if ('pattern' in property) {
                patternProperties ??= {}
                patternProperties[pattern] = context.render(value)
            } else {
                for (const name of property.names) {
                    properties[name] = value
                }
            }
        }
    }

    return {
        properties,
        strict,
        recordType,
        patternProperties,
    }
}

export class JSONObjectType extends ObjectType {
    public declare patternProperties: Record<string, Node> | undefined
    public declare element?: Node | undefined

    public constructor(
        {
            shape,
            recordType,
            patternProperties,
        }: {
            shape: ObjectShape
            recordType?: Node | undefined
            patternProperties?: Record<string, Node> | undefined
        },
        options: SchemaOptions<ObjectOptions, Record<string, Node>> = {},
    ) {
        super({}, options)
        this._from({ shape, recordType, patternProperties })
    }
}

export const fromFormat: Record<Exclude<JsonSchema['format'], undefined> | 'ulid' | 'uuid' | string, StringFormat> = {
    'date-time': 'date-time',
    date: 'date',
    time: 'time',
    email: 'email',
    hostname: 'hostname',
    ipv4: 'ipv4',
    ipv6: 'ipv6',
    uri: 'uri',
    ulid: 'ulid',
    uuid: 'uuid',
    duration: 'duration',
}

type JsonSchemaWalker = Record<
    JsonSchema7TypeName | 'const' | 'enum' | 'unknown',
    (node: JsonSchema & { type?: JsonSchema['type'] | 'const' | 'enum' | 'unknown' }, context: JsonSchemaContext) => Node
>
const schemaWalker: JsonSchemaWalker = {
    object: (node: JsonAnnotations & JsonAnyInstance & JsonObjectInstance, context: JsonSchemaContext) => {
        if (
            (node.properties === undefined || keysOf(node.properties).length === 0) &&
            (node.additionalProperties === false ||
                node.additionalProperties === undefined ||
                isBoolean(node.additionalProperties) ||
                keysOf(node.additionalProperties).length === 0) &&
            (node.patternProperties === undefined || keysOf(node.patternProperties).length === 0)
        ) {
            if (node.type === undefined) {
                return context.annotate(
                    $unknown({
                        restrictToJson: true,

                        arbitrary: (node as { 'x-arbitrary'?: UnknownOptions['arbitrary'] })['x-arbitrary'],
                    }),
                    node,
                )
            }
        }
        const { properties, recordType, patternProperties, strict } = indexProperties(node, context)
        const mergedProperties = { ...properties, ...node.properties }
        const subSchemas = Object.entries(mergedProperties).map(
            ([name, v]) =>
                [
                    name,
                    context.annotate(
                        context.render(v, {
                            name: name.toString(),
                        }),
                        v,
                    ),
                ] as const,
        )
        const shape = Object.fromEntries(
            subSchemas
                .toSorted(([a], [b]) => a.localeCompare(b))
                .map(([name, schema]) => {
                    let field = schema
                    if (node.required?.includes(name.toString()) !== true) {
                        if (context.optionalNullable) {
                            field = $nullable(field)
                        }
                        field = $optional(field)
                    }
                    return [name, field]
                }),
        )

        return context.annotate(
            new JSONObjectType(
                { shape, recordType, patternProperties },
                {
                    strict,

                    arbitrary: (node as { 'x-arbitrary'?: ObjectOptions['arbitrary'] })['x-arbitrary'],
                },
            ),
            node,
        )
    },
    array: (node: JsonAnnotations & JsonAnyInstance & JsonArrayInstance, context: JsonSchemaContext) => {
        if (Array.isArray(node.items)) {
            // tuple json schema definition
            return context.annotate(
                $tuple((node.items ?? []).map((c) => context.render(c)) as [Node, ...Node[]], {
                    rest:
                        node.additionalItems !== undefined && isObject(node.additionalItems)
                            ? context.render(node.additionalItems)
                            : undefined,
                }),
                node,
            )
        }
        return context.annotate(
            $array(context.render(node, { childProperty: 'items' }), {
                minItems: node.minItems,
                maxItems: node.maxItems,
                set: node.uniqueItems,

                arbitrary: (node as { 'x-arbitrary'?: ArrayOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
        )
    },
    boolean: (node: JsonAnnotations, context) => context.annotate($boolean(), node),
    integer: (node: JsonAnnotations & JsonNumericInstance, context) =>
        context.annotate(
            $integer({
                multipleOf: node.multipleOf,
                min: node.minimum,
                max: node.maximum,
                ...(node.exclusiveMinimum !== undefined ? { min: node.exclusiveMinimum, minInclusive: false } : {}),
                ...(node.exclusiveMaximum !== undefined ? { max: node.exclusiveMaximum, maxInclusive: false } : {}),

                arbitrary: (node as { 'x-arbitrary'?: IntegerOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
        ),
    null: (node, context) => context.annotate($const(null), node),
    number: (node: JsonAnnotations & JsonNumericInstance, context) =>
        context.annotate(
            $number({
                multipleOf: node.multipleOf,
                min: node.minimum,
                max: node.maximum,
                ...(node.exclusiveMaximum !== undefined ? { max: node.exclusiveMaximum, maxInclusive: false } : {}),
                ...(node.exclusiveMinimum !== undefined ? { min: node.exclusiveMinimum, minInclusive: false } : {}),

                arbitrary: (node as { 'x-arbitrary'?: NumberOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
        ),
    string: (node: JsonAnnotations & JsonStringInstance, context) => {
        const str = $string({
            minLength: node.minLength,
            maxLength: node.maxLength,
            regex: node.pattern,
            format:
                context.formats &&
                ((node.format !== undefined ? fromFormat[node.format] : undefined) ?? node.contentEncoding === 'base64')
                    ? 'base64'
                    : undefined,

            arbitrary: (node as { 'x-arbitrary'?: StringOptions['arbitrary'] })['x-arbitrary'],
        })

        const format = node.format !== undefined ? fromFormat[node.format] : undefined
        if (format !== undefined) {
            // we also set additional options using this method
            if (format === 'date-time') {
                str.datetime()
            } else {
                str[format]()
            }
        }

        return context.annotate(str, node)
    },
    enum: (node: JsonAnnotations & JsonAnyInstance, context) => context.annotate($enum(node.enum as string[]), node),
    const: (node: JsonAnnotations & JsonAnyInstance, context) => context.annotate($const(node.const as JsonValue), node),
    unknown: (node: JsonAnnotations, context) => context.annotate($unknown({ restrictToJson: true }), node),
} as const

interface JsonSchemaContext {
    strict: boolean
    references: Map<string, () => Node>
    document: object
    name?: string | undefined
    allowIntersection?: boolean
    optionalNullable: boolean
    connections: Node[]
    formats: boolean

    validator: ValidatorInputOptions | undefined

    render: (
        node: JsonSchema,
        options?: { childProperty?: keyof Pick<JsonSchema, 'items'> | undefined; name?: string | undefined },
    ) => Node
    annotate: <N extends Node>(node: N, schema: JsonSchema & { optional?: boolean }) => Node
}

export function buildContext({
    node,
    name,
    context: maybeContext = {},
}: {
    node: JsonSchema
    name?: string | undefined
    context?: Partial<JsonSchemaContext>
}): JsonSchemaContext {
    const {
        references = new Map<string, () => Node>(),
        document = node,
        strict = false,
        allowIntersection = true,
        optionalNullable = false,
        connections = [],
        validator,
        formats = true,
    } = maybeContext

    const context: JsonSchemaContext = {
        references,
        document,
        strict,
        allowIntersection,
        optionalNullable,
        connections,
        name,
        validator,
        formats,
        render: (
            schema: JsonSchema,
            {
                childProperty,
                name: n,
            }: { childProperty?: keyof Pick<JsonSchema, 'items'> | undefined; name?: string | undefined } = {},
        ) => walkJsonschema({ node: schema, visitor: schemaWalker, context, childProperty, name: n ?? name }),
        annotate: (node, schema) => asNullable(annotateNode(node, schema, context), schema),
    }
    return context
}

export function walkJsonschema({
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
    context?: Partial<JsonSchemaContext>
}): Node {
    const context: JsonSchemaContext = buildContext({ node, name, context: maybeContext })

    const child = childProperty !== undefined ? (node[childProperty] ?? { type: 'unknown' }) : node

    if (isArray(child) || (isObject(node.additionalItems) && node.type === 'array')) {
        return asNullable(visitor.array(node, context), node)
    }

    if (child.type === 'unknown') {
        return visitor.unknown(child as JsonAnnotations, context)
    }

    if (child.enum !== undefined) {
        return asNullable(visitor.enum(child, context), child)
    }
    if (child.const !== undefined) {
        return asNullable(visitor.const(child, context), child)
    }
    const childRef = child.$ref
    if (childRef !== undefined) {
        //solve reference
        if (!context.references.has(childRef)) {
            const ref = jsonPointer({ schema: context.document, ptr: child })
            if (ref === undefined) {
                throw new Error('Could not resolve reference')
            }
            const split = childRef.split('/')
            const refName = split[split.length - 1]

            context.references.set(
                childRef,
                memoize(() => {
                    const reference = asNullable(context.render(ref, { name: refName }), ref)
                    if (context.validator !== undefined) {
                        reference.validator(context.validator)
                    }
                    context.connections.push(reference)
                    return reference
                }),
            )
        }

        // biome-ignore lint/style/noNonNullAssertion: we just set this value
        const reference = context.references.get(childRef)!

        return annotateNode($ref(reference), child, context)
    }

    if (isArray(child.type)) {
        if (child.type.length === 1) {
            child.type = child.type[0]
        }
    }
    if (isArray(child.type)) {
        const types: JsonSchema7TypeName[] = child.type.filter((type) => type !== 'null') satisfies JsonSchema7TypeName[]
        if (types.length > 1) {
            return asNullable(
                annotateNode(
                    $union(
                        types.map((t) =>
                            visitor[t](
                                { ...omit(child, [...jsonDefinitionKeys, ...jsonschemaKeys, 'nullable']), type: t },
                                context,
                            ),
                        ),
                    ),
                    child,
                    context,
                ),
                child,
            )
        }
        if (child.type.some((t) => t === 'null')) {
            child.nullable = true
        }
        child.type = types[0]
    }

    const validType =
        child.type === undefined || ['null', 'boolean', 'object', 'array', 'number', 'string', 'integer'].includes(child.type)
            ? (child.type ?? 'object')
            : 'unknown'

    const value = asNullable(visitor[validType](child, context), child)
    const maybeIntersection = (x: Node) => {
        if (value instanceof UnknownType || value instanceof NullableType) {
            return x
        }
        if (value instanceof ObjectType && value._children.length === 0) {
            return x
        }
        return $intersection([value, x] as ObjectType[])
    }

    if (child.anyOf !== undefined) {
        return asNullable(
            annotateNode(maybeIntersection($union(child.anyOf.map((c) => context.render(c)))), child, context),
            child,
        )
    }
    if (child.oneOf !== undefined) {
        if (child.discriminator?.propertyName !== undefined) {
            const union = new DiscriminatedUnionType(
                child.oneOf.map((c) => context.render(c)),
                {},
            )
            union._discriminator = child.discriminator.propertyName
            return asNullable(annotateNode(maybeIntersection(union), child, context), child)
        }
        return asNullable(
            annotateNode(maybeIntersection($union(child.oneOf.map((c) => context.render(c)))), child, context),
            child,
        )
    }

    const validAllOf = child.allOf?.filter((c) => c.properties !== undefined || c.type === 'object' || c.$ref !== undefined) ?? []
    if (validAllOf.length > 0) {
        if (context.allowIntersection) {
            return asNullable(
                annotateNode(
                    $intersection([
                        ...(value instanceof UnknownType || value instanceof NullableType ? [] : [value]),
                        ...validAllOf.map((c) => context.render(c)),
                    ] as ObjectType[]),
                    child,
                    context,
                ),
                child,
            )
        }
        console.warn('Encountered intersection type in jsonschema without explicitly allowing it, defaulting to unknown')
    }
    return value
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
    references?: Map<string, () => Node>
    exportAllSymbols?: boolean

    document?: object
    formats?: boolean

    /**
     * If true, the schema will be dereferenced if the root node is a reference.
     *
     * @default true
     */
    dereference?: boolean
    /**
     * If true, intersection types are being calculated from the `allOf` clause.
     *
     * @defaultValue true
     */
    allowIntersection?: boolean
    /**
     * If true, all non-required fields will also be allowed to be `null`
     */
    optionalNullable?: boolean

    validator?: ValidatorInputOptions | undefined
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
export function $jsonschema(schema: JsonSchema, options: SchemaOptions<JsonSchemaOptions> = {}): ThereforeSchema {
    const {
        document = schema,
        name,
        references = new Map<string, () => Node>(),
        dereference = true,
        formats = true,
        validator,
    } = options
    const connections: Node[] = []
    references.set(
        '#',
        memoize(() => {
            const context = buildContext({
                node: schema,
                context: { ...options, formats, connections, references, document, validator },
            })
            const node = context.render(schema, { name })
            node._name = name
            node._definition = { ...node._definition, ...pick(options, definitionKeys) }
            if (options.exportAllSymbols === true) {
                node._connections = connections
            }
            if (validator !== undefined) {
                node.validator(validator)
            }

            return node
        }),
    )

    // biome-ignore lint/style/noNonNullAssertion: we know that the reference exists since we set it the statement above
    let value = references.get('#')!()

    if (dereference && value._type === 'ref' && value._children?.[0] !== undefined) {
        const oldConnections = value._connections ?? []
        value = evaluate(value._children[0])
        value._connections = oldConnections
    }
    return loadNode(value) as ThereforeSchema
}
