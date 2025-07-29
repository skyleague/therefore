import { mapValues } from '@skyleague/axioms'
import { z as z4 } from 'zod/v4'
import type { $ZodChecks, $ZodStringFormatChecks } from 'zod/v4/core'
import type { Node } from '../../cst/node.js'
import type { NodeTrace } from '../../cst/trace.js'
import { $array, ArrayType } from '../array/array.js'
import { $boolean } from '../boolean/boolean.js'
import { $const } from '../const/const.js'
import { $enum } from '../enum/enum.js'
import { $intersection } from '../intersection/intersection.js'
import { $null } from '../null/null.js'
import { $nullable } from '../nullable/nullable.js'
import { $number, NumberType } from '../number/number.js'
import { $object } from '../object/object.js'
import { $optional } from '../optional/optional.js'
import { $record, type RecordType } from '../record/record.js'
import { $string, StringType } from '../string/string.js'
import { $tuple, type TupleType } from '../tuple/tuple.js'
import { $union, DiscriminatedUnionType } from '../union/union.js'
import { $unknown } from '../unknown/unknown.js'

interface WithGuessedTrace {
    _guessedTrace?: NodeTrace | undefined
}

export interface ZodV4WalkerContext {
    keepOriginalSchema: boolean

    cache: WeakMap<z4.ZodFirstPartySchemaTypes, Node>
    render: (node: z4.ZodFirstPartySchemaTypes, ctx?: Partial<ZodV4WalkerContext>) => Node
}

export function buildContext(options: Partial<ZodV4WalkerContext> = {}): ZodV4WalkerContext {
    const context: ZodV4WalkerContext = {
        cache: options.cache ?? new Map(),
        render: (node, ctx: Partial<ZodV4WalkerContext> = {}): Node => {
            if (context.cache.has(node)) {
                return context.cache.get(node) as Node
            }
            // biome-ignore lint/suspicious/noExplicitAny: we dont care as much about the type here
            let value: any = zod4Visitor[node._zod.def.type](node as never, {
                ...context,
                ...ctx,
            })

            for (const check of [node, ...(node._zod.def.checks ?? [])]) {
                const visitor =
                    'check' in check._zod.def
                        ? checkVisitor[check._zod.def.check as OtherChecks['_zod']['def']['check']]
                        : undefined
                if (visitor) {
                    value = visitor(value, check._zod.def as never)
                }
            }
            const description = z4.globalRegistry.get(node)?.description
            if (description) {
                value._definition.description = description
            }
            if (context.keepOriginalSchema) {
                value._origin.zod = node
            }
            context.cache.set(node, value)

            const withGuessedTrace = node as WithGuessedTrace
            if (withGuessedTrace._guessedTrace) {
                value._guessedTrace = withGuessedTrace._guessedTrace
            }

            return value
        },
        keepOriginalSchema: true,
        ...options,
    } satisfies ZodV4WalkerContext
    return context
}

type OtherChecks = Exclude<$ZodChecks, $ZodStringFormatChecks>

