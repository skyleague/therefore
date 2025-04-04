import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'
import type { Intrinsic } from '../../cst/types.js'
import { $array } from '../array/array.js'
import type { BooleanType } from '../boolean/boolean.js'
import { $boolean } from '../boolean/boolean.js'
import type { NullableType } from '../nullable/nullable.js'
import type { DefaultType } from '../optional/default.js'
import type { OptionalType } from '../optional/optional.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'
import type { ObjectType } from './object.js'
import { $object } from './object.js'

it('function', () => {
    expect($object).toMatchInlineSnapshot('[Function]')
})

it('types', () => {
    const schema = $object({ foo: $string })
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo: string }>()
    expectTypeOf(schema.input).toEqualTypeOf<{ foo: string }>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, ObjectType<{ foo: StringType }>>>

    expectTypeOf(schema._definition.default).toEqualTypeOf<{ foo: string } | undefined>()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<{ foo: string }[] | undefined>()
})

it('types - modifiers', () => {
    const schema = $object({ foo: $string().optional(), bar: $boolean().nullable(), def: $string().optional().default('foo') })

    expectTypeOf(schema.infer).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null; def: string }>()
    expectTypeOf(schema.input).toEqualTypeOf<{ foo?: string | undefined; bar: boolean | null; def?: string | undefined }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: OptionalType<StringType>
                bar: NullableType<BooleanType>
                def: DefaultType<OptionalType<StringType>>
            }>
        >
    >

    expectTypeOf(schema.default).toEqualTypeOf<
        (args: {
            bar: boolean | null
            def?: string
            foo?: string | undefined
        }) => DefaultType<
            ObjectType<{
                foo: OptionalType<StringType>
                bar: NullableType<BooleanType>
                def: DefaultType<OptionalType<StringType>>
            }>
        >
    >()

    expectTypeOf(schema._definition.default).toEqualTypeOf<
        | {
              bar: boolean | null
              def: string
              foo?: string | undefined
          }
        | undefined
    >()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<
        { foo?: string | undefined; bar: boolean | null; def: string }[] | undefined
    >()
})

it('types - partials', () => {
    const schema = $object({ foo: $string, bar: $boolean }).partial()
    expectTypeOf(schema.infer).toEqualTypeOf<{ foo?: string | undefined; bar?: boolean | undefined }>()
    expectTypeOf(schema.input).toEqualTypeOf<{ foo?: string | undefined; bar?: boolean | undefined }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: OptionalType<StringType>
                bar: OptionalType<BooleanType>
            }>
        >
    >

    expectTypeOf(schema._definition.default).toEqualTypeOf<
        | {
              foo?: string | undefined
              bar?: boolean | undefined
          }
        | undefined
    >()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<
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
    expectTypeOf(schema.input).toEqualTypeOf<{ foo?: string | undefined; bar: boolean }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: OptionalType<StringType>
                bar: BooleanType
            }>
        >
    >

    expectTypeOf(schema._definition.default).toEqualTypeOf<
        | {
              foo?: string | undefined
              bar: boolean
          }
        | undefined
    >()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<
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
    expectTypeOf(schema.input).toEqualTypeOf<{ foo: string; bar: boolean }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: StringType
                bar: BooleanType
            }>
        >
    >

    expectTypeOf(schema._definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
          }
        | undefined
    >()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<
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
    expectTypeOf(schema.input).toEqualTypeOf<{ foo: string; bar: boolean }>()
    type _test_intrinsic = Expect<
        Equal<
            Intrinsic<typeof schema>,
            ObjectType<{
                foo: StringType
                bar: BooleanType
            }>
        >
    >

    expectTypeOf(schema._definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
          }
        | undefined
    >()
    expectTypeOf(schema._definition.jsonschema?.examples).toEqualTypeOf<
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
    expectTypeOf(other.input).toEqualTypeOf<{ foo: string; bar: boolean; baz: string }>()
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

    expectTypeOf(other._definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
              baz: string
          }
        | undefined
    >()
    expectTypeOf(other._definition.jsonschema?.examples).toEqualTypeOf<
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
    expectTypeOf(other.input).toEqualTypeOf<{ foo: string; bar: boolean; baz: string }>()
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

    expectTypeOf(other._definition.default).toEqualTypeOf<
        | {
              foo: string
              bar: boolean
              baz: string
          }
        | undefined
    >()
    expectTypeOf(other._definition.jsonschema?.examples).toEqualTypeOf<
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
            "_type": "string",
          },
        },
      }
    `)
    expect($object({ foo: $object({}) })).toMatchInlineSnapshot(`
      ObjectType {
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
            "_children": [],
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "3",
            "_isCommutative": false,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "shape": {},
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "4",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "shape": {
          "foo": ObjectType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_children": [],
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "3",
            "_isCommutative": false,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "shape": {},
          },
        },
      }
    `)
})

it('example', () => {
    expect($object({}, { jsonschema: { examples: [{ foo: 'bar' }] } })).toMatchInlineSnapshot(`
      ObjectType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [],
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
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "shape": {},
      }
    `)

    // @ts-expect-error - invalid example
    $object({ foo: $string }).jsonschema({ examples: ['foo'] })
})

it('default', () => {
    expect($object({}, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
      ObjectType {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [],
        "_definition": {
          "default": {
            "foo": "bar",
          },
        },
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "shape": {},
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
              "description": "The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.",
            },
            "_guessedTrace": undefined,
            "_id": "1",
            "_isCommutative": false,
            "_options": {
              "minItems": 1,
            },
            "_origin": {},
            "_type": "array",
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
              "_id": "2",
              "_isCommutative": true,
              "_options": {},
              "_origin": {},
              "_type": "string",
            },
          },
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {
              "description": "The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.",
            },
            "_guessedTrace": undefined,
            "_id": "3",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "string",
          },
          BooleanType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {
              "default": false,
              "description": "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
            },
            "_guessedTrace": undefined,
            "_id": "4",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "boolean",
          },
        ],
        "_definition": {
          "description": "Declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.",
        },
        "_guessedTrace": undefined,
        "_id": "5",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "shape": {
          "booleans": BooleanType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {
              "default": false,
              "description": "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
            },
            "_guessedTrace": undefined,
            "_id": "4",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "boolean",
          },
          "ids": NodeTrait {
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
              "description": "The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.",
            },
            "_guessedTrace": undefined,
            "_id": "1",
            "_isCommutative": false,
            "_options": {
              "minItems": 1,
            },
            "_origin": {},
            "_type": "array",
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
              "_id": "2",
              "_isCommutative": true,
              "_options": {},
              "_origin": {},
              "_type": "string",
            },
          },
          "matches": StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {
              "description": "The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.",
            },
            "_guessedTrace": undefined,
            "_id": "3",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "string",
          },
        },
      }
    `)
})
