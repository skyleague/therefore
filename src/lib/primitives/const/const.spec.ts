import type { ConstType } from './const.js'
import { $const } from './const.js'

import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'

import { arbitraryContext, collect, constant, forAll, repeat, take, tuple, unknown, xoroshiro128plus } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('value', () => {
    forAll(
        unknown().chain((x) => tuple(constant(x), arbitrary($const(x as any)))),
        ([x, value]) => {
            expect(x).toStrictEqual(value)
        },
    )
})

it('types', () => {
    const schema = $const('foobar')
    expectTypeOf(schema.infer).toEqualTypeOf<'foobar'>()
    expectTypeOf(schema.input).toEqualTypeOf<'foobar'>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, ConstType<'foobar'>>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<'foobar' | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<'foobar'[] | undefined>()
})

it('random sample', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($const('foo'))
    expect(
        collect(
            take(
                repeat(() => arb.sample(ctx)),
                10,
            ),
        ),
    ).toMatchInlineSnapshot(`
      [
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
      ]
    `)
})
