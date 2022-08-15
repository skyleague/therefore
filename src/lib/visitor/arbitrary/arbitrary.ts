import type { CstNode } from '../../cst/cst'
import type { CstVisitor } from '../../cst/visitor'
import { walkCst } from '../../cst/visitor'
import { isNamedArray } from '../../guard'
import type { ThereforeCst } from '../../primitives/types'

import type { Arbitrary } from '@skyleague/axioms'
import {
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
    optional,
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

export function toArbitrary<T = unknown>(
    schema: ThereforeCst | { source: string; sourceSymbol: string; is: (o: unknown) => o is T }
): Arbitrary<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
    return walkCst('source' in schema ? (require(schema.source)[schema.sourceSymbol] as CstNode) : schema, arbitraryVisitor, {
        transform: ({ description }, arbitrary) => {
            if (description.nullable === true) {
                arbitrary = nullable(arbitrary)
            }
            if (description.optional === true) {
                arbitrary = optional(arbitrary)
            }
            return arbitrary
        },
    })
}
