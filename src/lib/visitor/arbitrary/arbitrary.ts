import type { JsonSchema } from '../../../json'
import type { CstNode } from '../../cst/cst'
import type { CstVisitor } from '../../cst/visitor'
import { walkCst } from '../../cst/visitor'
import { isNamedArray } from '../../guard'
import { $jsonschema } from '../../primitives/jsonschema'
import type { AyncThereforeCst, ThereforeCst } from '../../primitives/types'
import type { Schema } from '../../types'

import type { Arbitrary } from '@skyleague/axioms'
import {
    optional,
    chainArbitrary,
    domain,
    datetime,
    mapArbitrary,
    toISO8601Date,
    date,
    evaluate,
    boolean,
    dict,
    array,
    string,
    float,
    integer,
    object,
    unknown,
    constant,
    oneOf,
    tuple,
    nullable,
} from '@skyleague/axioms'

export interface ArbitraryContext {
    transform: (node: CstNode, arbitrary: Arbitrary<unknown>) => Arbitrary<unknown>
}

export const arbitraryVisitor: CstVisitor<Arbitrary<unknown>, ArbitraryContext> = {
    string: ({ value: image }) => {
        if (image.format === 'date') {
            return date()
        } else if (image.format === 'date-time') {
            return mapArbitrary((x) => toISO8601Date(x, { format: 'date-time' }), datetime())
        } else if (image.format === 'hostname') {
            return domain()
        }
        return string({
            minLength: image.maxLength,
            maxLength: image.maxLength,
        })
    },

    number: ({ value: image }) => float({ min: image.minimum, max: image.maximum }),
    integer: ({ value: image }) => integer({ min: image.minimum, max: image.maximum }),
    boolean: () => boolean(),
    null: () => constant(null),
    unknown: () => unknown(),
    enum: ({ children }) => oneOf(...(isNamedArray(children) ? children.map(([, c]) => c) : children).map((c) => constant(c))),
    union: ({ children }, context) => oneOf(...children.map((c) => walkCst(c, arbitraryVisitor, context))),
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
    if (description.optional === true) {
        arbitrary = optional(arbitrary, { symbol: undefined })
    }
    return arbitrary
}

export interface ToArbitraryOptions {
    useSchema?: boolean
}

export function toArbitrary<T = unknown>(schema: Schema<T> & { sourceSymbol: `${string}.${string}` }): Promise<Arbitrary<T>>
export function toArbitrary<T = unknown>(schema: Schema<T>, options: { useSchema: false }): Promise<Arbitrary<T>>
export function toArbitrary<T = unknown>(schema: ThereforeCst, options?: ToArbitraryOptions): Arbitrary<T>
export function toArbitrary<T = unknown>(schema: Schema<T> | ThereforeCst, options?: ToArbitraryOptions): Arbitrary<T>
export function toArbitrary<T = unknown>(
    schema: AyncThereforeCst | Schema<T>,
    options: ToArbitraryOptions = {}
): Arbitrary<T> | Promise<Arbitrary<T>> {
    if ('source' in schema) {
        try {
            if (options.useSchema !== false && !schema.sourceSymbol.includes('.')) {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const module = require(schema.source) as Record<string, AyncThereforeCst>
                if (schema.sourceSymbol.includes('.')) {
                    const [sourceSymbol, name] = schema.sourceSymbol.split('.')

                    if ('then' in module[sourceSymbol]) {
                        return Promise.resolve(module[sourceSymbol]).then(({ children }) =>
                            walkCst((children as ThereforeCst[]).find((c) => c.name === name)!, arbitraryVisitor, {
                                transform,
                            })
                        )
                    }
                    return walkCst(
                        (module[sourceSymbol].children as ThereforeCst[]).find((c) => c.name === name)!,
                        arbitraryVisitor,
                        {
                            transform,
                        }
                    )
                } else {
                    if ('then' in module[schema.sourceSymbol]) {
                        return Promise.resolve(module[schema.sourceSymbol]).then((s) =>
                            walkCst(s, arbitraryVisitor, {
                                transform,
                            })
                        )
                    }
                    return walkCst(module[schema.sourceSymbol], arbitraryVisitor, {
                        transform,
                    })
                }
            }
        } catch (_: unknown) {
            //
        }

        return Promise.resolve($jsonschema(schema.schema as JsonSchema)).then((s) => {
            return walkCst(s, arbitraryVisitor, {
                transform,
            })
        })
    }
    return walkCst(schema, arbitraryVisitor, {
        transform,
    })
}
