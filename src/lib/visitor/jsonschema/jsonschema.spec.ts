import { buildContext, toJsonSchema } from './jsonschema.js'

import { $array } from '../../primitives/array/array.js'
import { $boolean } from '../../primitives/boolean/boolean.js'
import { $const } from '../../primitives/const/const.js'
import { $enum } from '../../primitives/enum/enum.js'
import { $integer } from '../../primitives/integer/integer.js'
import { $null } from '../../primitives/null/null.js'
import { $nullable } from '../../primitives/nullable/nullable.js'
import { $number } from '../../primitives/number/number.js'
import { $object } from '../../primitives/object/object.js'
import { $record } from '../../primitives/record/record.js'
import { $ref } from '../../primitives/ref/ref.js'
import { $string } from '../../primitives/string/string.js'
import { $tuple } from '../../primitives/tuple/tuple.js'
import { $union } from '../../primitives/union/union.js'
import { $unknown } from '../../primitives/unknown/unknown.js'

import { pick } from '@skyleague/axioms'
import { describe, expect, it } from 'vitest'

describe('toTypeDefinition', () => {
    it('string', () => {
        const ctx = buildContext()
        expect(ctx.render($string())).toEqual({
            type: 'string',
        })
        expect(ctx.render($string().nullable())).toEqual({
            type: ['string', 'null'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
        {
          "definitions": {},
        }
      `)
    })

    it('string - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($string())).toEqual({
            type: 'string',
        })
        expect(ctx.render($string().nullable())).toEqual({
            type: 'string',
            nullable: true,
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
        {
          "definitions": {},
        }
      `)
    })

    it('number', () => {
        const ctx = buildContext()
        expect(ctx.render($number())).toEqual({
            type: 'number',
        })
        expect(ctx.render($number().nullable())).toEqual({
            type: ['number', 'null'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('number - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($number())).toEqual({
            type: 'number',
        })
        expect(ctx.render($number().nullable())).toEqual({
            type: 'number',
            nullable: true,
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('integer', () => {
        const ctx = buildContext()
        expect(ctx.render($integer())).toEqual({
            type: 'integer',
        })
        expect(ctx.render($integer().nullable())).toEqual({
            type: ['integer', 'null'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('integer - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($integer())).toEqual({
            type: 'integer',
        })
        expect(ctx.render($integer().nullable())).toEqual({
            type: 'integer',
            nullable: true,
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('boolean', () => {
        const ctx = buildContext()
        expect(ctx.render($boolean())).toEqual({
            type: 'boolean',
        })
        expect(ctx.render($boolean().nullable())).toEqual({
            type: ['boolean', 'null'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('boolean - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($boolean())).toEqual({
            type: 'boolean',
        })
        expect(ctx.render($boolean().nullable())).toEqual({
            type: 'boolean',
            nullable: true,
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('null', () => {
        const ctx = buildContext()
        expect(ctx.render($null())).toEqual({
            type: 'null',
        })
        expect(ctx.render($null().nullable())).toEqual({
            type: 'null',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('null - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($null())).toEqual({
            enum: [null],
            nullable: true,
            type: 'string',
        })
        expect(ctx.render($null().nullable())).toEqual({
            enum: [null],
            nullable: true,
            type: 'string',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('unknown', () => {
        const ctx = buildContext()
        expect(ctx.render($unknown())).toEqual({})
        expect(ctx.render($unknown().nullable())).toEqual({})
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('enum', () => {
        const ctx = buildContext()
        expect(ctx.render($enum(['foo', 'bar']))).toEqual({
            enum: ['foo', 'bar'],
        })
        expect(ctx.render($enum({ foo: 'bar', bar: '1' }))).toEqual({
            enum: ['bar', '1'],
        })
        expect(ctx.render($enum(['foo', 'bar']).nullable())).toEqual({
            enum: ['foo', 'bar', null],
        })
        expect(ctx.render($enum(['foobar']))).toEqual({
            const: 'foobar',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('enum - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($enum(['foo', 'bar']))).toEqual({
            enum: ['foo', 'bar'],
        })
        expect(ctx.render($enum({ foo: 'bar', bar: '1' }))).toEqual({
            enum: ['bar', '1'],
        })
        expect(ctx.render($enum(['foo', 'bar']).nullable())).toEqual({
            enum: ['foo', 'bar', null],
            nullable: true,
            type: 'string',
        })
        expect(ctx.render($enum(['foobar']))).toEqual({
            enum: ['foobar'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('const', () => {
        const ctx = buildContext()
        expect(ctx.render($const('foobar'))).toEqual({
            const: 'foobar',
        })
        expect(ctx.render($const('foobar').nullable())).toEqual({
            enum: ['foobar', null],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('const - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($const('foobar'))).toEqual({
            enum: ['foobar'],
        })
        expect(ctx.render($const('foobar').nullable())).toEqual({
            enum: ['foobar', null],
            nullable: true,
            type: 'string',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('array', () => {
        const ctx = buildContext()
        expect(ctx.render($array($string))).toEqual({
            items: {
                type: 'string',
            },
            type: 'array',
        })
        expect(ctx.render($array($string).nullable())).toEqual({
            items: {
                type: 'string',
            },
            type: ['array', 'null'],
        })
        expect(ctx.render($array($enum(['foo', 'bar'])))).toEqual({
            items: {
                enum: ['foo', 'bar'],
            },
            type: 'array',
        })
        expect(ctx.render($array($union([$string, $integer])))).toEqual({
            items: {
                anyOf: [
                    {
                        type: 'string',
                    },
                    {
                        type: 'integer',
                    },
                ],
            },
            type: 'array',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('array - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($array($string))).toEqual({
            items: {
                type: 'string',
            },
            type: 'array',
        })
        expect(ctx.render($array($string).nullable())).toEqual({
            items: {
                type: 'string',
            },
            type: 'array',
            nullable: true,
        })
        expect(ctx.render($array($enum(['foo', 'bar'])))).toEqual({
            items: {
                enum: ['foo', 'bar'],
            },
            type: 'array',
        })
        expect(ctx.render($array($union([$string, $integer])))).toEqual({
            items: {
                anyOf: [
                    {
                        type: 'string',
                    },
                    {
                        type: 'integer',
                    },
                ],
            },
            type: 'array',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
        {
          "definitions": {},
        }
      `)
    })

    it('tuple', () => {
        const ctx = buildContext()
        expect(ctx.render($tuple([$string, $string, $integer]))).toEqual({
            additionalItems: false,
            items: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                },
                {
                    type: 'integer',
                },
            ],
            minItems: 3,
            type: 'array',
        })
        expect(ctx.render($tuple([$string, $string, $integer]).nullable())).toEqual({
            additionalItems: false,
            items: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                },
                {
                    type: 'integer',
                },
            ],
            minItems: 3,
            type: ['array', 'null'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('tuple - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($tuple([$string, $string, $integer]))).toEqual({
            additionalItems: false,
            items: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                },
                {
                    type: 'integer',
                },
            ],
            minItems: 3,
            type: 'array',
        })
        expect(ctx.render($tuple([$string, $string, $integer]).nullable())).toEqual({
            additionalItems: false,
            items: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                },
                {
                    type: 'integer',
                },
            ],
            minItems: 3,
            type: 'array',
            nullable: true,
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('record', () => {
        const ctx = buildContext()
        expect(ctx.render($record($string))).toEqual({
            additionalProperties: {
                type: 'string',
            },
            type: 'object',
        })
        expect(ctx.render($record($string).nullable())).toEqual({
            additionalProperties: {
                type: 'string',
            },
            type: ['object', 'null'],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('record - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($record($string))).toEqual({
            additionalProperties: {
                type: 'string',
            },
            type: 'object',
        })
        expect(ctx.render($record($string).nullable())).toEqual({
            additionalProperties: {
                type: 'string',
            },
            type: 'object',
            nullable: true,
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('ref', () => {
        const ctx = buildContext()
        const foo = $record($string)
        expect(ctx.render($ref(foo))).toEqual({
            $ref: '#/$defs/{{2:symbolName}}',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {
              "{{2:symbolName}}": {
                "additionalProperties": {
                  "type": "string",
                },
                "type": "object",
              },
            },
          }
        `)
        // test the stable uuid referencing
        expect(ctx.render($union([$ref(foo), $record($ref(foo))]))).toEqual({
            anyOf: [
                {
                    $ref: '#/$defs/{{2:symbolName}}',
                },
                {
                    additionalProperties: {
                        $ref: '#/$defs/{{2:symbolName}}',
                    },
                    type: 'object',
                },
            ],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {
              "{{2:symbolName}}": {
                "additionalProperties": {
                  "type": "string",
                },
                "type": "object",
              },
            },
          }
        `)
        expect(ctx.render($union([$ref(foo), $record($ref(foo).nullable())]))).toEqual({
            anyOf: [
                {
                    $ref: '#/$defs/{{2:symbolName}}',
                },
                {
                    additionalProperties: {
                        anyOf: [
                            {
                                $ref: '#/$defs/{{2:symbolName}}',
                            },
                            {
                                type: 'null',
                            },
                        ],
                    },
                    type: 'object',
                },
            ],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {
              "{{2:symbolName}}": {
                "additionalProperties": {
                  "type": "string",
                },
                "type": "object",
              },
            },
          }
        `)
    })

    it('ref - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        const foo = $record($string)
        expect(ctx.render($ref(foo))).toEqual({
            $ref: '#/$defs/{{2:symbolName}}',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {
              "{{2:symbolName}}": {
                "additionalProperties": {
                  "type": "string",
                },
                "type": "object",
              },
            },
          }
        `)
        // test the stable uuid referencing
        expect(ctx.render($union([$ref(foo), $record($ref(foo))]))).toEqual({
            anyOf: [
                {
                    $ref: '#/$defs/{{2:symbolName}}',
                },
                {
                    additionalProperties: {
                        $ref: '#/$defs/{{2:symbolName}}',
                    },
                    type: 'object',
                },
            ],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {
              "{{2:symbolName}}": {
                "additionalProperties": {
                  "type": "string",
                },
                "type": "object",
              },
            },
          }
        `)
        expect(ctx.render($union([$ref(foo), $record($ref(foo).nullable())]))).toEqual({
            anyOf: [
                {
                    $ref: '#/$defs/{{2:symbolName}}',
                },
                {
                    additionalProperties: {
                        anyOf: [
                            {
                                $ref: '#/$defs/{{2:symbolName}}',
                            },
                        ],
                        nullable: true,
                    },
                    type: 'object',
                },
            ],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {
              "{{2:symbolName}}": {
                "additionalProperties": {
                  "type": "string",
                },
                "type": "object",
              },
            },
          }
        `)
    })

    it('union', () => {
        const ctx = buildContext()
        expect(ctx.render($union([$string]))).toEqual({
            anyOf: [
                {
                    type: 'string',
                },
            ],
        })
        expect(ctx.render($union([$string]).nullable())).toEqual({
            anyOf: [
                {
                    type: 'string',
                },
                {
                    type: 'null',
                },
            ],
        })
        expect(ctx.render($union([$string, $string, $integer]))).toEqual({
            anyOf: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                },
                {
                    type: 'integer',
                },
            ],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('union - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($union([$string]))).toEqual({
            anyOf: [
                {
                    type: 'string',
                },
            ],
        })
        expect(ctx.render($union([$string]).nullable())).toEqual({
            anyOf: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                    nullable: true,
                    enum: [null],
                },
            ],
        })
        expect(ctx.render($union([$string, $string, $integer]))).toEqual({
            anyOf: [
                {
                    type: 'string',
                },
                {
                    type: 'string',
                },
                {
                    type: 'integer',
                },
            ],
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('object', () => {
        const ctx = buildContext()
        expect(ctx.render($object({ foo: $string }))).toEqual({
            additionalProperties: true,
            properties: {
                foo: {
                    type: 'string',
                },
            },
            required: ['foo'],
            type: 'object',
        })
        expect(ctx.render($object({ foo: $string, bar: $integer().nullable(), baz: $integer().optional() }))).toEqual({
            additionalProperties: true,
            properties: {
                bar: {
                    type: ['integer', 'null'],
                },
                baz: {
                    type: 'integer',
                },
                foo: {
                    type: 'string',
                },
            },
            required: ['bar', 'foo'],
            type: 'object',
        })
        expect(ctx.render($object({ foo: $string, bar: $string().describe('fooscription') }))).toEqual({
            additionalProperties: true,
            properties: {
                bar: {
                    description: 'fooscription',
                    type: 'string',
                },
                foo: {
                    type: 'string',
                },
            },
            required: ['bar', 'foo'],
            type: 'object',
        })
        expect(
            ctx.render(
                $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },
                    { default: { foo: 'bar', bar: 'foo' } },
                ),
            ),
        ).toEqual({
            additionalProperties: true,
            default: {
                bar: 'foo',
                foo: 'bar',
            },
            properties: {
                bar: {
                    description: 'fooscription',
                    type: 'string',
                },
                foo: {
                    type: 'string',
                },
            },
            required: ['bar', 'foo'],
            type: 'object',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })

    it('object - openapi', () => {
        const ctx = buildContext(undefined, { target: 'openapi3' })
        expect(ctx.render($object({ foo: $string }))).toEqual({
            additionalProperties: true,
            properties: {
                foo: {
                    type: 'string',
                },
            },
            required: ['foo'],
            type: 'object',
        })
        expect(ctx.render($object({ foo: $string, bar: $integer().nullable(), baz: $integer().optional() }))).toEqual({
            additionalProperties: true,
            properties: {
                bar: {
                    nullable: true,
                    type: 'integer',
                },
                baz: {
                    type: 'integer',
                },
                foo: {
                    type: 'string',
                },
            },
            required: ['bar', 'foo'],
            type: 'object',
        })
        expect(ctx.render($object({ foo: $string, bar: $string().describe('fooscription') }))).toEqual({
            additionalProperties: true,
            properties: {
                bar: {
                    description: 'fooscription',
                    type: 'string',
                },
                foo: {
                    type: 'string',
                },
            },
            required: ['bar', 'foo'],
            type: 'object',
        })
        expect(
            ctx.render(
                $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },
                    { default: { foo: 'bar', bar: 'foo' } },
                ),
            ),
        ).toEqual({
            additionalProperties: true,
            default: {
                bar: 'foo',
                foo: 'bar',
            },
            properties: {
                bar: {
                    description: 'fooscription',
                    type: 'string',
                },
                foo: {
                    type: 'string',
                },
            },
            required: ['bar', 'foo'],
            type: 'object',
        })
        expect(pick(ctx, ['definitions'])).toMatchInlineSnapshot(`
          {
            "definitions": {},
          }
        `)
    })
})

describe('toJsonSchema', () => {
    it('simple', () => {
        expect(toJsonSchema($string())).toMatchInlineSnapshot(`
          {
            "code": ""use strict";
          /** @type {unknown} */
          export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"{{1:symbolName}}","type":"string"};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(typeof data !== "string"){validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;",
            "compiled": true,
            "formats": undefined,
            "references": References {
              "_data": {
                "1:symbolName": [Function],
              },
              "fallbackStrategy": [Function],
              "hardlinks": {},
              "key2node": Map {
                "1:symbolName" => StringType {
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
                  "_type": "string",
                },
              },
              "references": Map {
                "1" => Set {
                  "symbolName",
                },
              },
              "symbols": Map {
                "1" => StringType {
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
                  "_type": "string",
                },
              },
              "transform": {
                "1:symbolName": [Function],
              },
              "type": "generic",
            },
            "schema": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "title": "{{1:symbolName}}",
              "type": "string",
            },
            "validator": [Function],
          }
        `)
    })

    it('object', () => {
        expect(
            toJsonSchema(
                $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },

                    { default: { foo: 'bar', bar: 'foo' } },
                ),
            ),
        ).toMatchInlineSnapshot(`
          {
            "code": ""use strict";
          /** @type {unknown} */
          export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"{{2:symbolName}}","type":"object","default":{"foo":"bar","bar":"foo"},"properties":{"foo":{"type":"string"},"bar":{"type":"string","description":"fooscription"}},"required":["bar","foo"],"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((data.bar === undefined) && (missing0 = "bar")) || ((data.foo === undefined) && (missing0 = "foo"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.foo !== undefined){const _errs2 = errors;if(typeof data.foo !== "string"){validate10.errors = [{instancePath:instancePath+"/foo",schemaPath:"#/properties/foo/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.bar !== undefined){const _errs4 = errors;if(typeof data.bar !== "string"){validate10.errors = [{instancePath:instancePath+"/bar",schemaPath:"#/properties/bar/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;",
            "compiled": true,
            "formats": undefined,
            "references": References {
              "_data": {
                "2:symbolName": [Function],
              },
              "fallbackStrategy": [Function],
              "hardlinks": {},
              "key2node": Map {
                "2:symbolName" => ObjectType {
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
                      "_id": "3",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
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
                        "description": "fooscription",
                      },
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  ],
                  "_definition": {
                    "default": {
                      "bar": "foo",
                      "foo": "bar",
                    },
                  },
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
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
                      "_definition": {
                        "description": "fooscription",
                      },
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
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
                      "_id": "3",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  },
                },
              },
              "references": Map {
                "2" => Set {
                  "symbolName",
                },
              },
              "symbols": Map {
                "2" => ObjectType {
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
                      "_id": "3",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
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
                        "description": "fooscription",
                      },
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  ],
                  "_definition": {
                    "default": {
                      "bar": "foo",
                      "foo": "bar",
                    },
                  },
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
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
                      "_definition": {
                        "description": "fooscription",
                      },
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
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
                      "_id": "3",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  },
                },
              },
              "transform": {
                "2:symbolName": [Function],
              },
              "type": "generic",
            },
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
                "bar",
                "foo",
              ],
              "title": "{{2:symbolName}}",
              "type": "object",
            },
            "validator": [Function],
          }
        `)
    })

    it('ref', () => {
        const foo = $record($string)
        expect(toJsonSchema($union([$ref(foo), $record($nullable($ref(foo)))]))).toMatchInlineSnapshot(`
          {
            "code": ""use strict";
          /** @type {unknown} */
          export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"{{7:symbolName}}","anyOf":[{"$ref":"#/$defs/{{2:symbolName}}"},{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#/$defs/{{2:symbolName}}"},{"type":"null"}]}}],"$defs":{"{{2:symbolName}}":{"type":"object","additionalProperties":{"type":"string"}}}};const schema12 = {"type":"object","additionalProperties":{"type":"string"}};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;const _errs0 = errors;let valid0 = false;const _errs1 = errors;const _errs2 = errors;if(errors === _errs2){if(data && typeof data == "object" && !Array.isArray(data)){for(const key0 in data){const _errs5 = errors;if(typeof data[key0] !== "string"){const err0 = {instancePath:instancePath+"/" + key0.replace(/~/g, "~0").replace(/\\//g, "~1"),schemaPath:"#/$defs/{{2:symbolName}}/additionalProperties/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}var valid2 = _errs5 === errors;if(!valid2){break;}}}else {const err1 = {instancePath,schemaPath:"#/$defs/{{2:symbolName}}/type",keyword:"type",params:{type: "object"},message:"must be object"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}}var _valid0 = _errs1 === errors;valid0 = valid0 || _valid0;if(!valid0){const _errs7 = errors;if(errors === _errs7){if(data && typeof data == "object" && !Array.isArray(data)){for(const key1 in data){let data1 = data[key1];const _errs10 = errors;const _errs11 = errors;let valid4 = false;const _errs12 = errors;const _errs13 = errors;if(errors === _errs13){if(data1 && typeof data1 == "object" && !Array.isArray(data1)){for(const key2 in data1){const _errs16 = errors;if(typeof data1[key2] !== "string"){const err2 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\\//g, "~1")+"/" + key2.replace(/~/g, "~0").replace(/\\//g, "~1"),schemaPath:"#/$defs/{{2:symbolName}}/additionalProperties/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err2];}else {vErrors.push(err2);}errors++;}var valid6 = _errs16 === errors;if(!valid6){break;}}}else {const err3 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\\//g, "~1"),schemaPath:"#/$defs/{{2:symbolName}}/type",keyword:"type",params:{type: "object"},message:"must be object"};if(vErrors === null){vErrors = [err3];}else {vErrors.push(err3);}errors++;}}var _valid1 = _errs12 === errors;valid4 = valid4 || _valid1;if(!valid4){const _errs18 = errors;if(data1 !== null){const err4 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\\//g, "~1"),schemaPath:"#/anyOf/1/additionalProperties/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};if(vErrors === null){vErrors = [err4];}else {vErrors.push(err4);}errors++;}var _valid1 = _errs18 === errors;valid4 = valid4 || _valid1;}if(!valid4){const err5 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\\//g, "~1"),schemaPath:"#/anyOf/1/additionalProperties/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors === null){vErrors = [err5];}else {vErrors.push(err5);}errors++;}else {errors = _errs11;if(vErrors !== null){if(_errs11){vErrors.length = _errs11;}else {vErrors = null;}}}var valid3 = _errs10 === errors;if(!valid3){break;}}}else {const err6 = {instancePath,schemaPath:"#/anyOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};if(vErrors === null){vErrors = [err6];}else {vErrors.push(err6);}errors++;}}var _valid0 = _errs7 === errors;valid0 = valid0 || _valid0;}if(!valid0){const err7 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors === null){vErrors = [err7];}else {vErrors.push(err7);}errors++;validate10.errors = vErrors;return false;}else {errors = _errs0;if(vErrors !== null){if(_errs0){vErrors.length = _errs0;}else {vErrors = null;}}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;",
            "compiled": true,
            "formats": undefined,
            "references": References {
              "_data": {
                "2:symbolName": [Function],
                "7:symbolName": [Function],
              },
              "fallbackStrategy": [Function],
              "hardlinks": {},
              "key2node": Map {
                "7:symbolName" => UnionType {
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
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_guessedTrace": undefined,
                          "_id": "2",
                          "_isCommutative": false,
                          "_options": {},
                          "_origin": {},
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
                      "_id": "3",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "ref",
                    },
                    RecordType {
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
                                      "_type": "string",
                                    },
                                  ],
                                  "_definition": {},
                                  "_guessedTrace": undefined,
                                  "_id": "2",
                                  "_isCommutative": false,
                                  "_options": {},
                                  "_origin": {},
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
                              "_id": "4",
                              "_isCommutative": true,
                              "_options": {},
                              "_origin": {},
                              "_type": "ref",
                            },
                          ],
                          "_definition": {},
                          "_guessedTrace": undefined,
                          "_id": "5",
                          "_isCommutative": true,
                          "_origin": {},
                          "_type": "nullable",
                        },
                      ],
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "6",
                      "_isCommutative": false,
                      "_options": {},
                      "_origin": {},
                      "_type": "object",
                      "element": NodeTrait {
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
                                    "_type": "string",
                                  },
                                ],
                                "_definition": {},
                                "_guessedTrace": undefined,
                                "_id": "2",
                                "_isCommutative": false,
                                "_options": {},
                                "_origin": {},
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
                            "_id": "4",
                            "_isCommutative": true,
                            "_options": {},
                            "_origin": {},
                            "_type": "ref",
                          },
                        ],
                        "_definition": {},
                        "_guessedTrace": undefined,
                        "_id": "5",
                        "_isCommutative": true,
                        "_origin": {},
                        "_type": "nullable",
                      },
                      "shape": {},
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "7",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_type": "union",
                },
                "2:symbolName" => RecordType {
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
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
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
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "references": Map {
                "7" => Set {
                  "symbolName",
                },
                "2" => Set {
                  "symbolName",
                },
              },
              "symbols": Map {
                "7" => UnionType {
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
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_guessedTrace": undefined,
                          "_id": "2",
                          "_isCommutative": false,
                          "_options": {},
                          "_origin": {},
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
                      "_id": "3",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_type": "ref",
                    },
                    RecordType {
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
                                      "_type": "string",
                                    },
                                  ],
                                  "_definition": {},
                                  "_guessedTrace": undefined,
                                  "_id": "2",
                                  "_isCommutative": false,
                                  "_options": {},
                                  "_origin": {},
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
                              "_id": "4",
                              "_isCommutative": true,
                              "_options": {},
                              "_origin": {},
                              "_type": "ref",
                            },
                          ],
                          "_definition": {},
                          "_guessedTrace": undefined,
                          "_id": "5",
                          "_isCommutative": true,
                          "_origin": {},
                          "_type": "nullable",
                        },
                      ],
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "6",
                      "_isCommutative": false,
                      "_options": {},
                      "_origin": {},
                      "_type": "object",
                      "element": NodeTrait {
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
                                    "_type": "string",
                                  },
                                ],
                                "_definition": {},
                                "_guessedTrace": undefined,
                                "_id": "2",
                                "_isCommutative": false,
                                "_options": {},
                                "_origin": {},
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
                            "_id": "4",
                            "_isCommutative": true,
                            "_options": {},
                            "_origin": {},
                            "_type": "ref",
                          },
                        ],
                        "_definition": {},
                        "_guessedTrace": undefined,
                        "_id": "5",
                        "_isCommutative": true,
                        "_origin": {},
                        "_type": "nullable",
                      },
                      "shape": {},
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "7",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_type": "union",
                },
                "2" => RecordType {
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
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
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
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "transform": {
                "2:symbolName": [Function],
                "7:symbolName": [Function],
              },
              "type": "generic",
            },
            "schema": {
              "$defs": {
                "{{2:symbolName}}": {
                  "additionalProperties": {
                    "type": "string",
                  },
                  "type": "object",
                },
              },
              "$schema": "http://json-schema.org/draft-07/schema#",
              "anyOf": [
                {
                  "$ref": "#/$defs/{{2:symbolName}}",
                },
                {
                  "additionalProperties": {
                    "anyOf": [
                      {
                        "$ref": "#/$defs/{{2:symbolName}}",
                      },
                      {
                        "type": "null",
                      },
                    ],
                  },
                  "type": "object",
                },
              ],
              "title": "{{7:symbolName}}",
            },
            "validator": [Function],
          }
        `)
    })
})
