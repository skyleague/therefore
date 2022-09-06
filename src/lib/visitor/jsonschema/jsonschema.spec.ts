import { annotate, jsonSchemaContext, jsonSchemaVisitor, toJsonSchema, toType } from './jsonschema'

import { walkCst } from '../../cst/visitor'
import {
    $array,
    $boolean,
    $dict,
    $enum,
    $integer,
    $null,
    $nullable,
    $number,
    $object,
    $optional,
    $ref,
    $string,
    $tuple,
    $union,
    $unknown,
} from '../../primitives'

describe('toType', () => {
    test('nullable', () => {
        expect(toType('string', { nullable: true })).toEqual(['string', 'null'])
    })

    test('first argument (json schema type) is leading', () => {
        expect(toType('string', { nullable: true })).toEqual(['string', 'null'])
    })

    test('not nullable', () => {
        expect(toType('string', { nullable: false })).toEqual('string')
    })

    test('default', () => {
        expect(toType('string', {})).toEqual('string')
    })
})

describe('annotate', () => {
    test('title', () => {
        expect(annotate({ title: 'foo title' })).toMatchInlineSnapshot(`
            {
              "title": "foo title",
            }
        `)
    })

    test('description', () => {
        expect(annotate({ description: 'foo description' })).toMatchInlineSnapshot(`
            {
              "description": "foo description",
            }
        `)
    })

    test('default', () => {
        expect(annotate({ default: 'default string' })).toMatchInlineSnapshot(`
            {
              "default": "default string",
            }
        `)
        expect(annotate({ default: { foo: 'default string' } })).toMatchInlineSnapshot(`
            {
              "default": {
                "foo": "default string",
              },
            }
        `)
    })

    test('readonly', () => {
        expect(annotate({ readonly: true })).toMatchInlineSnapshot(`
            {
              "readonly": true,
            }
        `)
        expect(annotate({ readonly: false })).toMatchInlineSnapshot(`
            {
              "readonly": false,
            }
        `)
    })

    test('examples', () => {
        expect(annotate({ examples: ['foo', 'bar'] })).toMatchInlineSnapshot(`
            {
              "examples": [
                "foo",
                "bar",
              ],
            }
        `)
    })
})