const checkVisitor: {
    [key in OtherChecks['_zod']['def']['check']]: (
        n: NumberType | StringType | ArrayType,
        check: Extract<OtherChecks['_zod']['def'], { check: key }>,
    ) => NumberType | StringType | ArrayType
} = {
    greater_than: (x, check) => {
        if (x instanceof NumberType && typeof check.value === 'number') {
            if (check.inclusive) {
                return x.gte(check.value)
            }
            return x.gt(check.value)
        }

        throw new Error('Function not implemented.')
    },
    less_than: (x, check) => {
        if (x instanceof NumberType && typeof check.value === 'number') {
            if (check.inclusive) {
                return x.lte(check.value)
            }
            return x.lt(check.value)
        }

        throw new Error('Function not implemented.')
    },
    length_equals: (x, check) => {
        if (x instanceof StringType) {
            return x.minLength(check.length).maxLength(check.length)
        }

        throw new Error('Function not implemented.')
    },
    max_length: (x, check) => {
        if (x instanceof StringType) {
            return x.maxLength(check.maximum)
        }

        throw new Error('Function not implemented.')
    },
    min_length: (x, check) => {
        if (x instanceof StringType) {
            return x.minLength(check.minimum)
        }

        throw new Error('Function not implemented.')
    },
    max_size: (x, check) => {
        if (x instanceof ArrayType) {
            return x.maxItems(check.maximum)
        }

        throw new Error('Function not implemented.')
    },
    min_size: (x, check) => {
        if (x instanceof ArrayType) {
            return x.minItems(check.minimum)
        }

        throw new Error('Function not implemented.')
    },

    multiple_of: (x, check) => {
        if (x instanceof NumberType && typeof check.value === 'number') {
            return x.multipleOf(check.value)
        }

        throw new Error('Function not implemented.')
    },
    number_format: (_x, _check) => {
        // if (x instanceof NumberType) {
        //     const fmt = check.format
        //     const formatters: Record<typeof fmt, (() => NumberType) | undefined> = {
        //         int32: () => x.int32(),
        //         uint32: () => x.uint32(),
        //         float32: () => x.float32(),
        //         float64: () => x.float64(),
        //         safeint: () => x.safeint(),
        //     }

        //     return formatters[fmt]?.() ?? x
        // }

        throw new Error('Function not implemented.')
    },
    bigint_format: (_x, _check) => {
        // if (x instanceof NumberType && typeof check.format === 'string') {
        //     const fmt = check.format
        //     const formatters: Record<typeof fmt, (() => NumberType) | undefined> = {
        //         int64: () => x.int64(),
        //         uint64: () => x.uint64(),
        //     }

        //     return formatters[fmt]?.() ?? x
        // }

        throw new Error('Function not implemented.')
    },
    overwrite: (x) => {
        // supported through the arbitrary visitor by using the original node directly
        return x
    },
    mime_type: () => {
        throw new Error('Function not implemented.')
    },
    property: () => {
        throw new Error('Function not implemented.')
    },
    size_equals: (x, check) => {
        if (x instanceof ArrayType) {
            return x.minItems(check.size).maxItems(check.size)
        }

        throw new Error('Function not implemented.')
    },
    string_format: (x, check) => {
        if (x instanceof StringType) {
            const fmt = check.format
            const formatters: Record<typeof fmt, (() => StringType) | undefined> = {
                email: () => x.email(),
                url: () => x.uri(),
                uuid: () => x.uuid(),
                guid: () => x.uuid(), // good enough
                ulid: () => x.ulid(),
                xid: () => {
                    throw new Error('Function not implemented.')
                },
                ksuid: () => {
                    throw new Error('Function not implemented.')
                },
                datetime: () => x.datetime(),
                date: () => x.date(),
                time: () => x.time(),
                duration: () => x.duration(),
                ipv4: () => x.ipv4(),
                ipv6: () => x.ipv6(),
                base64: () => x.base64(),
                json_string: () => {
                    throw new Error('Function not implemented.')
                },
                e164: () => {
                    throw new Error('Function not implemented.')
                },
                regex: () => (check.pattern ? x.regex(check.pattern) : x),

                // supported through the arbitrary visitor by using the original node directly
                includes: undefined,
                lowercase: undefined,
                uppercase: undefined,
                base64url: undefined,
                starts_with: undefined,
                ends_with: undefined,
                emoji: undefined,
                nanoid: undefined,
                cuid: undefined,
                cuid2: undefined,
                cidrv4: undefined,
                cidrv6: undefined,

                jwt: () => {
                    throw new Error('Function not implemented.')
                },
            }
            return formatters[fmt]?.() ?? x
        }

        throw new Error('Function not implemented.')
    },
}

