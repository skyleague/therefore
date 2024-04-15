import type { JsonSchema } from '../../../json.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { $jsonschema } from '../../primitives/jsonschema/jsonschema.js'
import type { Schema } from '../../types.js'
import { loadNode } from '../prepass/prepass.js'

import type { Arbitrary, Dependent, Tree } from '@skyleague/axioms'
import {
    domain,
    allOf,
    array,
    boolean,
    constant,
    date,
    datetime,
    float,
    integer,
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
    toISO8601Date,
    tuple,
    unknown,
} from '@skyleague/axioms'
import { expand } from 'regex-to-strings'

import { randomUUID } from 'node:crypto'

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
    return {
        value: (): Tree<string> => ({
            value: next(it).right as string,
            children: [],
        }),
    }
}

export const arbitraryVisitor: ThereforeVisitor<Arbitrary<unknown>, ArbitraryContext> = {
    string: ({ options }) => {
        if (options.format === 'date') {
            return date()
        }
        if (options.format === 'date-time') {
            return datetime().map((x) => toISO8601Date(x, { format: 'date-time' }))
        }
        if (options.format === 'time') {
            return datetime().map((x) => toISO8601Date(x, { format: 'date-time' }).split('T')[1])
        }
        if (options.format === 'hostname') {
            return domain()
        }
        if (options.format === 'email') {
            return regexArbitrary(
                /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
            )
        }
        if (options.format === 'uuid') {
            return constant(randomUUID())
        }
        if (options.format === 'uri') {
            return regexArbitrary(
                /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
            )
        }
        if (options.format === 'ipv4') {
            return regexArbitrary(/^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/)
        }
        if (options.format === 'ipv6') {
            return regexArbitrary(
                /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
            )
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

    number: ({ options }) => {
        const { min, max, minInclusive, maxInclusive, ...restArbitrary } = options.arbitrary ?? {}

        return float({
            minInclusive: minInclusive ?? options.minInclusive,
            maxInclusive: maxInclusive ?? options.maxInclusive,
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
    integer: ({ options }) => {
        const { min, max, minInclusive, maxInclusive, ...restArbitrary } = options.arbitrary ?? {}
        return integer({
            minInclusive: minInclusive ?? options.minInclusive,
            maxInclusive: maxInclusive ?? options.maxInclusive,
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
    unknown: ({ options }) => {
        const { ...restArbitrary } = options.arbitrary ?? {}
        return options.restrictToJson ? json(restArbitrary) : unknown(restArbitrary)
    },
    const: ({ const: value }) => {
        return constant(structuredClone(value))
    },
    enum: ({ values, isNamed }) => {
        if (values.length === 1) {
            return isNamed ? constant(values[0]?.[1]) : constant(values[0])
        }
        return oneOf(...(isNamed ? values.map(([, c]) => c) : values).map((c) => constant(c)))
    },
    union: ({ children }, context) => oneOf(...children.map((c) => context.arbitrary(c))),

    intersection: ({ children }, context) => {
        const schemas = children.map((c) => context.arbitrary(c))
        return allOf(...(schemas as unknown as Arbitrary<Record<PropertyKey, unknown>>[]))
    },
    object: ({ shape, recordType, patternProperties, options }, context) => {
        const { size } = options.arbitrary ?? {}
        const recordArbitrary = recordType !== undefined ? context.arbitrary(recordType) : undefined

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
    array: ({ children, options }, context) => {
        const { minLength, maxLength, ...restArbitrary } = options.arbitrary ?? {}
        const [items] = children
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
    tuple: ({ elements, options: { rest } }, context) => {
        const tupleArbitrary = tuple(...elements.map((c) => context.arbitrary(c)))
        if (rest !== undefined) {
            return tuple(tupleArbitrary, array(context.arbitrary(rest))).map(([xs, ys]) => {
                return [...xs, ...ys]
            })
        }

        return tupleArbitrary
    },

    ref: ({ children }, context) => {
        const [reference] = children
        const uuid = reference.id
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
        if (node.isCommutative) {
            // in this case we just ignore the node completely and skip directly to the wrapped node
            const child = node.children?.[0]
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
