import { constant, float, forAll, tuple } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'
import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'
import type { NumberType } from './number.js'
import { $number } from './number.js'

it('function', () => {
    expect($number).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $number()
    expectTypeOf(schema.infer).toEqualTypeOf<number>()
    expectTypeOf(schema.input).toEqualTypeOf<number>()

    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, NumberType>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<number | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<number[] | undefined>()
})

it('multipleOf', () => {
    const isMultiple = (x: number, y: number) => Math.abs(Math.round(x / y) / (1 / y) - x) <= 0.001
    forAll(
        tuple(float({ min: 1 }), float({ min: 1 })).chain(([x, y]) => {
            const multipleOf = Math.ceil(x / y)
            return tuple(constant(multipleOf), arbitrary<number>($number({ multipleOf })))
        }),
        ([multipleOf, value]) => {
            expect(isMultiple(value, multipleOf)).toBe(true)
        },
    )
})

it('max', () => {
    forAll(
        float({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary<number>($number({ max })))
        }),
        ([max, value]) => {
            expect(value).toBeLessThanOrEqual(max)
        },
    )
    forAll(
        float({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary<number>($number({ min: -100, max: 100 }).lt(max)))
        }),
        ([max, value]) => {
            expect(value).toBeLessThanOrEqual(max)
        },
    )
    forAll(
        float({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary<number>($number({ max, maxInclusive: false })))
        }),
        ([max, value]) => {
            expect(value).toBeLessThan(max)
        },
    )
    forAll(
        float({ min: -99, max: 99 }).chain((max) => {
            return tuple(constant(max), arbitrary<number>($number({ min: -100, max: 100 }).lte(max)))
        }),
        ([max, value]) => {
            expect(value).toBeLessThanOrEqual(max)
        },
    )
})

it('min', () => {
    forAll(
        float({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary<number>($number({ min })))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThanOrEqual(min)
        },
    )
    forAll(
        float({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary<number>($number({ min: -100, max: 100 }).gte(min)))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThanOrEqual(min)
        },
    )
    forAll(
        float({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary<number>($number({ min, minInclusive: false })))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThan(min)
        },
    )
    forAll(
        float({ min: -99, max: 99 }).chain((min) => {
            return tuple(constant(min), arbitrary<number>($number({ min: -100, max: 100 }).gt(min)))
        }),
        ([min, value]) => {
            expect(value).toBeGreaterThan(min)
        },
    )
})

it('positive', () => {
    forAll(arbitrary<number>($number().positive()), (value) => {
        expect(value).toBeGreaterThan(0)
    })
})

it('nonnegative', () => {
    forAll(arbitrary<number>($number().nonnegative()), (value) => {
        expect(value).toBeGreaterThanOrEqual(0)
    })
})

it('negative', () => {
    forAll(arbitrary<number>($number().negative()), (value) => {
        expect(value).toBeLessThan(0)
    })
})

it('nonpositive', () => {
    forAll(arbitrary<number>($number().nonpositive()), (value) => {
        expect(value).toBeLessThanOrEqual(0)
    })
})
