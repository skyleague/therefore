import type { BooleanType } from './boolean.js'
import { $boolean } from './boolean.js'

import type { InferWith, Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'

import { arbitraryContext, collect, forAll, repeat, take, xoroshiro128plus } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($boolean).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $boolean()
    expectTypeOf(schema.infer).toEqualTypeOf<boolean>()

    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, BooleanType>>

    expectTypeOf(schema.definition.default).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<boolean[] | undefined>()
})

it('types - optional', () => {
    const schema = $boolean().optional()
    expectTypeOf(schema.infer).toEqualTypeOf<boolean | undefined>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, InferWith<BooleanType, undefined>>>

    expectTypeOf(schema.definition.default).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<boolean[] | undefined>()
})

it('example', () => {
    expect($boolean({ jsonschema: { examples: [true, false] } })).toMatchInlineSnapshot(`
      BooleanType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {
          "jsonschema": {
            "examples": [
              true,
              false,
            ],
          },
        },
        "id": "1",
        "isCommutative": true,
        "options": {},
        "type": "boolean",
      }
    `)
    // @ts-expect-error
    $boolean().jsonschema({ examples: ['foo'] })
})

it('default', () => {
    expect($boolean({ default: true })).toMatchInlineSnapshot(`
      BooleanType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {
          "default": true,
        },
        "id": "1",
        "isCommutative": true,
        "options": {},
        "type": "boolean",
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
    expect(
        collect(
            take(
                repeat(() => arb.sample(ctx)),
                10,
            ),
        ),
    ).toMatchInlineSnapshot(`
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
