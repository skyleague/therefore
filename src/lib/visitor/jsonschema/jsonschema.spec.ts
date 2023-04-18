import { annotate, jsonSchemaContext, jsonSchemaVisitor, toJsonSchema, toType } from './jsonschema.js'

import { walkTherefore } from '../../cst/visitor.js'
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
} from '../../primitives/index.js'

import { expect, describe, it } from 'vitest'

describe('toType', () => {
    it('nullable', () => {
        expect(toType('string', { nullable: true })).toEqual(['string', 'null'])
    })

    it('first argument (json schema type) is leading', () => {
        expect(toType('string', { nullable: true })).toEqual(['string', 'null'])
    })

    it('not nullable', () => {
        expect(toType('string', { nullable: false })).toEqual('string')
    })

    it('default', () => {
        expect(toType('string', {})).toEqual('string')
    })
})

describe('annotate', () => {
    it('title', () => {
        expect(annotate(undefined, { title: 'foo title' })).toMatchInlineSnapshot(`
            {
              "title": "foo title",
            }
        `)
    })

    it('description', () => {
        expect(annotate(undefined, { description: 'foo description' })).toMatchInlineSnapshot(`
            {
              "description": "foo description",
            }
        `)
    })

    it('default', () => {
        expect(annotate(undefined, { default: 'default string' })).toMatchInlineSnapshot(`
            {
              "default": "default string",
            }
        `)
        expect(annotate(undefined, { default: { foo: 'default string' } })).toMatchInlineSnapshot(`
            {
              "default": {
                "foo": "default string",
              },
            }
        `)
    })

    it('readonly', () => {
        expect(annotate(undefined, { readonly: true })).toMatchInlineSnapshot(`
            {
              "readonly": true,
            }
        `)
        expect(annotate(undefined, { readonly: false })).toMatchInlineSnapshot(`
            {
              "readonly": false,
            }
        `)
    })

    it('examples', () => {
        expect(annotate(undefined, { examples: ['foo', 'bar'] })).toMatchInlineSnapshot(`
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
    it('string', () => {
        expect(walkTherefore($string(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "string",
            }
        `)
    })

    it('number', () => {
        expect(walkTherefore($number(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "number",
            }
        `)
    })

    it('integer', () => {
        expect(walkTherefore($integer(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "integer",
            }
        `)
    })

    it('boolean', () => {
        expect(walkTherefore($boolean(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "boolean",
            }
        `)
    })

    it('null', () => {
        expect(walkTherefore($null(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "type": "null",
            }
        `)
    })

    it('unknown', () => {
        expect(walkTherefore($unknown(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`{}`)
    })

    it('enum', () => {
        expect(walkTherefore($enum(['foo', 'bar', { foo: 'bar' }]), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
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
        expect(walkTherefore($enum({ foo: 'bar', bar: 1, baz: true }), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
            {
              "enum": [
                "bar",
                1,
                true,
              ],
            }
        `)
        expect(walkTherefore($enum({ foo: 'bar', bar: [1, 2, 3] }), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
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
        expect(walkTherefore($enum(['foobar']), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "const": "foobar",
            }
        `)
    })

    it('array', () => {
        expect(walkTherefore($array($string), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "items": {
                "type": "string",
              },
              "type": "array",
            }
        `)
        expect(walkTherefore($array($enum(['foo', 'bar', { foo: 'bar' }])), jsonSchemaVisitor, jsonSchemaContext()))
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
        expect(walkTherefore($array($union([$string, $integer])), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
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

    it('tuple', () => {
        expect(walkTherefore($tuple([$string, $string, $integer]), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
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

    it('named tuple', () => {
        expect(
            walkTherefore(
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
            walkTherefore(
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

    it('dict', () => {
        expect(walkTherefore($dict($string), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "additionalProperties": {
                "type": "string",
              },
              "type": "object",
            }
        `)
    })

    it('ref', () => {
        const foo = $dict($string)
        expect(walkTherefore($ref(foo), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
            }
        `)
        // test the stable uuid referencing
        expect(walkTherefore($union([$ref(foo), $dict($ref(foo))]), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
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
        expect(walkTherefore($union([$ref(foo), $dict($nullable($ref(foo)))]), jsonSchemaVisitor, jsonSchemaContext()))
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

    it('union', () => {
        expect(walkTherefore($union([$string]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "anyOf": [
                {
                  "type": "string",
                },
              ],
            }
        `)
        expect(walkTherefore($union([$string, $string, $integer]), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
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

    it('object', () => {
        expect(walkTherefore($object({ foo: $string }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
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
            walkTherefore(
                $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "properties": {
                "bar": {
                  "nullable": true,
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
            walkTherefore(
                $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
                jsonSchemaVisitor,
                jsonSchemaContext()
            )
        ).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
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
            walkTherefore(
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
              "additionalProperties": true,
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
    it('simple', async () => {
        expect(await toJsonSchema($string())).toMatchInlineSnapshot(`
            {
              "compiled": false,
              "schema": {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "title": "{{0001-000:uniqueSymbolName}}",
                "type": "string",
              },
            }
        `)
    })

    it('object', async () => {
        expect(
            await toJsonSchema(
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
                "additionalProperties": true,
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
                "title": "{{0003-000:uniqueSymbolName}}",
                "type": "object",
              },
            }
        `)
    })

    it('ref', async () => {
        const foo = $dict($string)
        expect(await toJsonSchema($union([$ref(foo), $dict($nullable($ref(foo)))]))).toMatchInlineSnapshot(`
          {
            "compiled": false,
            "schema": {
              "$defs": {
                "{{0002-000:uniqueSymbolName}}": {
                  "additionalProperties": {
                    "type": "string",
                  },
                  "title": "{{0002-000:uniqueSymbolName}}",
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
              "title": "{{0007-000:uniqueSymbolName}}",
            },
          }
        `)
    })
})
