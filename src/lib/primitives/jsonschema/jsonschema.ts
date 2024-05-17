import { entriesOf, evaluate, isArray, isBoolean, isObject, keysOf, memoize, omitUndefined, pick } from '@skyleague/axioms'
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
import { $number, type NumberOptions } from '../number/number.js'
import { type ObjectOptions, type ObjectShape, ObjectType } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import { $string, type StringFormat, type StringOptions } from '../string/string.js'
import { $tuple } from '../tuple/tuple.js'
import type { ThereforeSchema } from '../types.js'
import { $union } from '../union/union.js'
import { $unknown, type UnknownOptions, UnknownType } from '../unknown/unknown.js'

export const jsonschemaKeys = ['examples', 'title', 'writeonly'] as const satisfies Exclude<
    keyof JsonAnnotations,
    keyof ThereforeNodeDefinition
>[]

type JSONDefinitionKeys = keyof ThereforeNodeDefinition & keyof JsonAnnotations
export const jsonDefinitionKeys = keysOf({
    description: true,
    nullable: true,
    default: true,
    readonly: true,
    deprecated: true,
} satisfies Record<JSONDefinitionKeys, true>)

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
                return annotateNode(
                    $unknown({
                        restrictToJson: true,

                        arbitrary: (node as { 'x-arbitrary'?: UnknownOptions['arbitrary'] })['x-arbitrary'],
                    }),
                    node,
                    context,
                )
            }
        }
        const { properties, recordType, patternProperties, strict } = indexProperties(node, context)
        const mergedProperties = { ...properties, ...node.properties }
        const subSchemas = entriesOf(mergedProperties).map(
            ([name, v]) =>
                [
                    name,
                    context.render(
                        {
                            ...v,
                            nullable:
                                v.nullable ?? (context.optionalNullable && !node.required?.includes(name) ? true : undefined),
                        },
                        { name: name.toString() },
                    ),
                ] as const,
        )
        const shape = Object.fromEntries(
            subSchemas
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, schema]) => {
                    if (node.required?.includes(name.toString()) !== true) {
                        schema._definition.optional = true
                    }
                    return [name, schema]
                }),
        )

        return annotateNode(
            new JSONObjectType(
                { shape, recordType, patternProperties },
                {
                    strict,

                    arbitrary: (node as { 'x-arbitrary'?: ObjectOptions['arbitrary'] })['x-arbitrary'],
                },
            ),
            node,
            context,
        )
    },
    array: (node: JsonAnnotations & JsonAnyInstance & JsonArrayInstance, context: JsonSchemaContext) => {
        if (Array.isArray(node.items)) {
            // tuple json schema definition
            return annotateNode(
                $tuple((node.items ?? []).map((c) => context.render(c)) as [Node, ...Node[]], {
                    rest:
                        node.additionalItems !== undefined && isObject(node.additionalItems)
                            ? context.render(node.additionalItems)
                            : undefined,
                }),
                node,
                context,
            )
        }
        return annotateNode(
            $array(context.render(node, { childProperty: 'items' }), {
                minItems: node.minItems,
                maxItems: node.maxItems,
                set: node.uniqueItems,

                arbitrary: (node as { 'x-arbitrary'?: ArrayOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
            context,
        )
    },
    boolean: (node: JsonAnnotations, context) => annotateNode($boolean(), node, context),
    integer: (node: JsonAnnotations & JsonNumericInstance, context) =>
        annotateNode(
            $integer({
                multipleOf: node.multipleOf,
                min: node.minimum,
                max: node.maximum,
                ...(node.exclusiveMinimum !== undefined ? { min: node.exclusiveMinimum, minInclusive: false } : {}),
                ...(node.exclusiveMaximum !== undefined ? { max: node.exclusiveMaximum, maxInclusive: false } : {}),

                arbitrary: (node as { 'x-arbitrary'?: IntegerOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
            context,
        ),
    null: (node, context) => annotateNode($const(null), node, context),
    number: (node: JsonAnnotations & JsonNumericInstance, context) =>
        annotateNode(
            $number({
                multipleOf: node.multipleOf,
                min: node.minimum,
                max: node.maximum,
                ...(node.exclusiveMaximum !== undefined ? { max: node.exclusiveMaximum, maxInclusive: false } : {}),
                ...(node.exclusiveMinimum !== undefined ? { min: node.exclusiveMinimum, minInclusive: false } : {}),

                arbitrary: (node as { 'x-arbitrary'?: NumberOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
            context,
        ),
    string: (node: JsonAnnotations & JsonStringInstance, context) => {
        const str = annotateNode(
            $string({
                minLength: node.minLength,
                maxLength: node.maxLength,
                regex: node.pattern,
                format:
                    (node.format !== undefined ? fromFormat[node.format] : undefined) ?? node.contentEncoding === 'base64'
                        ? 'base64'
                        : undefined,

                arbitrary: (node as { 'x-arbitrary'?: StringOptions['arbitrary'] })['x-arbitrary'],
            }),
            node,
            context,
        )
        const format = node.format !== undefined ? fromFormat[node.format] : undefined
        if (format !== undefined) {
            // we also set additional options using this method
            if (format === 'date-time') {
                str.datetime()
            } else {
                str[format]()
            }
        }

        return str
    },
    enum: (node: JsonAnnotations & JsonAnyInstance, context) => annotateNode($enum(node.enum as string[]), node, context),
    const: (node: JsonAnnotations & JsonAnyInstance, context) => annotateNode($const(node.const as JsonValue), node, context),
    unknown: (node: JsonAnnotations, context) => annotateNode($unknown({ restrictToJson: true }), node, context),
} as const

interface JsonSchemaContext {
    strict: boolean
    references: Map<string, () => Node>
    document: object
    // cache: Map<string, () => Node>
    // exportAllSymbols: boolean
    name?: string | undefined
    allowIntersection?: boolean
    optionalNullable: boolean
    connections: Node[]

    render: (
        node: JsonSchema,
        options?: { childProperty?: keyof Pick<JsonSchema, 'items'> | undefined; name?: string | undefined },
    ) => Node
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
    } = maybeContext

    const context: JsonSchemaContext = {
        references,
        document,
        strict,
        allowIntersection,
        optionalNullable,
        connections,
        name,
        render: (
            schema: JsonSchema,
            {
                childProperty,
                name: n,
            }: { childProperty?: keyof Pick<JsonSchema, 'items'> | undefined; name?: string | undefined } = {},
        ) => walkJsonschema({ node: schema, visitor: schemaWalker, context, childProperty, name: n ?? name }),
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

    const child = childProperty !== undefined ? node[childProperty] ?? { type: 'unknown' } : node

    if (isArray(child) || (isObject(node.additionalItems) && node.type === 'array')) {
        return visitor.array(node, context)
    }

    if (child.type === 'unknown') {
        return visitor.unknown(child as JsonAnnotations, context)
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
                    const reference = context.render(ref, { name: refName })
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
        const isNullable = child.nullable === true
        const types: JsonSchema7TypeName[] = child.type.filter(
            (type) => !isNullable || type !== 'null' || child.type?.length === 1,
        ) satisfies JsonSchema7TypeName[]

        if (types.length > 1) {
            return annotateNode($union(types.map((t) => visitor[t]({ type: t }, context))), child, context)
        }
        child.type = types[0]
    }

    const validType =
        child.type === undefined || ['null', 'boolean', 'object', 'array', 'number', 'string', 'integer'].includes(child.type)
            ? child.type ?? 'object'
            : 'unknown'

    const value = visitor[validType](child, context)
    const maybeIntersection = (x: Node) => {
        if (value instanceof UnknownType) {
            return x
        }
        if (value instanceof ObjectType && value._children.length === 0) {
            return x
        }
        return $intersection([value, x] as ObjectType[])
    }

    if (child.anyOf !== undefined) {
        return annotateNode(maybeIntersection($union(child.anyOf.map((c) => context.render(c)))), child, context)
    }
    if (child.oneOf !== undefined) {
        return annotateNode(maybeIntersection($union(child.oneOf.map((c) => context.render(c)))), child, context)
    }

    const validAllOf = child.allOf?.filter((c) => c.properties !== undefined || c.type === 'object' || c.$ref !== undefined) ?? []
    if (validAllOf.length > 0) {
        if (context.allowIntersection) {
            return annotateNode(
                $intersection([
                    ...(value instanceof UnknownType ? [] : [value]),
                    ...validAllOf.map((c) => context.render(c)),
                ] as ObjectType[]),
                child,
                context,
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
    connections?: Node[]
    exportAllSymbols?: boolean

    document?: object

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
    const { document = schema, name, references = new Map<string, () => Node>(), dereference = true, connections = [] } = options
    references.set(
        '#',
        memoize(() => {
            const context = buildContext({
                node: schema,
                context: { ...options, connections, references, document },
            })
            const node = context.render(schema, { name })
            node._definition = { ...node._definition, ...pick(options, definitionKeys) }
            if (options.exportAllSymbols === true) {
                node._connections = connections
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
