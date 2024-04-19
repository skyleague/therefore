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
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, StringType | NumberType | BooleanType>>

    const schemaFn = $union([$string, $number, $boolean])

    expectTypeOf(schemaFn.infer).toEqualTypeOf<string | number | boolean>()
    type _test_fn_intrinsic = Expect<Equal<Intrinsic<typeof schemaFn>, StringType | NumberType | BooleanType>>
})

it('expand', () => {
    expect($union([$string])).toMatchInlineSnapshot(`
      UnionType {
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
        "id": "1",
        "isCommutative": true,
        "options": {},
        "type": "union",
      }
    `)
})

it('example', () => {
    expect($union([$string], { jsonschema: { examples: ['bar'] } })).toMatchInlineSnapshot(`
      UnionType {
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
              "bar",
            ],
          },
        },
        "id": "1",
        "isCommutative": true,
        "options": {},
        "type": "union",
      }
    `)
})

it('default', () => {
    expect($union([$string], { default: 'bar' })).toMatchInlineSnapshot(`
      UnionType {
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
          "default": "bar",
        },
        "id": "1",
        "isCommutative": true,
        "options": {},
        "type": "union",
      }
    `)
})
