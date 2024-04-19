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
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, StringType>>

    const nested = $ref(schema)
    expectTypeOf(nested.infer).toEqualTypeOf<string>()
    type _test_nested_intrinsic = Expect<Equal<Intrinsic<typeof nested>, StringType>>

    const doubleNested = $ref(nested)
    expectTypeOf(doubleNested.infer).toEqualTypeOf<string>()
    type _test_double_nested_intrinsic = Expect<Equal<Intrinsic<typeof doubleNested>, StringType>>

    const trippleNested = $ref(doubleNested)
    expectTypeOf(trippleNested.infer).toEqualTypeOf<string>()
    expectTypeOf(trippleNested.intrinsic).toEqualTypeOf<StringType>()
    type _test_tripple_nested_intrinsic = Expect<Equal<Intrinsic<typeof trippleNested>, StringType>>
})

it('expand', () => {
    expect($ref(foo)).toMatchInlineSnapshot(`
      NodeTrait {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          RecordType {
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
                "id": "1",
                "isCommutative": true,
                "options": {},
                "type": "string",
              },
            ],
            "definition": {},
            "id": "2",
            "isCommutative": false,
            "options": {},
            "recordType": StringType {
              "attributes": {
                "generic": {},
                "typescript": {},
              },
              "definition": {},
              "id": "1",
              "isCommutative": true,
              "options": {},
              "type": "string",
            },
            "shape": {},
            "type": "object",
          },
        ],
        "definition": {},
        "hooks": {
          "onGenerate": [
            [Function],
          ],
          "onLoad": [
            [Function],
          ],
        },
        "id": "1",
        "isCommutative": true,
        "options": {},
        "type": "ref",
      }
    `)
})

it('self reference', () => {
    const json: Node = $union([$string, $array($ref(() => json)), $ref(() => json)])
    expect(json).toMatchInlineSnapshot(`
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
            "id": "5",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
          NodeTrait {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              NodeTrait {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "children": [
                  [Function],
                ],
                "definition": {},
                "hooks": {
                  "onGenerate": [
                    [Function],
                  ],
                  "onLoad": [
                    [Function],
                  ],
                },
                "id": "1",
                "isCommutative": true,
                "options": {},
                "type": "ref",
              },
            ],
            "definition": {},
            "element": NodeTrait {
              "attributes": {
                "generic": {},
                "typescript": {},
              },
              "children": [
                [Function],
              ],
              "definition": {},
              "hooks": {
                "onGenerate": [
                  [Function],
                ],
                "onLoad": [
                  [Function],
                ],
              },
              "id": "1",
              "isCommutative": true,
              "options": {},
              "type": "ref",
            },
            "id": "2",
            "isCommutative": false,
            "options": {},
            "type": "array",
          },
          NodeTrait {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              [Function],
            ],
            "definition": {},
            "hooks": {
              "onGenerate": [
                [Function],
              ],
              "onLoad": [
                [Function],
              ],
            },
            "id": "3",
            "isCommutative": true,
            "options": {},
            "type": "ref",
          },
        ],
        "definition": {},
        "id": "4",
        "isCommutative": true,
        "options": {},
        "type": "union",
      }
    `)
})

it('uuid reference', () => {
    const value = $string()
    const json = $ref(value)
    expect(json).toMatchInlineSnapshot(`
      NodeTrait {
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
            "id": "1",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {},
        "hooks": {
          "onGenerate": [
            [Function],
          ],
          "onLoad": [
            [Function],
          ],
        },
        "id": "2",
        "isCommutative": true,
        "options": {},
        "type": "ref",
      }
    `)
})

it('description ', () => {
    const json: Node = $union([$string, $array($ref(() => json, { description: 'foo array', name: 'json' }))])
    expect(json).toMatchInlineSnapshot(`
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
            "id": "4",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
          NodeTrait {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              NodeTrait {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "children": [
                  [Function],
                ],
                "definition": {
                  "description": "foo array",
                },
                "hooks": {
                  "onGenerate": [
                    [Function],
                  ],
                  "onLoad": [
                    [Function],
                  ],
                },
                "id": "1",
                "isCommutative": true,
                "name": "json",
                "options": {},
                "type": "ref",
              },
            ],
            "definition": {},
            "element": NodeTrait {
              "attributes": {
                "generic": {},
                "typescript": {},
              },
              "children": [
                [Function],
              ],
              "definition": {
                "description": "foo array",
              },
              "hooks": {
                "onGenerate": [
                  [Function],
                ],
                "onLoad": [
                  [Function],
                ],
              },
              "id": "1",
              "isCommutative": true,
              "name": "json",
              "options": {},
              "type": "ref",
            },
            "id": "2",
            "isCommutative": false,
            "options": {},
            "type": "array",
          },
        ],
        "definition": {},
        "id": "3",
        "isCommutative": true,
        "options": {},
        "type": "union",
      }
    `)
})

it('can reference a schema', () => {
    forAll(arbitrary($ref(Typedoc)), (x) => Typedoc.is(x))
})
