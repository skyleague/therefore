import { mapValues } from '@skyleague/axioms'
import zodPackage from 'zod/package.json' with { type: 'json' }
import type { z as z3 } from 'zod/v3'
import type { Node } from '../../cst/node.js'
import { getGuessedTrace, type NodeTrace } from '../../cst/trace.js'
import { $array } from '../array/array.js'
import { $boolean } from '../boolean/boolean.js'
import { $const } from '../const/const.js'
import { $enum } from '../enum/enum.js'
import { $integer } from '../integer/integer.js'
import { $intersection } from '../intersection/intersection.js'
import { $null } from '../null/null.js'
import { $nullable } from '../nullable/nullable.js'
import { $number, type NumberType } from '../number/number.js'
import { $object } from '../object/object.js'
import { $optional } from '../optional/optional.js'
import { $record, type RecordType } from '../record/record.js'
import { $string, type StringType } from '../string/string.js'
import { $tuple, type TupleType } from '../tuple/tuple.js'
import { $union, DiscriminatedUnionType } from '../union/union.js'
import { $unknown } from '../unknown/unknown.js'

declare module 'zod' {
    interface ZodType {
        _guessedTrace?: NodeTrace | undefined
    }
}

export function extendsZodWithTracing(zod: typeof z3) {
    // Define the _def property if it doesn't exist
    Object.defineProperty(zod.ZodType.prototype, '_def', {
        configurable: true,
        enumerable: true,
        get() {
            return this.__def
        },
        set(value) {
            // Only set source if it hasn't been set before
            if (!Object.getOwnPropertyDescriptor(this, '_guessedTrace')) {
                const source = getGuessedTrace()
                Object.defineProperty(this, '_guessedTrace', {
                    value: source,
                    enumerable: true,
                    configurable: true,
                    writable: true,
                })
            }
            this.__def = value
        },
    })
}

try {
    if (zodPackage.version.startsWith('3')) {
        const zodMod = await import('zod')
        extendsZodWithTracing(zodMod as typeof z3)
    }
} catch {
    // ignore
}

export interface ZodV3WalkerContext {
    keepOriginalSchema: boolean
    cache: WeakMap<z3.ZodFirstPartySchemaTypes, Node>
    render: (node: z3.ZodFirstPartySchemaTypes, ctx?: Partial<ZodV3WalkerContext>) => Node
}

export function buildContext(options: Partial<ZodV3WalkerContext> = {}): ZodV3WalkerContext {
    const context: ZodV3WalkerContext = {
        cache: options.cache ?? new Map(),
        render: (node, ctx: Partial<ZodV3WalkerContext> = {}): Node => {
            if (context.cache.has(node)) {
                return context.cache.get(node) as Node
            }
            const value = zod3Visitor[node._def.typeName](node as never, {
                ...context,
                ...ctx,
            })
            if (node._def.description) {
                value._definition.description = node._def.description
            }
            if (context.keepOriginalSchema) {
                value._origin.zod = node
            }
            context.cache.set(node, value)

            if (node._guessedTrace) {
                value._guessedTrace = node._guessedTrace
            }

            return value
        },
        keepOriginalSchema: true,
        ...options,
    } satisfies ZodV3WalkerContext
    return context
}

