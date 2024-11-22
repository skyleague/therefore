import type { JsonSchema } from '../../../json.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { $jsonschema, type JSONObjectType } from '../../primitives/jsonschema/jsonschema.js'
import type { Schema } from '../../types.js'
import { loadNode } from '../prepass/prepass.js'

import type { Arbitrary, Dependent, Tree } from '@skyleague/axioms'
import {
    domain,
    allOf,
    array,
    base64,
    boolean,
    constant,
    date,
    datetime,
    dependentArbitrary,
    email,
    float,
    integer,
    ipv4,
    ipv6,
    json,
    memoize,
    memoizeArbitrary,
    next,
    nullable,
    object,
    oneOf,
    optional,
    set,
    string,
    tuple,
    ulidArbitrary,
    unknown,
    uri,
    uuidv4Arbitrary,
} from '@skyleague/axioms'
import { expand } from 'regex-to-strings'
import type { RecordType } from '../../primitives/record/record.js'

export interface ArbitraryContext {
    references: Map<string, () => Arbitrary<unknown>>
    transform: (node: Node, arbitrary: Arbitrary<unknown>) => Arbitrary<unknown>
    arbitrary: (node: Node) => Arbitrary<unknown>
}

export function buildContext(): ArbitraryContext {
    const context: ArbitraryContext = {
        references: new Map(),
        transform: (node: Node, arb: Arbitrary<unknown>): Arbitrary<unknown> => {
            const hasOptional = hasOptionalPrimitive(node)
            const hasNullable = hasNullablePrimitive(node)

            if (hasOptional && hasNullable) {
                return optional(nullable(arb), { symbol: undefined })
            }
            if (hasOptional) {
                return optional(arb, { symbol: undefined })
            }
            if (hasNullable) {
                return nullable(arb)
            }
            return arb
        },
        arbitrary: (node) => {
            return walkTherefore(node, arbitraryVisitor, context)
        },
    }
    return context
}

export const regexArbitrary = (regex: string | RegExp): Arbitrary<string> => {
    const it = expand(regex).getIterator()
    return dependentArbitrary(() => ({
        value: next(it).right as string,
        children: [],
    }))
}

