import type { JsonSchema } from '../../../json'
import type { CstNode } from '../../cst/cst'
import type { CstVisitor } from '../../cst/visitor'
import { walkCst } from '../../cst/visitor'
import { isNamedArray } from '../../guard'
import { $jsonschema } from '../../primitives/jsonschema'
import type { AyncThereforeCst, ThereforeCst } from '../../primitives/types'
import type { Schema } from '../../types'

import type { Arbitrary, Dependent, Promisable } from '@skyleague/axioms'
import {
    allOf,
    array,
    boolean,
    chainArbitrary,
    constant,
    date,
    datetime,
    dict,
    domain,
    evaluate,
    float,
    integer,
    json,
    mapArbitrary,
    nullable,
    object,
    oneOf,
    optional,
    string,
    toISO8601Date,
    tuple,
    unknown,
} from '@skyleague/axioms'

export interface ArbitraryContext {
    transform: (node: CstNode, arbitrary: Arbitrary<unknown>) => Arbitrary<unknown>
}

export const arbitraryVisitor: CstVisitor<Arbitrary<unknown>, ArbitraryContext> = {
    string: ({ value: image }) => {
        if (image.format === 'date') {
            return date()
        } else if (image.format === 'date-time') {
            return mapArbitrary(datetime(), (x) => toISO8601Date(x, { format: 'date-time' }))
        } else if (image.format === 'hostname') {
            return domain()
        }
        return string({
            minLength: image.minLength,
            maxLength: image.maxLength,
        })
    },

    number: ({ value: image }) => float({ min: image.minimum, max: image.maximum }),
    integer: ({ value: image }) => integer({ min: image.minimum, max: image.maximum }),
    boolean: () => boolean(),
    null: () => constant(null),
    unknown: ({ value: image }) => (image.json ? json() : unknown()),
    enum: ({ children }) => oneOf(...(isNamedArray(children) ? children.map(([, c]) => c) : children).map((c) => constant(c))),
    union: ({ children }, context) => oneOf(...children.map((c) => walkCst(c, arbitraryVisitor, context))),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    intersection: ({ children }, context) => allOf(...(children.map((c) => walkCst(c, arbitraryVisitor, context)) as any)),
    object: ({ children, value: { indexSignature } }, context) =>
        indexSignature !== undefined
            ? chainArbitrary(array(string()), (dictKeys) =>
                  object(
                      Object.fromEntries([
                          ...dictKeys.map((k) => [k, walkCst(indexSignature, arbitraryVisitor, context)]),
                          ...children.map((c) => [c.name, walkCst(c, arbitraryVisitor, context)] as const),
                      ])
                  )
              )
            : object(Object.fromEntries(children.map((c) => [c.name, walkCst(c, arbitraryVisitor, context)] as const))),
    array: ({ children, value: image }, context) => {
        const [items] = children
        const child = walkCst(items, arbitraryVisitor, context)
        return array(child, {
            minLength: image.minItems,
            maxLength: image.maxItems,
            uniqueItems: image.uniqueItems,
        })
    },
    tuple: ({ children }, context) =>
        tuple(
            ...(isNamedArray(children) ? children.map(([, c]) => c) : children).map((c) => walkCst(c, arbitraryVisitor, context))
        ),
    dict: ({ children }, context) => {
        const [items] = children
        const child = walkCst(items, arbitraryVisitor, context)
        return dict([string(), child])
    },
    ref: ({ children }, context) => {
        const [reference] = children
        return walkCst(evaluate(reference), arbitraryVisitor, context)
    },
    default: () => {
        throw new Error('should not be called')
    },
}

function transform(
    { description }: CstNode<string, unknown, unknown, unknown[]>,
    arbitrary: Arbitrary<unknown>
): Arbitrary<unknown> {
    if (description.nullable === true) {
        arbitrary = nullable(arbitrary)
    }
    if (description.optional !== undefined) {
        arbitrary = optional(arbitrary, { symbol: undefined })
    }
    return arbitrary
}

export function arbitrary<T = unknown>(schema: ThereforeCst): Dependent<T>
export function arbitrary<T = unknown>(schema: AyncThereforeCst | Schema<T>): Promisable<Dependent<T>>
export function arbitrary<T = unknown>(schema: AyncThereforeCst | Schema<T>): Promisable<Dependent<T>> {
    if ('schema' in schema) {
        return Promise.resolve($jsonschema(schema.schema as JsonSchema, { allowIntersectionTypes: true })).then((s) =>
            walkCst(s, arbitraryVisitor, {
                transform,
            })
        )
    }
    return walkCst(schema, arbitraryVisitor, {
        transform,
    })
}
