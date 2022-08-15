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
            Object {
              "title": "foo title",
            }
        `)
    })

    test('description', () => {
        expect(annotate({ description: 'foo description' })).toMatchInlineSnapshot(`
            Object {
              "description": "foo description",
            }
        `)
    })

    test('default', () => {
        expect(annotate({ default: 'default string' })).toMatchInlineSnapshot(`
            Object {
              "default": "default string",
            }
        `)
        expect(annotate({ default: { foo: 'default string' } })).toMatchInlineSnapshot(`
            Object {
              "default": Object {
                "foo": "default string",
              },
            }
        `)
    })

    test('readonly', () => {
        expect(annotate({ readonly: true })).toMatchInlineSnapshot(`
            Object {
              "readonly": true,
            }
        `)
        expect(annotate({ readonly: false })).toMatchInlineSnapshot(`
            Object {
              "readonly": false,
            }
        `)
    })

    test('examples', () => {
        expect(annotate({ examples: ['foo', 'bar'] })).toMatchInlineSnapshot(`
            Object {
              "examples": Array [
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
            Object {
              "type": "string",
            }
        `)
    })

    test('number', () => {
        expect(walkCst($number(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "type": "number",
            }
        `)
    })

    test('integer', () => {
        expect(walkCst($integer(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "type": "integer",
            }
        `)
    })

    test('boolean', () => {
        expect(walkCst($boolean(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "type": "boolean",
            }
        `)
    })

    test('null', () => {
        expect(walkCst($null(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "type": "null",
            }
        `)
    })

    test('unknown', () => {
        expect(walkCst($unknown(), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`Object {}`)
    })

    test('enum', () => {
        expect(walkCst($enum(['foo', 'bar', { foo: 'bar' }]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "enum": Array [
                "foo",
                "bar",
                Object {
                  "foo": "bar",
                },
              ],
            }
        `)
        expect(walkCst($enum({ foo: 'bar', bar: 1, baz: true }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "enum": Array [
                "bar",
                1,
                true,
              ],
            }
        `)
        expect(walkCst($enum({ foo: 'bar', bar: [1, 2, 3] }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "enum": Array [
                "bar",
                Array [
                  1,
                  2,
                  3,
                ],
              ],
            }
        `)
        expect(walkCst($enum(['foobar']), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "const": "foobar",
            }
        `)
    })

    test('array', () => {
        expect(walkCst($array($string), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "items": Object {
                "type": "string",
              },
              "type": "array",
            }
        `)
        expect(walkCst($array($enum(['foo', 'bar', { foo: 'bar' }])), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
            Object {
              "items": Object {
                "enum": Array [
                  "foo",
                  "bar",
                  Object {
                    "foo": "bar",
                  },
                ],
              },
              "type": "array",
            }
        `)
        expect(walkCst($array($union([$string, $integer])), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "items": Object {
                "oneOf": Array [
                  Object {
                    "type": "string",
                  },
                  Object {
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
            Object {
              "additionalItems": false,
              "items": Array [
                Object {
                  "type": "string",
                },
                Object {
                  "type": "string",
                },
                Object {
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
            Object {
              "additionalItems": false,
              "items": Array [
                Object {
                  "type": "string",
                },
                Object {
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
            Object {
              "additionalItems": false,
              "items": Array [
                Object {
                  "type": "number",
                },
                Object {
                  "type": "number",
                },
                Object {
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
            Object {
              "additionalProperties": Object {
                "type": "string",
              },
              "type": "object",
            }
        `)
    })

    test('ref', () => {
        const foo = $dict($string)
        expect(walkCst($ref(foo), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
            }
        `)
        // test the stable uuid referencing
        expect(walkCst($union([$ref(foo), $dict($ref(foo))]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "oneOf": Array [
                Object {
                  "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                },
                Object {
                  "additionalProperties": Object {
                    "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                  },
                  "type": "object",
                },
              ],
            }
        `)
        expect(walkCst($union([$ref(foo), $dict($nullable($ref(foo)))]), jsonSchemaVisitor, jsonSchemaContext()))
            .toMatchInlineSnapshot(`
            Object {
              "oneOf": Array [
                Object {
                  "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                },
                Object {
                  "additionalProperties": Object {
                    "oneOf": Array [
                      Object {
                        "type": "null",
                      },
                      Object {
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
            Object {
              "oneOf": Array [
                Object {
                  "type": "string",
                },
              ],
            }
        `)
        expect(walkCst($union([$string, $string, $integer]), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "oneOf": Array [
                Object {
                  "type": "string",
                },
                Object {
                  "type": "string",
                },
                Object {
                  "type": "integer",
                },
              ],
            }
        `)
    })

    test('object', () => {
        expect(walkCst($object({ foo: $string }), jsonSchemaVisitor, jsonSchemaContext())).toMatchInlineSnapshot(`
            Object {
              "additionalProperties": false,
              "properties": Object {
                "foo": Object {
                  "type": "string",
                },
              },
              "required": Array [
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
            Object {
              "additionalProperties": false,
              "properties": Object {
                "bar": Object {
                  "type": Array [
                    "integer",
                    "null",
                  ],
                },
                "baz": Object {
                  "type": "integer",
                },
                "foo": Object {
                  "type": "string",
                },
              },
              "required": Array [
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
            Object {
              "additionalProperties": false,
              "properties": Object {
                "bar": Object {
                  "description": "fooscription",
                  "type": "string",
                },
                "foo": Object {
                  "type": "string",
                },
              },
              "required": Array [
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
            Object {
              "additionalProperties": false,
              "default": Object {
                "bar": "foo",
                "foo": "bar",
              },
              "properties": Object {
                "bar": Object {
                  "description": "fooscription",
                  "type": "string",
                },
                "foo": Object {
                  "type": "string",
                },
              },
              "required": Array [
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
            Object {
              "compiled": false,
              "schema": Object {
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
            Object {
              "compiled": false,
              "schema": Object {
                "$schema": "http://json-schema.org/draft-07/schema#",
                "additionalProperties": false,
                "default": Object {
                  "bar": "foo",
                  "foo": "bar",
                },
                "properties": Object {
                  "bar": Object {
                    "description": "fooscription",
                    "type": "string",
                  },
                  "foo": Object {
                    "type": "string",
                  },
                },
                "required": Array [
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
            Object {
              "compiled": false,
              "schema": Object {
                "$defs": Object {
                  "{{0002-000:uniqueSymbolName}}": Object {
                    "additionalProperties": Object {
                      "type": "string",
                    },
                    "type": "object",
                  },
                },
                "$schema": "http://json-schema.org/draft-07/schema#",
                "oneOf": Array [
                  Object {
                    "$ref": "#/$defs/{{0002-000:uniqueSymbolName}}",
                  },
                  Object {
                    "additionalProperties": Object {
                      "oneOf": Array [
                        Object {
                          "type": "null",
                        },
                        Object {
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
