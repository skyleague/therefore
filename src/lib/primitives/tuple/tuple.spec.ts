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
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, TupleType<[StringType, NumberType]>>>

    const restArg = $tuple([$string(), $number()], { rest: $string() })
    expectTypeOf(restArg.infer).toEqualTypeOf<[string, number, ...string[]]>()
    type _test_rest_intrinsic = Expect<Equal<Intrinsic<typeof restArg>, TupleType<[StringType, NumberType], StringType>>>

    const newRestArg = restArg.rest($number())
    expectTypeOf(newRestArg.infer).toEqualTypeOf<[string, number, ...number[]]>()
    type _test_newrest_intrinsic = Expect<Equal<Intrinsic<typeof newRestArg>, TupleType<[StringType, NumberType], NumberType>>>
})

it('expand', () => {
    expect($tuple([$string])).toMatchInlineSnapshot(`
      TupleType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {},
        "elements": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "id": "1",
        "isCommutative": false,
        "options": {},
        "type": "tuple",
      }
    `)
})

it('example', () => {
    expect($tuple([$string]).jsonschema({ examples: [['bar']] })).toMatchInlineSnapshot(`
      TupleType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {
          "jsonschema": {
            "examples": [
              [
                "bar",
              ],
            ],
          },
        },
        "elements": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "id": "1",
        "isCommutative": false,
        "options": {},
        "type": "tuple",
      }
    `)

    // @ts-expect-error - invalid example
    $tuple([$string]).jsonschema({ examples: ['foo'] })
})

it('default', () => {
    expect($tuple([$string], { default: ['bar'] })).toMatchInlineSnapshot(`
      TupleType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {
          "default": [
            "bar",
          ],
        },
        "elements": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "id": "1",
        "isCommutative": false,
        "options": {},
        "type": "tuple",
      }
    `)

    // @ts-expect-error - invalid default
    $tuple([$number], { default: 'foobar' })
})
