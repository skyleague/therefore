import { arbitraryContext, forAll, xoroshiro128plus } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'
import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'
import type { ConstType } from '../const/const.js'
import { $null } from './null.js'

it('value', () => {
    forAll(arbitrary($null()), (x) => {
        expect(x).toBeNull()
    })
})

it('types', () => {
    const schema = $null()
    expectTypeOf(schema.infer).toEqualTypeOf<null>()
    expectTypeOf(schema.input).toEqualTypeOf<null>()

    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, ConstType<null>>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<null | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<null[] | undefined>()
})

it('random sample', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($null())
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]
    `)
})