describe('toTypeDefinition', () => {
    test('string', () => {
        expect(walkCst($string(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "string",
            }
        `)
    })

    test('number', () => {
        expect(walkCst($number(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "number",
            }
        `)
    })

    test('integer', () => {
        expect(walkCst($integer(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "integer",
            }
        `)
    })

    test('boolean', () => {
        expect(walkCst($boolean(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "boolean",
            }
        `)
    })

    test('null', () => {
        expect(walkCst($null(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "null",
            }
        `)
    })

    test('unknown', () => {
        expect(walkCst($unknown(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`{}`)
    })

    test('enum', () => {
        expect(walkCst($enum(['foo', 'bar', { foo: 'bar' }]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "enum": [
                "foo",
                "bar",
                {
                  "foo": "bar",
                },
              ],
            }
        `)
        expect(walkCst($enum({ foo: 'bar', bar: 1, baz: true }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "enum": [
                "bar",
                1,
                true,
              ],
            }
        `)
        expect(walkCst($enum({ foo: 'bar', bar: [1, 2, 3] }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "enum": [
                "bar",
                [
                  1,
                  2,
                  3,
                ],
              ],
            }
        `)
        expect(walkCst($enum(['foobar']), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "const": "foobar",
            }
        `)
    })

    test('array', () => {
        expect(walkCst($array($string), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "items": {
                "type": "string",
              },
              "type": "array",
            }
        `)
        expect(walkCst($array($enum(['foo', 'bar', { foo: 'bar' }])), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
            {
              "items": {
                "enum": [
                  "foo",
                  "bar",
                  {
                    "foo": "bar",
                  },
                ],
              },
              "type": "array",
            }
        `)
        expect(walkCst($array($union([$string, $integer])), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "items": {
                "anyOf": [
                  {
                    "type": "string",
                  },
                  {
                    "type": "integer",
                  },
                ],
              },
              "type": "array",
            }
        `)
    })

    test('tuple', () => {
        expect(walkCst($tuple([$string, $string, $integer]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "additionalItems": false,
              "items": [
                {
                  "type": "string",
                },
                {
                  "type": "string",
                },
                {
                  "type": "integer",
                },
              ],
              "minItems": 3,
              "type": "array",
            }
        `)
    })

    test('named tuple', () => {
        expect(
            walkCst(
                $tuple({
                    foo: $string,
                    boo: $integer,
                }),

                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalItems": false,
              "items": [
                {
                  "type": "string",
                },
                {
                  "type": "integer",
                },
              ],
              "minItems": 2,
              "type": "array",
            }
        `)
        expect(
            walkCst(
                $tuple({
                    x: $number,
                    y: $number,
                    z: $number,
                }),

                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalItems": false,
              "items": [
                {
                  "type": "number",
                },
                {
                  "type": "number",
                },
                {
                  "type": "number",
                },
              ],
              "minItems": 3,
              "type": "array",
            }
        `)
    })

    test('dict', () => {
        expect(walkCst($dict($string), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "additionalProperties": {
                "type": "string",
              },
              "type": "object",
            }
        `)
    })

    test('ref', () => {
        const foo = $dict($string)
        expect(walkCst($ref(foo), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
            }
        `)
        // test the stable uuid referencing
        expect(walkCst($union([$ref(foo), $dict($ref(foo))]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "anyOf": [
                {
                  "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                },
                {
                  "additionalProperties": {
                    "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                  },
                  "type": "object",
                },
              ],
            }
        `)
        expect(walkCst($union([$ref(foo), $dict($nullable($ref(foo)))]), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
            {
              "anyOf": [
                {
                  "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                },
                {
                  "additionalProperties": {
                    "oneOf": [
                      {
                        "type": "null",
                      },
                      {
                        "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                      },
                    ],
                  },
                  "type": "object",
                },
              ],
            }
        `)
    })

    test('union', () => {
        expect(walkCst($union([$string]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "anyOf": [
                {
                  "type": "string",
                },
              ],
            }
        `)
        expect(walkCst($union([$string, $string, $integer]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "anyOf": [
                {
                  "type": "string",
                },
                {
                  "type": "string",
                },
                {
                  "type": "integer",
                },
              ],
            }
        `)
    })

    test('object', () => {
        expect(walkCst($object({ foo: $string }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
              "properties": {
                "foo": {
                  "type": "string",
                },
              },
              "required": [
                "foo",
              ],
              "type": "object",
            }
        `)
        expect(
            walkCst(
                $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
              "properties": {
                "bar": {
                  "type": [
                    "integer",
                    "null",
                  ],
                },
                "baz": {
                  "type": "integer",
                },
                "foo": {
                  "type": "string",
                },
              },
              "required": [
                "foo",
                "bar",
              ],
              "type": "object",
            }
        `)
        expect(
            walkCst(
                $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
              "properties": {
                "bar": {
                  "description": "fooscription",
                  "type": "string",
                },
                "foo": {
                  "type": "string",
                },
              },
              "required": [
                "foo",
                "bar",
              ],
              "type": "object",
            }
        `)
        expect(
            walkCst(
                $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },

                    { default: { foo: 'bar', bar: 'foo' } }
                ),

                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
              "default": {
                "bar": "foo",
                "foo": "bar",
              },
              "properties": {
                "bar": {
                  "description": "fooscription",
                  "type": "string",
                },
                "foo": {
                  "type": "string",
                },
              },
              "required": [
                "foo",
                "bar",
              ],
              "type": "object",
            }
        `)
    })
})

describe('toJsonSchema', () => {
    test('simple', () => {
        expect(toJsonSchema($string())).toMatchInlineSnapshot(`
            {
              "compiled": false,
              "schema": {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "type": "string",
              },
            }
        `)
    })

    test('object', () => {
        expect(
            toJsonSchema(
                $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },

                    { default: { foo: 'bar', bar: 'foo' } }
                )
            )
        ).toMatchInlineSnapshot(`
            {
              "compiled": false,
              "schema": {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "additionalProperties": false,
                "default": {
                  "bar": "foo",
                  "foo": "bar",
                },
                "properties": {
                  "bar": {
                    "description": "fooscription",
                    "type": "string",
                  },
                  "foo": {
                    "type": "string",
                  },
                },
                "required": [
                  "foo",
                  "bar",
                ],
                "type": "object",
              },
            }
        `)
    })

    test('ref', () => {
        const foo = $dict($string)
        expect(toJsonSchema($union([$ref(foo), $dict($nullable($ref(foo)))]))).toMatchInlineSnapshot(`
            {
              "compiled": false,
              "schema": {
                "$defs": {
                  "{{0002-000:uniqueSymbolName}}": {
                    "additionalProperties": {
                      "type": "string",
                    },
                    "type": "object",
                  },
                },
                "$schema": "http://json-schema.org/draft-07/schema#",
                "anyOf": [
                  {
                    "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                  },
                  {
                    "additionalProperties": {
                      "oneOf": [
                        {
                          "type": "null",
                        },
                        {
                          "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                        },
                      ],
                    },
                    "type": "object",
                  },
                ],
              },
            }
        `)
    })
})
