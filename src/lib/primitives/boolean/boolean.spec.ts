import { arbitraryContext, forAll, xoroshiro128plus } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'
import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'
import type { OptionalType } from '../optional/optional.js'
import type { BooleanType } from './boolean.js'
import { $boolean } from './boolean.js'

it('function', () => {
    expect($boolean).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $boolean()
    expectTypeOf(schema.infer).toEqualTypeOf<boolean>()
    expectTypeOf(schema.input).toEqualTypeOf<boolean>()

    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, BooleanType>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<boolean[] | undefined>()
})

it('types - optional', () => {
    const schema = $boolean().optional()
    expectTypeOf(schema.infer).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(schema.input).toEqualTypeOf<boolean | undefined>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, OptionalType<BooleanType>>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<(boolean | undefined)[] | undefined>()
})

it('example', () => {
    expect($boolean({ jsonschema: { examples: [true, false] } })).toMatchInlineSnapshot(`
      BooleanType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_definition": {
          "jsonschema": {
            "examples": [
              true,
              false,
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": true,
        "_options": {},
        "_origin": {},
        "_type": "boolean",
      }
    `)
    // @ts-expect-error
    $boolean().jsonschema({ examples: ['foo'] })
})

it('default', () => {
    expect($boolean({ default: true })).toMatchInlineSnapshot(`
      BooleanType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_definition": {
          "default": true,
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": true,
        "_options": {},
        "_origin": {},
        "_type": "boolean",
      }
    `)
    // @ts-expect-error
    $boolean({ default: 'foobar' })
})

it('value', () => {
    forAll(arbitrary($boolean()), (value) => {
        return value || !value
    })
})

it('random sample', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($boolean())
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
      ]
    `)
})
