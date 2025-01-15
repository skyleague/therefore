import { $intersection } from './intersection.js'

import type { Intrinsic } from '../../cst/types.js'
import type { BooleanType } from '../boolean/boolean.js'
import { $boolean } from '../boolean/boolean.js'
import type { ObjectType } from '../object/object.js'
import { $object } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'

import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'
import type { NullableType } from '../nullable/nullable.js'
import type { OptionalType } from '../optional/optional.js'

it('function', () => {
    expect($intersection).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $intersection([$object({ foo: $string }), $object({ bar: $string })])
    expectTypeOf(schema.infer).toEqualTypeOf<{
        foo: string
        bar: string
    }>()
    expectTypeOf(schema.input).toEqualTypeOf<{
        foo: string
        bar: string
    }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            | ObjectType<{
                  foo: StringType
              }>
            | ObjectType<{
                  bar: StringType
              }>
        >
    >
})

it('types - modifiers', () => {
    const schema = $object({ foo: $string().optional(), bar: $boolean().nullable() })
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null }>()

    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: OptionalType<StringType>
                bar: NullableType<BooleanType>
            }>
        >
    >

    expectTypeOf(schema._definition.default).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null } | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<
        { foo?: string | undefined; bar: boolean | null }[] | undefined
    >()
})

it('expand', () => {
    expect($intersection([$object({ foo: $string })])).toMatchInlineSnapshot(`
      IntersectionType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          ObjectType {
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
            "_type": "object",
            "shape": {
              "foo": StringType {
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
        "_type": "intersection",
      }
    `)
})

it('example', () => {
    expect($intersection([$object({ foo: $string })]).jsonschema({ examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
      IntersectionType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          ObjectType {
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
            "_type": "object",
            "shape": {
              "foo": StringType {
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
            },
          },
        ],
        "_definition": {
          "jsonschema": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "3",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "intersection",
      }
    `)
})

it('default', () => {
    expect($intersection([$object({ foo: $string })], { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
      IntersectionType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          ObjectType {
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
            "_type": "object",
            "shape": {
              "foo": StringType {
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
            },
          },
        ],
        "_definition": {
          "default": {
            "foo": "bar",
          },
        },
        "_guessedTrace": undefined,
        "_id": "3",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "intersection",
      }
    `)
})

it('object intersection', () => {
    expect(
        $intersection([$object({ foo: $string }), $object({ bar: $string })]).jsonschema({
            examples: [{ foo: 'bar', bar: 'foo' }],
        }),
    ).toMatchInlineSnapshot(`
      IntersectionType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          ObjectType {
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
            "_type": "object",
            "shape": {
              "foo": StringType {
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
            },
          },
          ObjectType {
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
            ],
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "3",
            "_isCommutative": false,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "object",
            "shape": {
              "bar": StringType {
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
            },
          },
        ],
        "_definition": {
          "jsonschema": {
            "examples": [
              {
                "bar": "foo",
                "foo": "bar",
              },
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "5",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "intersection",
      }
    `)
})

const ref = $object({ bar: $string })
it('reference intersection', () => {
    expect(
        $intersection([$object({ foo: $string }), $ref(ref)]).jsonschema({ examples: [{ foo: 'bar', bar: 'foo' }] }),
    ).toMatchInlineSnapshot(`
      IntersectionType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          ObjectType {
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
            "_type": "object",
            "shape": {
              "foo": StringType {
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
              ObjectType {
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
                "_type": "object",
                "shape": {
                  "bar": StringType {
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
                },
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
            "_id": "3",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_recurrentCache": undefined,
            "_type": "ref",
          },
        ],
        "_definition": {
          "jsonschema": {
            "examples": [
              {
                "bar": "foo",
                "foo": "bar",
              },
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "4",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "intersection",
      }
    `)
})
