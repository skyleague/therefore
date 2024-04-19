import type { IntegerType } from './integer.js'
import { $integer } from './integer.js'

import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'

import { constant, forAll, integer, tuple } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($integer).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $integer()
    expectTypeOf(schema.infer).toEqualTypeOf<number>()

    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, IntegerType>>

    expectTypeOf(schema.definition.default).toEqualTypeOf<number | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<number[] | undefined>()
})

it('multipleOf', () => {
    const isMultiple = (x: number, y: number) => Math.abs(Math.round(x / y) / (1 / y) - x) <= 0.001
    forAll(
        tuple(integer({ min: 1 }), integer({ min: 1 })).chain(([x, y]) => {
            const multipleOf = Math.ceil(x / y)
            return tuple(constant(multipleOf), arbitrary($integer({ multipleOf })))
        }),
        ([multipleOf, value]) => {
            expect(isMultiple(value, multipleOf)).toBe(true)
        },
    )
})

it('max', () => {
    forAll(
        integer({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary($integer({ max })))
        }),
        ([max, value]) => {
            expect(value).toBeLessThanOrEqual(max)
        },
    )
    forAll(
        integer({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary($integer({ min: -100, max: 100 }).lt(max)))
        }),
        ([max, value]) => {
            expect(value).toBeLessThanOrEqual(max)
        },
    )
    forAll(
        integer({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary($integer({ max, maxInclusive: false })))
        }),
        ([max, value]) => {
            expect(value).toBeLessThan(max)
        },
    )
    forAll(
        integer({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary($integer({ min: -100, max: 100 }).lte(max)))
        }),
        ([max, value]) => {
            expect(value).toBeLessThanOrEqual(max)
        },
    )
})

it('min', () => {
    forAll(
        integer({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary($integer({ min })))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThanOrEqual(min)
        },
    )
    forAll(
        integer({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary($integer({ min: -100, max: 100 }).gte(min)))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThanOrEqual(min)
        },
    )
    forAll(
        integer({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary($integer({ min, minInclusive: false })))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThan(min)
        },
    )
    forAll(
        integer({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary($integer({ min: -100, max: 100 }).gt(min)))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThan(min)
        },
    )
})

it('positive', () => {
    forAll(arbitrary($integer().positive()), (value) => {
        expect(value).toBeGreaterThan(0)
    })
})

it('nonnegative', () => {
    forAll(arbitrary($integer().nonnegative()), (value) => {
        expect(value).toBeGreaterThanOrEqual(0)
    })
})

it('negative', () => {
    forAll(arbitrary($integer().negative()), (value) => {
        expect(value).toBeLessThan(0)
    })
})

it('nonpositive', () => {
    forAll(arbitrary($integer().nonpositive()), (value) => {
        expect(value).toBeLessThanOrEqual(0)
    })
})
