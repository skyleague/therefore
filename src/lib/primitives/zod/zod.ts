import { mapValues } from '@skyleague/axioms'
import type { IpVersion, ZodFirstPartySchemaTypes, ZodNumber, ZodString } from 'zod'
import type { Node } from '../../cst/node.js'
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
import { $union } from '../union/union.js'
import { $unknown } from '../unknown/unknown.js'

export interface ZodWalkerContext {
    cache: WeakMap<ZodFirstPartySchemaTypes, Node>
    render: (node: ZodFirstPartySchemaTypes, ctx?: Partial<ZodWalkerContext>) => Node
}

export function buildContext(options: Partial<ZodWalkerContext> = {}): ZodWalkerContext {
    const context: ZodWalkerContext = {
        cache: new Map(),
        render: (node, ctx: Partial<ZodWalkerContext> = {}): Node => {
            if (context.cache.has(node)) {
                return context.cache.get(node) as Node
            }
            const value = zodVisitor[node._def.typeName](node as never, {
                ...context,
                ...ctx,
            })
            if (node._def.description) {
                value._definition.description = node._def.description
            }

            context.cache.set(node, value)

            return value
        },
        ...options,
    } satisfies ZodWalkerContext
    return context
}

const stringVisitor: {
    [key in ZodString['_def']['checks'][number]['kind']]: (
        n: StringType,
        kind: Extract<ZodString['_def']['checks'][number], { kind: key }>,
    ) => StringType
} = {
    email: (x, _kind: { kind: 'email'; message?: string }) => {
        return x.email()
    },
    length: (x, kind: { kind: 'length'; value: number; message?: string }) => {
        return x.minLength(kind.value).maxLength(kind.value)
    },
    min: (x, kind: { kind: 'min'; value: number; message?: string }) => {
        return x.minLength(kind.value)
    },
    max: (x, kind: { kind: 'max'; value: number; message?: string }) => {
        return x.maxLength(kind.value)
    },
    includes: (_x, _kind: { kind: 'includes'; value: string; position?: number; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    url: (x, _kind: { kind: 'url'; message?: string }) => {
        return x.uri()
    },
    base64: (x, _kind: { kind: 'base64'; message?: string }) => {
        return x.base64()
    },
    datetime: (
        x,
        _kind: {
            kind: 'datetime'
            offset: boolean
            local: boolean
            precision: number | null
            message?: string
        },
    ) => {
        return x.datetime()
    },
    date: (x, _kind: { kind: 'date'; message?: string }) => {
        return x.date()
    },
    time: (x, _kind: { kind: 'time'; precision: number | null; message?: string }) => {
        return x.time()
    },
    uuid: (x, _kind: { kind: 'uuid'; message?: string }) => {
        return x.uuid()
    },
    ulid: (x, _kind: { kind: 'ulid'; message?: string }) => {
        return x.ulid()
    },
    regex: (x, kind: { kind: 'regex'; regex: RegExp; message?: string }) => {
        return x.regex(kind.regex)
    },
    toLowerCase: (_x, _kind: { kind: 'toLowerCase'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    toUpperCase: (_x, _kind: { kind: 'toUpperCase'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    trim: (_x, _kind: { kind: 'trim'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    endsWith: (_x, _kind: { kind: 'endsWith'; value: string; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    startsWith: (_x, _kind: { kind: 'startsWith'; value: string; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    emoji: (_x, _kind: { kind: 'emoji'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    nanoid: (_x, _kind: { kind: 'nanoid'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    cuid: (_x, _kind: { kind: 'cuid'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    cuid2: (_x, _kind: { kind: 'cuid2'; message?: string }) => {
        throw new Error('Function not implemented.')
    },
    ip: (x, kind: { kind: 'ip'; version?: IpVersion; message?: string }) => {
        if (kind.version === 'v4') {
            return x.ipv4()
        }
        return x.ipv6()
    },
    duration: (x, _kind: { kind: 'duration'; message?: string }) => {
        return x.duration()
    },
}

const numberVisitor: {
    [key in ZodNumber['_def']['checks'][number]['kind']]: (
        n: NumberType,
        kind: Extract<ZodNumber['_def']['checks'][number], { kind: key }>,
    ) => NumberType
} = {
    min: (n: NumberType, kind: { kind: 'min'; value: number; inclusive: boolean; message?: string }): NumberType => {
        if (kind.inclusive) {
            return n.gte(kind.value)
        }
        return n.gt(kind.value)
    },
    max: (n: NumberType, kind: { kind: 'max'; value: number; inclusive: boolean; message?: string }): NumberType => {
        if (kind.inclusive) {
            return n.lte(kind.value)
        }
        return n.lt(kind.value)
    },
    int: (n: NumberType, _kind: { kind: 'int'; message?: string }): NumberType => {
        return $integer({ ...n._options }) as unknown as NumberType
    },
    multipleOf: (n: NumberType, kind: { kind: 'multipleOf'; value: number; message?: string }): NumberType => {
        return n.multipleOf(kind.value)
    },
    finite: (_n: NumberType, _kind: { kind: 'finite'; message?: string }): NumberType => {
        throw new Error('Function not implemented.')
    },
}

export const zodVisitor: {
    [key in ZodFirstPartySchemaTypes['_def']['typeName']]: (
        node: Extract<ZodFirstPartySchemaTypes, { _def: { typeName: key } }>,
        ctx: ZodWalkerContext,
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
        const value = $array(ctx.render(node._def.type as ZodFirstPartySchemaTypes))

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
        const value = $object(mapValues(node._def.shape(), (x) => ctx.render(x as ZodFirstPartySchemaTypes)))

        if (
            node._def.catchall &&
            node._def.catchall._def.typeName !== 'ZodNever' &&
            node._def.catchall._def.typeName !== 'ZodAny'
        ) {
            ;(value as RecordType).element = ctx.render(node._def.catchall as ZodFirstPartySchemaTypes)
        }
        return value
    },
    ZodUnion: (node, ctx) => {
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        return $union(node._def.options.map((x: any) => ctx.render(x as ZodFirstPartySchemaTypes)))
    },
    ZodDiscriminatedUnion: () => {
        throw new Error('Function not implemented.')
    },
    ZodIntersection: (node, ctx) => {
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        return $intersection([node._def.left, node._def.right].map((x: any) => ctx.render(x as ZodFirstPartySchemaTypes)) as any)
    },
    ZodTuple: (node, ctx) => {
        // biome-ignore lint/suspicious/noExplicitAny: we'll cast it away
        let value = $tuple(node._def.items.map((x: any) => ctx.render(x as ZodFirstPartySchemaTypes)))

        if (node._def.rest) {
            value = value.rest(ctx.render(node._def.rest as ZodFirstPartySchemaTypes)) as unknown as TupleType
        }

        return value
    },
    ZodRecord: (node, ctx) => {
        return $record(ctx.render(node._def.valueType as ZodFirstPartySchemaTypes))
    },
    ZodMap: () => {
        throw new Error('Function not implemented.')
    },
    ZodSet: () => {
        throw new Error('Function not implemented.')
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
        return ctx.render(node._def.schema as ZodFirstPartySchemaTypes)
    },
    ZodNativeEnum: () => {
        throw new Error('Function not implemented.')
    },
    ZodOptional: (node, ctx) => {
        return $optional(ctx.render(node._def.innerType as ZodFirstPartySchemaTypes))
    },
    ZodNullable: (node, ctx) => {
        return $nullable(ctx.render(node._def.innerType as ZodFirstPartySchemaTypes))
    },
    ZodDefault: (node, ctx) => {
        const value = ctx.render(node._def.innerType as ZodFirstPartySchemaTypes)
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

export function $zod(
    node: ZodFirstPartySchemaTypes,
    { cache = new WeakMap() }: { cache?: WeakMap<ZodFirstPartySchemaTypes, Node> } = {},
): Node {
    const context = buildContext({ cache })
    return context.render(node)
}