const stringVisitor: {
    [key in z3.ZodString['_def']['checks'][number]['kind']]: (
        n: StringType,
        kind: Extract<z3.ZodString['_def']['checks'][number], { kind: key }>,
    ) => StringType
    // [key in $ZodStringFormats]: (n: StringType, kind: Extract<$ZodStringFormatChecks['_zod']['def'], { kind: key }>) => StringType
} = {
    email: (x, _kind: { kind: 'email'; message?: string | undefined }) => {
        return x.email()
    },
    length: (x, kind: { kind: 'length'; value: number; message?: string | undefined }) => {
        return x.minLength(kind.value).maxLength(kind.value)
    },
    min: (x, kind: { kind: 'min'; value: number; message?: string | undefined }) => {
        return x.minLength(kind.value)
    },
    max: (x, kind: { kind: 'max'; value: number; message?: string | undefined }) => {
        return x.maxLength(kind.value)
    },
    includes: (x, _kind: { kind: 'includes'; value: string; position?: number | undefined; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        return x
    },
    url: (x, _kind: { kind: 'url'; message?: string | undefined }) => {
        return x.uri()
    },
    base64: (x, _kind: { kind: 'base64'; message?: string | undefined }) => {
        return x.base64()
    },
    datetime: (
        x,
        _kind: {
            kind: 'datetime'
            offset: boolean
            local: boolean
            precision: number | null
            message?: string | undefined
        },
    ) => {
        return x.datetime()
    },
    date: (x, _kind: { kind: 'date'; message?: string | undefined }) => {
        return x.date()
    },
    time: (x, _kind: { kind: 'time'; precision: number | null; message?: string | undefined }) => {
        return x.time()
    },
    uuid: (x, _kind: { kind: 'uuid'; message?: string | undefined }) => {
        return x.uuid()
    },
    ulid: (x, _kind: { kind: 'ulid'; message?: string | undefined }) => {
        return x.ulid()
    },
    regex: (x, kind: { kind: 'regex'; regex: RegExp; message?: string | undefined }) => {
        return x.regex(kind.regex)
    },
    toLowerCase: (x, _kind: { kind: 'toLowerCase'; message?: string | undefined }) => {
        // is a validation transformation feature, we dont do anything with that
        // throw new Error('Function not implemented.')
        return x
    },
    toUpperCase: (x, _kind: { kind: 'toUpperCase'; message?: string | undefined }) => {
        // is a validation transformation feature, we dont do anything with that
        // throw new Error('Function not implemented.')
        return x
    },
    trim: (x, _kind: { kind: 'trim'; message?: string | undefined }) => {
        // is a validation transformation feature, we dont do anything with that
        // throw new Error('Function not implemented.'
        return x
    },
    endsWith: (x, _kind: { kind: 'endsWith'; value: string; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.'
        return x
    },
    startsWith: (x, _kind: { kind: 'startsWith'; value: string; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
    emoji: (x, _kind: { kind: 'emoji'; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
    nanoid: (x, _kind: { kind: 'nanoid'; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
    cuid: (x, _kind: { kind: 'cuid'; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
    cuid2: (x, _kind: { kind: 'cuid2'; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
    ip: (x, kind: { kind: 'ip'; version?: 'v4' | 'v6' | undefined; message?: string | undefined }) => {
        if (kind.version === 'v4') {
            return x.ipv4()
        }
        return x.ipv6()
    },
    duration: (x, _kind: { kind: 'duration'; message?: string | undefined }) => {
        return x.duration()
    },
    jwt: (_x, _kind: { kind: 'jwt'; message?: string | undefined }) => {
        throw new Error('Function not implemented.')
    },
    cidr: (x, _kind: { kind: 'cidr'; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
    base64url: (x, _kind: { kind: 'base64url'; message?: string | undefined }) => {
        // supported through the arbitrary visitor by using the original node directly
        // throw new Error('Function not implemented.')
        return x
    },
}

const numberVisitor: {
    [key in z3.ZodNumber['_def']['checks'][number]['kind']]: (
        n: NumberType,
        kind: Extract<z3.ZodNumber['_def']['checks'][number], { kind: key }>,
    ) => NumberType
} = {
    min: (n: NumberType, kind: { kind: 'min'; value: number; inclusive: boolean; message?: string | undefined }): NumberType => {
        if (kind.inclusive) {
            return n.gte(kind.value)
        }
        return n.gt(kind.value)
    },
    max: (n: NumberType, kind: { kind: 'max'; value: number; inclusive: boolean; message?: string | undefined }): NumberType => {
        if (kind.inclusive) {
            return n.lte(kind.value)
        }
        return n.lt(kind.value)
    },
    int: (n: NumberType, _kind: { kind: 'int'; message?: string | undefined }): NumberType => {
        return $integer({ ...n._options }) as unknown as NumberType
    },
    multipleOf: (n: NumberType, kind: { kind: 'multipleOf'; value: number; message?: string | undefined }): NumberType => {
        return n.multipleOf(kind.value)
    },
    finite: (_n: NumberType, _kind: { kind: 'finite'; message?: string | undefined }): NumberType => {
        throw new Error('Function not implemented.')
    },
}

export const zod3Visitor: {
    [key in z3.ZodFirstPartySchemaTypes['_def']['typeName']]: (
        node: Extract<z3.ZodFirstPartySchemaTypes, { _def: { typeName: key } }>,
        ctx: ZodV3WalkerContext,
    ) => Node
} = {
    ZodString: (node) => {
        let value = $string()
        for (const check of node._def.checks) {
            const visitor = stringVisitor[check.kind]
            if (visitor) {
                value = visitor(value, check as never)
            }
        }
        return value
    },
    ZodNumber: (node) => {
        let value = $number()
        for (const check of node._def.checks) {
            const visitor = numberVisitor[check.kind]
            if (visitor) {
                value = visitor(value, check as never)
            }
        }
        return value
    },
    ZodNaN: () => {
        throw new Error('Function not implemented.')
    },
    ZodBigInt: () => {
        throw new Error('Function not implemented.')
    },
    ZodBoolean: () => {
        return $boolean()
    },
    ZodDate: () => {
        throw new Error('Function not implemented.')
    },
    ZodSymbol: () => {
        throw new Error('Function not implemented.')
    },
    ZodUndefined: () => {
        return $const(undefined)
    },
    ZodNull: () => {
        return $null()
    },
    ZodAny: () => {
        return $unknown({ restrictToJson: true })
    },
    ZodUnknown: () => {
        return $unknown({ restrictToJson: true })
    },
    ZodNever: () => {
        throw new Error('Function not implemented.')
    },
    ZodVoid: () => {
        throw new Error('Function not implemented.')
    },
    ZodArray: (node, ctx) => {
        const value = $array(ctx.render(node._def.type as z3.ZodFirstPartySchemaTypes))

        if (node._def.exactLength) {
            value._options.minItems = node._def.exactLength.value
            value._options.maxItems = node._def.exactLength.value
        }

        if (node._def.minLength) {
            value._options.minItems = node._def.minLength.value
        }
        if (node._def.maxLength) {
            value._options.maxItems = node._def.maxLength.value
        }

        return value
    },
    ZodObject: (node, ctx) => {
        const value = $object(mapValues(node._def.shape(), (x) => ctx.render(x as z3.ZodFirstPartySchemaTypes)))

        if (
            node._def.catchall &&
            node._def.catchall._def.typeName !== 'ZodNever' &&
            node._def.catchall._def.typeName !== 'ZodAny'
        ) {
            ;(value as RecordType).element = ctx.render(node._def.catchall as z3.ZodFirstPartySchemaTypes)
        }
        return value
    },
    ZodUnion: (node, ctx) => {
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        return $union(node._def.options.map((x: any) => ctx.render(x as z3.ZodFirstPartySchemaTypes)))
    },
    ZodDiscriminatedUnion: (node, ctx) => {
        const union = new DiscriminatedUnionType(
            // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
            node._def.options.map((x: any) => ctx.render(x as z3.ZodFirstPartySchemaTypes)),
            {},
        )
        union._discriminator = node._def.discriminator
        return union
    },
    ZodIntersection: (node, ctx) => {
        return $intersection(
            // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
            [node._def.left, node._def.right].map((x: any) => ctx.render(x as z3.ZodFirstPartySchemaTypes)) as any,
        )
    },
    ZodTuple: (node, ctx) => {
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        let value = $tuple(node._def.items.map((x: any) => ctx.render(x as z3.ZodFirstPartySchemaTypes)))

        if (node._def.rest) {
            value = value.rest(ctx.render(node._def.rest as z3.ZodFirstPartySchemaTypes)) as unknown as TupleType<
                [Node, ...Node[]],
                undefined
            >
        }

        return value
    },
    ZodRecord: (node, ctx) => {
        const record = $record(ctx.render(node._def.valueType as z3.ZodFirstPartySchemaTypes))
        if (node._def.keyType._def.typeName !== 'ZodString') {
            ;(record as RecordType).key = ctx.render(node._def.keyType as z3.ZodFirstPartySchemaTypes)
        }
        return record
    },
    ZodMap: () => {
        throw new Error('Function not implemented.')
    },
    ZodSet: (node, ctx) => {
        const value = $array(ctx.render(node._def.valueType), {
            minItems: node._def.minSize?.value,
            maxItems: node._def.maxSize?.value,
            set: true,
        })
        return value
    },
    ZodFunction: () => {
        throw new Error('Function not implemented.')
    },
    ZodLazy: () => {
        throw new Error('Function not implemented.')
    },
    ZodLiteral: (node) => {
        const value = node._def.value
        // if (typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'string') {
        // }
        return $const(value)
    },
    ZodEnum: (node) => {
        return $enum(node.enum)
    },
    ZodEffects: (node, ctx) => {
        return ctx.render(node._def.schema as z3.ZodFirstPartySchemaTypes)
    },
    ZodNativeEnum: () => {
        throw new Error('Function not implemented.')
    },
    ZodOptional: (node, ctx) => {
        return $optional(ctx.render(node._def.innerType as z3.ZodFirstPartySchemaTypes))
    },
    ZodNullable: (node, ctx) => {
        return $nullable(ctx.render(node._def.innerType as z3.ZodFirstPartySchemaTypes))
    },
    ZodDefault: (node, ctx) => {
        const value = ctx.render(node._def.innerType as z3.ZodFirstPartySchemaTypes)
        value._definition.default = node._def.defaultValue()
        return value
    },
    ZodCatch: () => {
        throw new Error('Function not implemented.')
    },
    ZodPromise: () => {
        throw new Error('Function not implemented.')
    },
    ZodBranded: () => {
        throw new Error('Function not implemented.')
    },
    ZodPipeline: () => {
        throw new Error('Function not implemented.')
    },
    ZodReadonly: () => {
        throw new Error('Function not implemented.')
    },
}

export function $zod3(
    node: z3.ZodFirstPartySchemaTypes,
    {
        cache = new WeakMap(),
        keepOriginalSchema = true,
    }: { cache?: WeakMap<z3.ZodFirstPartySchemaTypes, Node>; keepOriginalSchema?: boolean } = {},
): Node {
    const context = buildContext({ cache, keepOriginalSchema })
    return context.render(node)
}
