import type { EnumType, NativeEnumType } from './enum.js'
import { $enum } from './enum.js'

import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'

import {
    arbitraryContext,
    collect,
    constant,
    forAll,
    repeat,
    set,
    string,
    take,
    tuple,
    xoroshiro128plus,
} from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($enum).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $enum(['foo', 'bar'])
    expectTypeOf(schema.infer).toEqualTypeOf<'foo' | 'bar'>()
    expectTypeOf(schema.input).toEqualTypeOf<'foo' | 'bar'>()

    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, EnumType<['foo', 'bar']>>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<'foo' | 'bar' | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<('foo' | 'bar')[] | undefined>()

    const schemaNative = $enum({ foo: 'fooz', bar: 'baz' })
    expectTypeOf(schemaNative.infer).toEqualTypeOf<'fooz' | 'baz'>()
    expectTypeOf(schemaNative.input).toEqualTypeOf<'fooz' | 'baz'>()

    type _test_native_intrinsic = Expect<
        Equal<Intrinsic<typeof schemaNative>, NativeEnumType<{ readonly foo: 'fooz'; readonly bar: 'baz' }>>
    >

    expectTypeOf(schemaNative._definition.default).toEqualTypeOf<'fooz' | 'baz' | undefined>()
    expectTypeOf(schemaNative._definition.jsonschema?.examples).toEqualTypeOf<('fooz' | 'baz')[] | undefined>()
})

it('values', () => {
    expect($enum(['1', '2', '3', '4'])).toMatchInlineSnapshot(`
      EnumType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_isNamed": false,
        "_options": {},
        "_type": "enum",
        "enum": [
          "1",
          "2",
          "3",
          "4",
        ],
      }
    `)
})

it('named', () => {
    expect(
        $enum({
            foo: 'bar',
            woo: 'baz',
        }),
    ).toMatchInlineSnapshot(`
      NativeEnumType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_isNamed": true,
        "_options": {},
        "_type": "enum",
        "enum": {
          "foo": "bar",
          "woo": "baz",
        },
      }
    `)
})

it('values', () => {
    forAll(
        set(string(), { minLength: 1 }).chain((xs) => {
            return tuple(constant(xs), arbitrary<string>($enum(xs)))
        }),
        ([xs, x]) => {
            return xs.includes(x)
        },
    )
})

it('random sample', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($enum(['foo', 'bar']))
    expect(
        collect(
            take(
                repeat(() => arb.sample(ctx)),
                10,
            ),
        ),
    ).toMatchInlineSnapshot(`
      [
        "bar",
        "foo",
        "foo",
        "foo",
        "bar",
        "foo",
        "foo",
        "foo",
        "foo",
        "foo",
      ]
    `)
})
