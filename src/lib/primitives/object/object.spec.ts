import type { ObjectType } from './object.js'
import { $object } from './object.js'

import type { AsNullable, AsOptional, AsRequired, Intrinsic } from '../../cst/types.js'
import { $array } from '../array/array.js'
import type { BooleanType } from '../boolean/boolean.js'
import { $boolean } from '../boolean/boolean.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'

import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('function', () => {
    expect($object).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $object({ foo: $string })
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo: string }>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, ObjectType<{ foo: StringType }>>>

    expectTypeOf(schema.definition.default).toEqualTypeOf<{ foo: string } | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<{ foo: string }[] | undefined>()
})

it('types - modifiers', () => {
    const schema = $object({ foo: $string().optional(), bar: $boolean().nullable() })
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null }>()
    type _test_intrinsic = Expect<
        Equal<Intrinsic<typeof schema>, ObjectType<{ foo: AsOptional<StringType>; bar: AsNullable<BooleanType> }>>
    >

    expectTypeOf(schema.definition.default).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null } | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<
        { foo?: string | undefined; bar: boolean | null }[] | undefined
    >()
})

it('types - partials', () => {
    const schema = $object({ foo: $string, bar: $boolean }).partial()
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo?: string | undefined; bar?: boolean | undefined }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: AsOptional<StringType>
                bar: AsOptional<BooleanType>
            }>
        >
    >

    expectTypeOf(schema.definition.default).toEqualTypeOf<
        | {
              foo?: string | undefined
              bar?: boolean | undefined
          }
        | undefined
    >()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<
        | {
              foo?: string | undefined
              bar?: boolean | undefined
          }[]
        | undefined
    >()
})

it('types - partials - by name', () => {
    const schema = $object({ foo: $string, bar: $boolean }).partial('foo')
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo?: string | undefined; bar: boolean }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: AsOptional<StringType>
                bar: BooleanType
            }>
        >
    >

    expectTypeOf(schema.definition.default).toEqualTypeOf<
        | {
              foo?: string | undefined
              bar: boolean
          }
        | undefined
    >()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<
        | {
              foo?: string | undefined
              bar: boolean
          }[]
        | undefined
    >()
})

it('types - required', () => {
    const schema = $object({ foo: $string().optional(), bar: $boolean }).required()
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo: string; bar: boolean }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: AsRequired<AsOptional<StringType>>
                bar: AsRequired<BooleanType>
            }>
        >
    >

    expectTypeOf(schema.definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
          }
        | undefined
    >()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
          }[]
        | undefined
    >()
})

it('types - required - by name', () => {
    const schema = $object({ foo: $string().optional(), bar: $boolean }).required('foo')
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo: string; bar: boolean }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: AsRequired<AsOptional<StringType>>
                bar: BooleanType
            }>
        >
    >

    expectTypeOf(schema.definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
          }
        | undefined
    >()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
          }[]
        | undefined
    >()
})

it('types - extends', () => {
    const schema = $object({ foo: $string, bar: $boolean })
    const other = schema.extend({ baz: $string })
    expectTypeOf(other.infer).toEqualTypeOf<{ foo: string; bar: boolean; baz: string }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof other>,
            ObjectType<{
                foo: StringType
                bar: BooleanType
                baz: StringType
            }>
        >
    >

    expectTypeOf(other.definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
              baz: string
          }
        | undefined
    >()
    expectTypeOf(other.definition.jsonschema?.examples).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
              baz: string
          }[]
        | undefined
    >()
})

it('types - merge', () => {
    const schemaA = $object({ foo: $string, bar: $boolean })
    const schemaB = $object({ baz: $string })
    const other = schemaA.merge(schemaB)
    expectTypeOf(other.infer).toEqualTypeOf<{ foo: string; bar: boolean; baz: string }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof other>,
            ObjectType<{
                foo: StringType
                bar: BooleanType
                baz: StringType
            }>
        >
    >

    expectTypeOf(other.definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
              baz: string
          }
        | undefined
    >()
    expectTypeOf(other.definition.jsonschema?.examples).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
              baz: string
          }[]
        | undefined
    >()
})

it('expand', () => {
    expect($object({ foo: $string })).toMatchInlineSnapshot(`
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
      }
    `)
    expect($object({ foo: $object({}) })).toMatchInlineSnapshot(`
      ObjectType {
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
            "children": [],
            "definition": {},
            "id": "6",
            "isCommutative": false,
            "name": "foo",
            "options": {},
            "shape": {},
            "type": "object",
          },
        ],
        "definition": {},
        "id": "5",
        "isCommutative": false,
        "options": {},
        "shape": {
          "foo": ObjectType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [],
            "definition": {},
            "id": "6",
            "isCommutative": false,
            "name": "foo",
            "options": {},
            "shape": {},
            "type": "object",
          },
        },
        "type": "object",
      }
    `)
})

it('example', () => {
    expect($object({}, { jsonschema: { examples: [{ foo: 'bar' }] } })).toMatchInlineSnapshot(`
      ObjectType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [],
        "definition": {
          "jsonschema": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
        },
        "id": "1",
        "isCommutative": false,
        "options": {},
        "shape": {},
        "type": "object",
      }
    `)

    // @ts-expect-error - invalid example
    $object({ foo: $string }).jsonschema({ examples: ['foo'] })
})

it('default', () => {
    expect($object({}, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
      ObjectType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [],
        "definition": {
          "default": {
            "foo": "bar",
          },
        },
        "id": "1",
        "isCommutative": false,
        "options": {},
        "shape": {},
        "type": "object",
      }
    `)

    // @ts-expect-error - invalid default
    $object({ foo: $string }, { default: 'foobar' })
})

it('complex', () => {
    expect(
        $object(
            {
                ids: $array($string, {
                    description:
                        'The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.',
                    minItems: 1,
                    //uniqueItems: true,
                }),
                matches: $string({
                    description:
                        'The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.',
                }),

                booleans: $boolean({
                    default: false,
                    description:
                        "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
                }),
            },
            {
                description:
                    'Declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.',
            },
        ),
    ).toMatchInlineSnapshot(`
      ObjectType {
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
              "description": "The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.",
            },
            "element": StringType {
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
            "id": "6",
            "isCommutative": false,
            "name": "ids",
            "options": {
              "minItems": 1,
            },
            "type": "array",
          },
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {
              "description": "The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.",
            },
            "id": "7",
            "isCommutative": true,
            "name": "matches",
            "options": {},
            "type": "string",
          },
          BooleanType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {
              "default": false,
              "description": "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
            },
            "id": "8",
            "isCommutative": true,
            "name": "booleans",
            "options": {},
            "type": "boolean",
          },
        ],
        "definition": {
          "description": "Declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.",
        },
        "id": "5",
        "isCommutative": false,
        "options": {},
        "shape": {
          "booleans": BooleanType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {
              "default": false,
              "description": "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
            },
            "id": "8",
            "isCommutative": true,
            "name": "booleans",
            "options": {},
            "type": "boolean",
          },
          "ids": NodeTrait {
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
              "description": "The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.",
            },
            "element": StringType {
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
            "id": "6",
            "isCommutative": false,
            "name": "ids",
            "options": {
              "minItems": 1,
            },
            "type": "array",
          },
          "matches": StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {
              "description": "The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.",
            },
            "id": "7",
            "isCommutative": true,
            "name": "matches",
            "options": {},
            "type": "string",
          },
        },
        "type": "object",
      }
    `)
})
