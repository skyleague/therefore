import type { Infer, Schema as TSchema } from '@typeschema/main'
import type { JsonSchema } from '../../../json.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { Node } from '../../cst/node.js'
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
    cuid2Arbitrary,
    cuidArbitrary,
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
    nanoidArbitrary,
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
import type { ZodFirstPartySchemaTypes, ZodSchema, ZodString } from 'zod'
import type { RecordType } from '../../primitives/record/record.js'
import { $ref } from '../../primitives/ref/ref.js'

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

export const regexArbitrary = (regex: string | RegExp): Dependent<string> => {
    const it = expand(regex).getIterator()
    return dependentArbitrary(() => ({
        value: it.next().value as string,
        children: [],
    }))
}

export const arbitraryVisitor: ThereforeVisitor<Arbitrary<unknown>, ArbitraryContext> = {
    string: ({ _options: options, _origin: { zod } }) => {
        let strArbitrary: Dependent<string> | undefined

        if (options.format === 'date') {
            strArbitrary = date()
        } else if (options.format === 'date-time') {
            strArbitrary = datetime().map((x) => x.toISOString())

            let allowOffset = true
            let allowLocal = false
            let precision: number | undefined
            if (zod !== undefined && (zod as ZodFirstPartySchemaTypes)._def.typeName === 'ZodString') {
                const zodString = zod as ZodString
                const zodDatetime = zodString._def.checks?.find((check) => check.kind === 'datetime')
                if (zodDatetime) {
                    allowOffset = zodDatetime.offset
                    allowLocal = zodDatetime?.local === true
                    precision = zodDatetime.precision ?? undefined
                }
            }
            if (precision !== undefined) {
                strArbitrary = strArbitrary.chain((x) => {
                    const [hms] = x.split('.') ?? []
                    if (precision === 0) {
                        return constant(`${hms}Z`)
                    }
                    return array(integer({ min: 0, max: 9 }), { minLength: precision, maxLength: precision }).map(
                        (digits) => `${hms}.${digits.join('')}Z`,
                    )
                })
            }
            strArbitrary = tuple(
                strArbitrary,
                boolean(),
                !allowLocal ? constant(false) : boolean(),
                integer({ min: -12, max: 12 }),
                integer({ min: 0, max: 59 }),
            ).map(([x, useZ, useLocal, h, m]) => {
                if (useZ) {
                    return x
                }
                if (useLocal) {
                    return x.replace('Z', '')
                }
                const sign = h < 0 ? '-' : '+'
                return allowOffset
                    ? `${x.replace('Z', '')}${sign}${Math.abs(h).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                    : x
            })
        } else if (options.format === 'time') {
            // biome-ignore lint/style/noNonNullAssertion: the T in the ISO string is always present
            strArbitrary = datetime().map((x) => x.toISOString().split('T')[1]!)

            const allowOffset = true
            let forceLocal = false
            let precision: number | undefined
            if (zod !== undefined && (zod as ZodFirstPartySchemaTypes)._def.typeName === 'ZodString') {
                const zodString = zod as ZodString

                const zodTime = zodString._def.checks?.find((check) => check.kind === 'time')
                if (zodTime) {
                    precision = zodTime.precision ?? undefined
                }

                forceLocal = true
            }
            if (precision !== undefined) {
                strArbitrary = strArbitrary.chain((x) => {
                    const [hms] = x.split('.') ?? []
                    if (precision === 0) {
                        return constant(`${hms}Z`)
                    }
                    return array(integer({ min: 0, max: 9 }), { minLength: precision, maxLength: precision }).map(
                        (digits) => `${hms}.${digits.join('')}Z`,
                    )
                })
            }

            strArbitrary = tuple(strArbitrary, boolean(), integer({ min: -12, max: 12 }), integer({ min: 0, max: 59 })).map(
                ([x, useZ, h, m]) => {
                    if (useZ && !forceLocal) {
                        return x
                    }
                    if (forceLocal) {
                        return x.replace('Z', '')
                    }
                    const sign = h < 0 ? '-' : '+'
                    return allowOffset
                        ? `${x.replace('Z', '')}${sign}${Math.abs(h).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                        : x
                },
            )
        } else if (options.format === 'hostname') {
            strArbitrary = domain()
        } else if (options.format === 'email') {
            strArbitrary = email({ format: 'restricted' })
        } else if (options.format === 'uuid') {
            strArbitrary = uuidv4Arbitrary()
        } else if (options.format === 'uri') {
            strArbitrary = uri()
        } else if (options.format === 'ipv4') {
            strArbitrary = ipv4()
        } else if (options.format === 'ipv6') {
            strArbitrary = ipv6()
        } else if (options.format === 'base64') {
            strArbitrary = base64({ minLength: options.minLength, maxLength: options.maxLength })
        } else if (options.format === 'ulid') {
            strArbitrary = ulidArbitrary()
        } else if (options.format === 'duration') {
            strArbitrary = tuple(
                integer({ min: 0, max: 99 }), // years
                integer({ min: 0, max: 11 }), // months
                integer({ min: 0, max: 30 }), // days
                integer({ min: 0, max: 23 }), // hours
                integer({ min: 0, max: 59 }), // minutes
                integer({ min: 0, max: 59 }), // seconds
            ).map(([y, m, d, h, min, s]) => `P${y}Y${m}M${d}DT${h}H${min}M${s}S`)
        }

        const { minLength, maxLength, ...restArbitrary } = options.arbitrary ?? {}
        if (options.regex !== undefined) {
            strArbitrary = regexArbitrary(options.regex)
        }

        if (strArbitrary === undefined) {
            const min = minLength ?? options.minLength
            const max = maxLength ?? options.maxLength
            strArbitrary = string({
                minLength: min === undefined || max === undefined ? min : Math.min(min, max),
                maxLength: min === undefined || max === undefined ? max : Math.max(min, max),
                ...restArbitrary,
            })
        }

        if (zod !== undefined && (zod as ZodFirstPartySchemaTypes)._def.typeName === 'ZodString') {
            const zodString = zod as ZodString
            const startsWith = zodString._def.checks.find((c) => c.kind === 'startsWith')
            if (startsWith !== undefined) {
                strArbitrary = strArbitrary.map((x) => `${startsWith.value}${x}`)
            }
            const endsWith = zodString._def.checks.find((c) => c.kind === 'endsWith')
            if (endsWith !== undefined) {
                strArbitrary = strArbitrary.map((x) => `${x}${endsWith.value}`)
            }
            const includes = zodString._def.checks.find((c) => c.kind === 'includes')
            if (includes !== undefined) {
                strArbitrary = strArbitrary.map((x) => `${x}${includes.value}`)
            }

            const trim = zodString._def.checks.find((c) => c.kind === 'trim')
            if (trim !== undefined) {
                strArbitrary = strArbitrary.map((x) => x.trim())
            }

            const toLowerCase = zodString._def.checks.find((c) => c.kind === 'toLowerCase')
            if (toLowerCase !== undefined) {
                strArbitrary = strArbitrary.map((x) => x.toLowerCase())
            }

            const toUpperCase = zodString._def.checks.find((c) => c.kind === 'toUpperCase')
            if (toUpperCase !== undefined) {
                strArbitrary = strArbitrary.map((x) => x.toUpperCase())
            }

            const nanoid = zodString._def.checks.find((c) => c.kind === 'nanoid')
            if (nanoid !== undefined) {
                strArbitrary = nanoidArbitrary()
            }

            const cuid = zodString._def.checks.find((c) => c.kind === 'cuid')
            if (cuid !== undefined) {
                strArbitrary = cuidArbitrary()
            }

            const cuid2 = zodString._def.checks.find((c) => c.kind === 'cuid2')
            if (cuid2 !== undefined) {
                strArbitrary = cuid2Arbitrary()
            }

            const emoji = zodString._def.checks.find((c) => c.kind === 'emoji')
            if (emoji !== undefined) {
                // Common emoji ranges
                const emojiRanges = [
                    [0x1f300, 0x1f9ff], // Miscellaneous Symbols and Pictographs, Emoticons, Transport/Map Symbols...
                    [0x2600, 0x26ff], // Miscellaneous Symbols
                    [0x2700, 0x27bf], // Dingbats
                    [0xfe00, 0xfe0f], // Variation Selectors
                    [0x1f1e6, 0x1f1ff], // Regional Indicator Symbols
                ] as const

                strArbitrary = oneOf(
                    ...emojiRanges.map(([min, max]) => integer({ min, max }).map((x) => String.fromCodePoint(x))),
                ).filter((s) => /^(\p{Extended_Pictographic}|\p{Emoji_Component})+$/u.test(s))
            }

            const cidr = zodString._def.checks.find((c) => c.kind === 'cidr')
            if (cidr !== undefined) {
                const version = cidr.version
                if (version === 'v4') {
                    strArbitrary = tuple(ipv4(), integer({ min: 0, max: 32 })).map(([ip, prefix]) => `${ip}/${prefix}`)
                } else {
                    strArbitrary = tuple(ipv6(), integer({ min: 0, max: 128 })).map(([ip, prefix]) => `${ip}/${prefix}`)
                }
            }

            const base64url = zodString._def.checks.find((c) => c.kind === 'base64url')
            if (base64url !== undefined) {
                strArbitrary = base64({ minLength: options.minLength, maxLength: options.maxLength }).map((x) =>
                    x.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_').replace(/\r?\n/g, ''),
                )
            }
        }

        return strArbitrary
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
                                    value: regex.next().value as string,
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
export function arbitrary<S extends ZodSchema | Schema<unknown>>(
    schema: S,
): S extends ZodSchema ? Dependent<S['_output']> : S extends Schema<infer T> ? Dependent<T> : never
export function arbitrary<T = unknown>(schema: Pick<Schema<T>, 'is' | 'schema'>): Dependent<T>
export function arbitrary<T = unknown>(schema: Node & { infer: T }): Dependent<T>
export function arbitrary<T extends ZodSchema>(schema: T): Dependent<T['_output']>
export function arbitrary<T extends TSchema>(schema: T): Dependent<Infer<T>>
export function arbitrary<T = unknown>(schema: Pick<Schema<T>, 'is' | 'schema'> | (Node & { infer: T }) | TSchema): Dependent<T> {
    const context = buildContext()
    if ('schema' in schema) {
        // as the therefore schemas are very strict by default, we can allow intersection types here
        return context.arbitrary($jsonschema(schema.schema as JsonSchema, { allowIntersection: true })) as Dependent<T>
    }
    if (!(schema instanceof Node)) {
        return context.arbitrary($ref(schema)) as Dependent<T>
    }
    loadNode(schema)
    const root = context.arbitrary(schema) as Dependent<T>

    return root
}
