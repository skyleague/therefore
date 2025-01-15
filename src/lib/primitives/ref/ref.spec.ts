import { $ref } from './ref.js'

import { Typedoc } from '../../../../examples/typedoc/typedoc.type.js'
import type { Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'
import { $array } from '../array/array.js'
import { $record } from '../record/record.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'
import { $union } from '../union/union.js'

import { forAll } from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

const foo = $record($string)
it('function', () => {
    expect($ref).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const value = $string
    const schema = $ref(value)
    expectTypeOf(schema.infer).toEqualTypeOf<string>()
    expectTypeOf(schema.input).toEqualTypeOf<string>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, StringType>>

    const nested = $ref(schema)
    expectTypeOf(nested.infer).toEqualTypeOf<string>()
    expectTypeOf(nested.input).toEqualTypeOf<string>()
    type _test_nested_intrinsic = Expect<Equal<Intrinsic<typeof nested>, StringType>>

    const doubleNested = $ref(nested)
    expectTypeOf(doubleNested.infer).toEqualTypeOf<string>()
    expectTypeOf(doubleNested.input).toEqualTypeOf<string>()
    type _test_double_nested_intrinsic = Expect<Equal<Intrinsic<typeof doubleNested>, StringType>>

    const trippleNested = $ref(doubleNested)
    expectTypeOf(trippleNested.infer).toEqualTypeOf<string>()
    expectTypeOf(trippleNested.input).toEqualTypeOf<string>()
    expectTypeOf(trippleNested.intrinsic).toEqualTypeOf<StringType>()
    type _test_tripple_nested_intrinsic = Expect<Equal<Intrinsic<typeof trippleNested>, StringType>>
})

it('expand', () => {
    expect($ref(foo)).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          RecordType {
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
                "_id": "1",
                "_isCommutative": true,
                "_options": {},
                "_origin": {},
                "_recurrentCache": undefined,
                "_type": "string",
              },
            ],
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": false,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "object",
            "element": StringType {
              "_attributes": {
                "generic": {},
                "isGenerated": true,
                "typescript": {},
                "validator": undefined,
                "validatorType": undefined,
              },
              "_definition": {},
              "_guessedTrace": undefined,
              "_id": "1",
              "_isCommutative": true,
              "_options": {},
              "_origin": {},
              "_recurrentCache": undefined,
              "_type": "string",
            },
            "shape": {},
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_hooks": {
          "onGenerate": [
            [Function],
          ],
          "onLoad": [
            [Function],
          ],
        },
        "_id": "1",
        "_isCommutative": true,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "ref",
      }
    `)
})

it('self reference', () => {
    const json: Node = $union([$string, $array($ref(() => json)), $ref(() => json)])
    expect(json).toMatchInlineSnapshot(`
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
            "_id": "5",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
          NodeTrait {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_children": [
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                  "validatorType": undefined,
                },
                "_children": [
                  [Function],
                ],
                "_definition": {},
                "_guessedTrace": undefined,
                "_hooks": {
                  "onGenerate": [
                    [Function],
                  ],
                  "onLoad": [
                    [Function],
                  ],
                },
                "_id": "1",
                "_isCommutative": true,
                "_options": {},
                "_origin": {},
                "_recurrentCache": undefined,
                "_type": "ref",
              },
            ],
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": false,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "array",
            "element": NodeTrait {
              "_attributes": {
                "generic": {},
                "isGenerated": true,
                "typescript": {},
                "validator": undefined,
                "validatorType": undefined,
              },
              "_children": [
                [Function],
              ],
              "_definition": {},
              "_guessedTrace": undefined,
              "_hooks": {
                "onGenerate": [
                  [Function],
                ],
                "onLoad": [
                  [Function],
                ],
              },
              "_id": "1",
              "_isCommutative": true,
              "_options": {},
              "_origin": {},
              "_recurrentCache": undefined,
              "_type": "ref",
            },
          },
          NodeTrait {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_children": [
              [Function],
            ],
            "_definition": {},
            "_guessedTrace": undefined,
            "_hooks": {
              "onGenerate": [
                [Function],
              ],
              "onLoad": [
                [Function],
              ],
            },
            "_id": "3",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "ref",
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "4",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "union",
      }
    `)
})

it('uuid reference', () => {
    const value = $string()
    const json = $ref(value)
    expect(json).toMatchInlineSnapshot(`
      NodeTrait {
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
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_hooks": {
          "onGenerate": [
            [Function],
          ],
          "onLoad": [
            [Function],
          ],
        },
        "_id": "2",
        "_isCommutative": true,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "ref",
      }
    `)
})

it('description ', () => {
    const json: Node = $union([$string, $array($ref(() => json, { description: 'foo array', name: 'json' }))])
    expect(json).toMatchInlineSnapshot(`
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
            "_id": "4",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "string",
          },
          NodeTrait {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_children": [
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                  "validatorType": undefined,
                },
                "_children": [
                  [Function],
                ],
                "_definition": {
                  "description": "foo array",
                },
                "_guessedTrace": undefined,
                "_hooks": {
                  "onGenerate": [
                    [Function],
                  ],
                  "onLoad": [
                    [Function],
                  ],
                },
                "_id": "1",
                "_isCommutative": true,
                "_name": "json",
                "_options": {},
                "_origin": {},
                "_recurrentCache": undefined,
                "_type": "ref",
              },
            ],
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "2",
            "_isCommutative": false,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "array",
            "element": NodeTrait {
              "_attributes": {
                "generic": {},
                "isGenerated": true,
                "typescript": {},
                "validator": undefined,
                "validatorType": undefined,
              },
              "_children": [
                [Function],
              ],
              "_definition": {
                "description": "foo array",
              },
              "_guessedTrace": undefined,
              "_hooks": {
                "onGenerate": [
                  [Function],
                ],
                "onLoad": [
                  [Function],
                ],
              },
              "_id": "1",
              "_isCommutative": true,
              "_name": "json",
              "_options": {},
              "_origin": {},
              "_recurrentCache": undefined,
              "_type": "ref",
            },
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "3",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "union",
      }
    `)
})

it('can reference a schema', () => {
    forAll(arbitrary($ref(Typedoc)), (x) => Typedoc.is(x))
})
