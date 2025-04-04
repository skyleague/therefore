import { $union } from './union.js'

import type { Intrinsic } from '../../cst/types.js'
import type { BooleanType } from '../boolean/boolean.js'
import { $boolean } from '../boolean/boolean.js'
import type { NumberType } from '../number/number.js'
import { $number } from '../number/number.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'

import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($union).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $union([$string(), $number(), $boolean])

    expectTypeOf(schema.infer).toEqualTypeOf<string | number | boolean>()
    expectTypeOf(schema.input).toEqualTypeOf<string | number | boolean>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, StringType | NumberType | BooleanType>>

    const schemaFn = $union([$string, $number, $boolean])

    expectTypeOf(schemaFn.infer).toEqualTypeOf<string | number | boolean>()
    expectTypeOf(schemaFn.input).toEqualTypeOf<string | number | boolean>()
    type _test_fn_intrinsic = Expect<Equal<Intrinsic<typeof schemaFn>, StringType | NumberType | BooleanType>>
})

it('expand', () => {
    expect($union([$string])).toMatchInlineSnapshot(`
      UnionType {
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
            "_type": "string",
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "union",
      }
    `)
})

it('example', () => {
    expect($union([$string], { jsonschema: { examples: ['bar'] } })).toMatchInlineSnapshot(`
      UnionType {
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
            "_type": "string",
          },
        ],
        "_definition": {
          "jsonschema": {
            "examples": [
              "bar",
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "union",
      }
    `)
})

it('default', () => {
    expect($union([$string], { default: 'bar' })).toMatchInlineSnapshot(`
      UnionType {
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
            "_type": "string",
          },
        ],
        "_definition": {
          "default": "bar",
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "union",
      }
    `)
})
