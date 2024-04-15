import { $intersection } from './intersection.js'

import type { AsNullable, AsOptional, Intrinsic } from '../../cst/types.js'
import type { BooleanType } from '../boolean/boolean.js'
import { $boolean } from '../boolean/boolean.js'
import type { ObjectType } from '../object/object.js'
import { $object } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'

import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($intersection).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $intersection([$object({ foo: $string }), $object({ bar: $string })])
    expectTypeOf(schema.infer).toEqualTypeOf<{
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
                foo: AsOptional<StringType>
                bar: AsNullable<BooleanType>
            }>
        >
    >

    expectTypeOf(schema.definition.default).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null } | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<
        { foo?: string | undefined; bar: boolean | null }[] | undefined
    >()
})

it('expand', () => {
    expect($intersection([$object({ foo: $string })])).toMatchInlineSnapshot(`
      IntersectionType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          ObjectType {
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
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            ],
            "definition": {},
            "id": "1",
            "isCommutative": false,
            "options": {},
            "shape": {
              "foo": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            },
            "type": "object",
          },
        ],
        "definition": {},
        "id": "4",
        "isCommutative": false,
        "options": {},
        "type": "intersection",
      }
    `)
})

it('example', () => {
    expect($intersection([$object({ foo: $string })]).jsonschema({ examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
      IntersectionType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          ObjectType {
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
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            ],
            "definition": {},
            "id": "1",
            "isCommutative": false,
            "options": {},
            "shape": {
              "foo": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            },
            "type": "object",
          },
        ],
        "definition": {
          "jsonschema": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
        },
        "id": "4",
        "isCommutative": false,
        "options": {},
        "type": "intersection",
      }
    `)
})

it('default', () => {
    expect($intersection([$object({ foo: $string })], { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
      IntersectionType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          ObjectType {
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
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            ],
            "definition": {},
            "id": "1",
            "isCommutative": false,
            "options": {},
            "shape": {
              "foo": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            },
            "type": "object",
          },
        ],
        "definition": {
          "default": {
            "foo": "bar",
          },
        },
        "id": "4",
        "isCommutative": false,
        "options": {},
        "type": "intersection",
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
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          ObjectType {
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
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            ],
            "definition": {},
            "id": "1",
            "isCommutative": false,
            "options": {},
            "shape": {
              "foo": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "3",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
            },
            "type": "object",
          },
          ObjectType {
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
                "id": "6",
                "isCommutative": true,
                "name": "bar",
                "options": {},
                "type": "string",
              },
            ],
            "definition": {},
            "id": "4",
            "isCommutative": false,
            "options": {},
            "shape": {
              "bar": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "6",
                "isCommutative": true,
                "name": "bar",
                "options": {},
                "type": "string",
              },
            },
            "type": "object",
          },
        ],
        "definition": {
          "jsonschema": {
            "examples": [
              {
                "bar": "foo",
                "foo": "bar",
              },
            ],
          },
        },
        "id": "7",
        "isCommutative": false,
        "options": {},
        "type": "intersection",
      }
    `)
})

const ref = $object({ bar: $string })
it('reference intersection', () => {
    expect(
        $intersection([$object({ foo: $string }), $ref(ref)]).jsonschema({ examples: [{ foo: 'bar', bar: 'foo' }] }),
    ).toMatchInlineSnapshot(`
          IntersectionType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              ObjectType {
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
                    "id": "3",
                    "isCommutative": true,
                    "name": "foo",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {},
                "id": "1",
                "isCommutative": false,
                "options": {},
                "shape": {
                  "foo": StringType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "3",
                    "isCommutative": true,
                    "name": "foo",
                    "options": {},
                    "type": "string",
                  },
                },
                "type": "object",
              },
              NodeTrait {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "children": [
                  ObjectType {
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
                        "id": "3",
                        "isCommutative": true,
                        "name": "bar",
                        "options": {},
                        "type": "string",
                      },
                    ],
                    "definition": {},
                    "id": "1",
                    "isCommutative": false,
                    "options": {},
                    "shape": {
                      "bar": StringType {
                        "attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "definition": {},
                        "id": "3",
                        "isCommutative": true,
                        "name": "bar",
                        "options": {},
                        "type": "string",
                      },
                    },
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
                "id": "4",
                "isCommutative": true,
                "options": {},
                "type": "ref",
              },
            ],
            "definition": {
              "jsonschema": {
                "examples": [
                  {
                    "bar": "foo",
                    "foo": "bar",
                  },
                ],
              },
            },
            "id": "5",
            "isCommutative": false,
            "options": {},
            "type": "intersection",
          }
        `)
})