export const arbitraryVisitor: ThereforeVisitor<Arbitrary<unknown>, ArbitraryContext> = {
    string: ({ _options: options }) => {
        if (options.format === 'date') {
            return date()
        }
        if (options.format === 'date-time') {
            return datetime().map((x) => x.toISOString())
        }
        if (options.format === 'time') {
            return datetime().map((x) => x.toISOString().split('T')[1])
        }
        if (options.format === 'hostname') {
            return domain()
        }
        if (options.format === 'email') {
            return email()
        }
        if (options.format === 'uuid') {
            return uuidv4Arbitrary()
        }
        if (options.format === 'uri') {
            return uri()
        }
        if (options.format === 'ipv4') {
            return ipv4()
        }
        if (options.format === 'ipv6') {
            return ipv6()
        }
        if (options.format === 'base64') {
            return base64({ minLength: options.minLength, maxLength: options.maxLength })
        }

        if (options.format === 'ulid') {
            return ulidArbitrary()
        }

        const { minLength, maxLength, ...restArbitrary } = options.arbitrary ?? {}
        if (options.regex !== undefined) {
            return regexArbitrary(options.regex)
        }
        return string({
            minLength: minLength ?? options.minLength,
            maxLength: maxLength ?? options.maxLength,
            ...restArbitrary,
        })
    },

    number: ({ _options: options }) => {
        const { min, max, minInclusive, maxInclusive, ...restArbitrary } = options.arbitrary ?? {}

        return float({
            minInclusive: minInclusive ?? options.minInclusive ?? true,
            maxInclusive: maxInclusive ?? options.maxInclusive ?? true,
            min: min ?? options.min,
            max: max ?? options.max,
            ...restArbitrary,
        }).map((x) => {
            const { multipleOf } = options
            if (multipleOf !== undefined) {
                return Math.round(x / multipleOf) * multipleOf
            }
            return x
        })
    },
    integer: ({ _options: options }) => {
        const { min, max, minInclusive, maxInclusive, ...restArbitrary } = options.arbitrary ?? {}
        return integer({
            minInclusive: minInclusive ?? options.minInclusive ?? true,
            maxInclusive: maxInclusive ?? options.maxInclusive ?? true,
            min: min ?? options.min,
            max: max ?? options.max,
            ...restArbitrary,
        }).map((x) => {
            const { multipleOf } = options
            if (multipleOf !== undefined) {
                return Math.round(x / multipleOf) * multipleOf
            }
            return x
        })
    },
    boolean: () => boolean(),
    unknown: ({ _options: options }) => {
        const { ...restArbitrary } = options.arbitrary ?? {}
        return options.restrictToJson ? json({ size: 'xs', ...restArbitrary }) : unknown({ size: 'xs', ...restArbitrary })
    },
    const: ({ const: value }) => {
        return constant(structuredClone(value))
    },
    enum: ({ enum: values, _isNamed: isNamed }) => {
        if (values.length === 1) {
            return isNamed ? constant(values[0]?.[1]) : constant(values[0])
        }
        return oneOf(...(isNamed ? Object.values(values) : values).map((c) => constant(c)))
    },
    union: ({ _children }, context) => oneOf(..._children.map((c) => context.arbitrary(c))),

    intersection: ({ _children }, context) => {
        const schemas = _children.map((c) => context.arbitrary(c))
        return allOf(...(schemas as unknown as Arbitrary<Record<PropertyKey, unknown>>[]))
    },
    object: (obj, context) => {
        const { shape, _options: options } = obj
        const { size } = options.arbitrary ?? {}
        const { element } = obj as RecordType
        const { patternProperties } = obj as JSONObjectType
        const recordArbitrary = element !== undefined ? context.arbitrary(element) : undefined

        const propertyArbitraries = Object.entries(shape).map(([name, c]) => [name, context.arbitrary(c)] as const)
        const composite = recordArbitrary
            ? array(string({ size }), { size }).chain((recordKeys) => {
                  return object(Object.fromEntries([...recordKeys.map((k) => [k, recordArbitrary]), ...propertyArbitraries]))
              })
            : object(Object.fromEntries(propertyArbitraries))

        if (patternProperties !== undefined) {
            return tuple(
                composite,
                tuple(
                    ...Object.entries(patternProperties).map(([property, node]) => {
                        const regex = expand(property).getIterator()
                        const value = context.arbitrary(node)
                        return set(
                            {
                                value: (): Tree<string> => ({
                                    value: next(regex).right as string,
                                    children: [],
                                }),
                            },
                            // fake everything is unique, we don't really care here
                            { size, eq: () => false },
                        ).chain((keys) => {
                            return object(Object.fromEntries(keys.map((k) => [k, value] as const)))
                        })
                    }),
                ).map((patterns) => Object.assign({}, ...patterns)),
            ).map(([x, patterns]) => {
                return Object.assign({}, x, patterns)
            })
        }
        return composite
    },
    array: ({ _children: [items], _options: options }, context) => {
        const { minLength, maxLength, ...restArbitrary } = options.arbitrary ?? {}
        const child = context.arbitrary(items)
        if (options.set === true) {
            return set(child, {
                minLength: options.minItems ?? minLength,
                maxLength: options.maxItems ?? maxLength,
                ...restArbitrary,
            })
        }
        return array(child, {
            minLength: options.minItems ?? minLength,
            maxLength: options.maxItems ?? maxLength,
            ...restArbitrary,
        })
    },
    tuple: ({ items: elements, _options: { rest } }, context) => {
        const tupleArbitrary = tuple(...elements.map((c) => context.arbitrary(c)))
        if (rest !== undefined) {
            return tuple(tupleArbitrary, array(context.arbitrary(rest))).map(([xs, ys]) => {
                return [...xs, ...ys]
            })
        }

        return tupleArbitrary
    },

    ref: ({ _children: [reference] }, context) => {
        const uuid = reference._id
        if (!context.references.has(uuid)) {
            const child = memoize(() => {
                return context.arbitrary(reference)
            })
            context.references.set(uuid, child)
            return memoizeArbitrary(child)
        }
        // biome-ignore lint/style/noNonNullAssertion: we know it exists
        return memoizeArbitrary(context.references.get(uuid)!)
    },
    default: (node, context) => {
        if (node._isCommutative) {
            // in this case we just ignore the node completely and skip directly to the wrapped node
            const child = node._children?.[0]
            if (child !== undefined) {
                return context.arbitrary(child)
            }
        }
        throw new Error('should not be called')
    },
}

/**
 * Create an arbitrary from the compiled Therefore schema.
 *
 * ### Example
 * ```ts
 * random(arbitrary(HelloWorld))
 * // => "hello world"
 * ```
 *
 * @param schema - The schema to generate an arbitrary for.
 *
 * @group Arbitrary
 */
export function arbitrary<T = unknown>(schema: Pick<Schema<T>, 'is' | 'schema'>): Dependent<T>
export function arbitrary<T = unknown>(schema: Node & { infer: T }): Dependent<T>
export function arbitrary<T = unknown>(schema: Pick<Schema<T>, 'is' | 'schema'> | (Node & { infer: T })): Dependent<T> {
    const context = buildContext()
    if ('schema' in schema) {
        // as the therefore schemas are very strict by default, we can allow intersection types here
        return context.arbitrary($jsonschema(schema.schema as JsonSchema, { allowIntersection: true })) as Dependent<T>
    }
    loadNode(schema)
    const root = context.arbitrary(schema) as Dependent<T>

    return root
}