export const zod4Visitor: {
    [key in z4.ZodFirstPartySchemaTypes['_zod']['def']['type']]: (
        node: Extract<z4.ZodFirstPartySchemaTypes, { _zod: { def: { type: key } } }>,
        ctx: ZodV4WalkerContext,
    ) => Node
} = {
    string: () => {
        return $string()
    },
    number: () => {
        return $number()
    },
    boolean: () => {
        return $boolean()
    },
    nan: () => {
        throw new Error('Function not implemented.')
    },
    bigint: () => {
        throw new Error('Function not implemented.')
    },

    date: () => {
        throw new Error('Function not implemented.')
    },
    any: () => {
        return $unknown({ restrictToJson: true })
    },
    symbol: () => {
        throw new Error('Function not implemented.')
    },
    undefined: () => {
        return $const(undefined)
    },
    null: () => {
        return $null()
    },
    never: () => {
        throw new Error('Function not implemented.')
    },
    void: () => {
        throw new Error('Function not implemented.')
    },
    unknown: () => {
        return $unknown({ restrictToJson: true })
    },
    array: (node, ctx) => {
        const value = $array(ctx.render(node._zod.def.element as z4.ZodFirstPartySchemaTypes))

        // if (node._def.exactLength) {
        //     value._options.minItems = node._def.exactLength.value
        //     value._options.maxItems = node._def.exactLength.value
        // }

        // if (node._def.minLength) {
        //     value._options.minItems = node._def.minLength.value
        // }
        // if (node._def.maxLength) {
        //     value._options.maxItems = node._def.maxLength.value
        // }

        return value
    },
    object: (node, ctx) => {
        const value = $object(mapValues(node._zod.def.shape, (x) => ctx.render(x as z4.ZodFirstPartySchemaTypes)))
        if (
            node._zod.def.catchall &&
            node._zod.def.catchall._zod.def.type !== 'never' &&
            node._zod.def.catchall._zod.def.type !== 'any'
        ) {
            ;(value as RecordType).element = ctx.render(node._zod.def.catchall as z4.ZodFirstPartySchemaTypes)
        }
        return value
    },
    catch: () => {
        throw new Error('Function not implemented.')
    },
    custom: () => {
        throw new Error('Function not implemented.')
    },
    lazy: (node, ctx) => {
        return ctx.render(node._zod.def.getter() as z4.ZodFirstPartySchemaTypes)
    },
    default: (node, ctx) => {
        const value = ctx.render(node._zod.def.innerType as z4.ZodFirstPartySchemaTypes)
        value._definition.default = node._zod.def.defaultValue
        return value
    },
    enum: (node) => {
        return $enum(node._zod.def.entries as Record<string, string>)
    },
    readonly: () => {
        throw new Error('Function not implemented.')
    },
    literal: (node) => {
        if (node._zod.def.values.length > 1) {
            return $enum(node._zod.def.values as string[])
        }
        return $const(node._zod.def.values[0] as string)
    },
    file: () => {
        throw new Error('Function not implemented.')
    },
    map: () => {
        throw new Error('Function not implemented.')
    },
    tuple: (node, ctx) => {
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        let value = $tuple(node._zod.def.items.map((x: any) => ctx.render(x as z4.ZodFirstPartySchemaTypes)) as [Node, ...Node[]])

        if (node._zod.def.rest) {
            value = value.rest(ctx.render(node._zod.def.rest as z4.ZodFirstPartySchemaTypes)) as unknown as TupleType<
                [Node, ...Node[]],
                undefined
            >
        }

        return value
    },
    nonoptional: () => {
        throw new Error('Function not implemented.')
    },
    nullable: (node, ctx) => {
        return $nullable(ctx.render(node._zod.def.innerType as z4.ZodFirstPartySchemaTypes))
    },
    optional: (node, ctx) => {
        return $optional(ctx.render(node._zod.def.innerType as z4.ZodFirstPartySchemaTypes))
    },
    pipe: (node, ctx) => {
        return ctx.render(node._zod.def.in as z4.ZodFirstPartySchemaTypes)
    },
    promise: () => {
        throw new Error('Function not implemented.')
    },
    prefault: () => {
        throw new Error('Function not implemented.')
    },
    record: (node, ctx) => {
        const record = $record(ctx.render(node._zod.def.valueType as z4.ZodFirstPartySchemaTypes))
        if (node._zod.def.keyType._zod.def.type !== 'string') {
            ;(record as RecordType).key = ctx.render(node._zod.def.keyType as z4.ZodFirstPartySchemaTypes)
        }
        return record
    },
    set: (node, ctx) => {
        return $array(ctx.render(node._zod.def.valueType as z4.ZodFirstPartySchemaTypes), {
            set: true,
        })
    },
    success: () => {
        throw new Error('Function not implemented.')
    },
    template_literal: () => {
        throw new Error('Function not implemented.')
    },
    transform: () => {
        throw new Error('Function not implemented.')
    },
    union: (x, ctx) => {
        if (x instanceof z4.ZodDiscriminatedUnion) {
            const union = new DiscriminatedUnionType(
                // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
                x._zod.def.options.map((x: any) => ctx.render(x as z4.ZodFirstPartySchemaTypes)),
                {},
            )
            union._discriminator = x._zod.def.discriminator
            return union
        }
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        return $union(x._zod.def.options.map((x: any) => ctx.render(x)))
    },
    intersection: (node, ctx) => {
        return $intersection(
            // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
            [node._zod.def.left, node._zod.def.right].map((x) => ctx.render(x as z4.ZodFirstPartySchemaTypes)) as any,
        )
    },
}

export function $zod4(
    node: z4.ZodFirstPartySchemaTypes,
    {
        cache = new WeakMap(),
        keepOriginalSchema = true,
    }: { cache?: WeakMap<z4.ZodFirstPartySchemaTypes, Node>; keepOriginalSchema?: boolean } = {},
): Node {
    const context = buildContext({ cache, keepOriginalSchema })
    return context.render(node)
}
