import type { TupleType } from './tuple.js'
import { $tuple } from './tuple.js'

import type { Intrinsic } from '../../cst/types.js'
import type { NumberType } from '../number/number.js'
import { $number } from '../number/number.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'

import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($tuple).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $tuple([$string(), $number()])
    expectTypeOf(schema.infer).toEqualTypeOf<[string, number]>()
    expectTypeOf(schema.input).toEqualTypeOf<[string, number]>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, TupleType<[StringType, NumberType], undefined>>>

    const restArg = $tuple([$string(), $number()], { rest: $string() })
    expectTypeOf(restArg.infer).toEqualTypeOf<[string, number, ...string[]]>()
    expectTypeOf(restArg.input).toEqualTypeOf<[string, number, ...string[]]>()
    type _test_rest_intrinsic = Expect<Equal<Intrinsic<typeof restArg>, TupleType<[StringType, NumberType], StringType>>>

    const newRestArg = restArg.rest($number())
    expectTypeOf(newRestArg.infer).toEqualTypeOf<[string, number, ...number[]]>()
    expectTypeOf(newRestArg.input).toEqualTypeOf<[string, number, ...number[]]>()
    type _test_newrest_intrinsic = Expect<Equal<Intrinsic<typeof newRestArg>, TupleType<[StringType, NumberType], NumberType>>>
})

it('expand', () => {
    expect($tuple([$string])).toMatchInlineSnapshot(`
      TupleType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "tuple",
        "items": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
      }
    `)
})

it('example', () => {
    expect($tuple([$string]).jsonschema({ examples: [['bar']] })).toMatchInlineSnapshot(`
      TupleType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
        "_definition": {
          "jsonschema": {
            "examples": [
              [
                "bar",
              ],
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "tuple",
        "items": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
      }
    `)

    // @ts-expect-error - invalid example
    $tuple([$string]).jsonschema({ examples: ['foo'] })
})

it('default', () => {
    expect($tuple([$string], { default: ['bar'] })).toMatchInlineSnapshot(`
      TupleType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
        "_definition": {
          "default": [
            "bar",
          ],
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "tuple",
        "items": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
      }
    `)

    // @ts-expect-error - invalid default
    $tuple([$number], { default: 'foobar' })
})
