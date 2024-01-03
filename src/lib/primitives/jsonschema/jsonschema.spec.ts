import { $jsonschema } from './jsonschema.js'

import type { JsonSchema } from '../../../json.js'
import { walkTherefore } from '../../cst/visitor.js'
import { arbitrary } from '../../visitor/index.js'
import { jsonSchemaContext, jsonSchemaVisitor } from '../../visitor/jsonschema/jsonschema.js'
import type { TypescriptWalkerContext } from '../../visitor/typescript/typescript.js'
import { typeDefinitionVisitor } from '../../visitor/typescript/typescript.js'
import { $object } from '../object/index.js'
import type { OpenapiV3 } from '../restclient/openapi.type.js'

import { entriesOf, forAll } from '@skyleague/axioms'
import got from 'got'
import { expect, describe, it } from 'vitest'

describe('person', () => {
    const schema: JsonSchema = {
        title: 'Person',
        type: 'object',
        properties: {
            firstName: {
                type: 'string',
                description: "The person's first name.",
            },
            lastName: {
                type: 'string',
                description: "The person's last name.",
            },
            age: {
                description: 'Age in years which must be equal to or greater than zero.',
                type: 'integer',
                minimum: 0,
            },
        },
        additionalProperties: false,
    }
    const therefore = () => $jsonschema(schema)
    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
          {
            "children": [
              {
                "children": [],
                "description": {
                  "description": "Age in years which must be equal to or greater than zero.",
                  "name": "age",
                  "optional": "implicit",
                },
                "name": "age",
                "type": "integer",
                "uuid": "0004-000",
                "value": {
                  "maximum": undefined,
                  "minimum": 0,
                  "multipleOf": undefined,
                },
              },
              {
                "children": [],
                "description": {
                  "description": "The person's first name.",
                  "name": "firstName",
                  "optional": "implicit",
                },
                "name": "firstName",
                "type": "string",
                "uuid": "0005-000",
                "value": {
                  "format": undefined,
                  "maxLength": undefined,
                  "minLength": undefined,
                  "pattern": undefined,
                },
              },
              {
                "children": [],
                "description": {
                  "description": "The person's last name.",
                  "name": "lastName",
                  "optional": "implicit",
                },
                "name": "lastName",
                "type": "string",
                "uuid": "0006-000",
                "value": {
                  "format": undefined,
                  "maxLength": undefined,
                  "minLength": undefined,
                  "pattern": undefined,
                },
              },
            ],
            "description": {
              "title": "Person",
            },
            "prepass": true,
            "type": "object",
            "uuid": "0007-000",
            "value": {},
          }
        `)
    })

    it('jsonschema', () => {
        const json = walkTherefore(therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "properties": {
                "age": {
                  "description": "Age in years which must be equal to or greater than zero.",
                  "minimum": 0,
                  "title": "age",
                  "type": "integer",
                },
                "firstName": {
                  "description": "The person's first name.",
                  "title": "firstName",
                  "type": "string",
                },
                "lastName": {
                  "description": "The person's last name.",
                  "title": "lastName",
                  "type": "string",
                },
              },
              "title": "Person",
              "type": "object",
            }
        `)
    })

    it('typescript', () => {
        expect(
            walkTherefore(therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
          {
            "declaration": "/**
           * Person
           */
          interface {{0007-000:symbolName}} {
              /**
               * Age in years which must be equal to or greater than zero.
               */
              age?: number
              /**
               * The person's first name.
               */
              firstName?: string
              /**
               * The person's last name.
               */
              lastName?: string
          }
          ",
            "referenceName": "{{0007-000:symbolName}}",
            "render": [Function],
            "sourceSymbol": undefined,
          }
        `)
    })
})

describe('coordinates', () => {
    const schema: JsonSchema = {
        $id: 'https://example.com/geographical-location.schema.json',
        title: 'Longitude and Latitude Values',
        description: 'A geographical coordinate.',
        required: ['latitude', 'longitude'],
        type: 'object',
        properties: {
            latitude: {
                type: 'number',
                minimum: -90,
                maximum: 90,
            },
            longitude: {
                type: 'number',
                minimum: -180,
                maximum: 180,
            },
        },
        additionalProperties: false,
    }
    const therefore = () => $jsonschema(schema)
    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [],
                  "description": {
                    "name": "latitude",
                  },
                  "name": "latitude",
                  "type": "number",
                  "uuid": "0001-000",
                  "value": {
                    "maximum": 90,
                    "minimum": -90,
                    "multipleOf": undefined,
                  },
                },
                {
                  "children": [],
                  "description": {
                    "name": "longitude",
                  },
                  "name": "longitude",
                  "type": "number",
                  "uuid": "0002-000",
                  "value": {
                    "maximum": 180,
                    "minimum": -180,
                    "multipleOf": undefined,
                  },
                },
              ],
              "description": {
                "description": "A geographical coordinate.",
                "title": "Longitude and Latitude Values",
              },
              "prepass": true,
              "type": "object",
              "uuid": "0003-000",
              "value": {},
            }
        `)
    })

    it('jsonschema', () => {
        const json = walkTherefore(therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "description": "A geographical coordinate.",
              "properties": {
                "latitude": {
                  "maximum": 90,
                  "minimum": -90,
                  "title": "latitude",
                  "type": "number",
                },
                "longitude": {
                  "maximum": 180,
                  "minimum": -180,
                  "title": "longitude",
                  "type": "number",
                },
              },
              "required": [
                "latitude",
                "longitude",
              ],
              "title": "Longitude and Latitude Values",
              "type": "object",
            }
        `)
    })

    it('typescript', () => {
        expect(
            walkTherefore(therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "/**
             * Longitude and Latitude Values
             * 
             * A geographical coordinate.
             */
            interface {{0003-000:symbolName}} {
                latitude: number
                longitude: number
            }
            ",
              "referenceName": "{{0003-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })
})

describe('array', () => {
    const schema: JsonSchema = {
        $id: 'https://example.com/arrays.schema.json',
        description: 'A representation of a person, company, organization, or place',
        type: 'object',
        properties: {
            fruits: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            vegetables: {
                type: 'array',
                items: { $ref: '#/$defs/veggie' },
            },
        },
        additionalProperties: false,
        $defs: {
            veggie: {
                type: 'object',
                required: ['veggieName', 'veggieLike'],
                properties: {
                    veggieName: {
                        type: 'string',
                        description: 'The name of the vegetable.',
                    },
                    veggieLike: {
                        type: 'boolean',
                        description: 'Do I like this vegetable?',
                    },
                },
                additionalProperties: false,
            },
        },
    }
    const therefore = () => $jsonschema(schema)

    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "description": {},
                    "type": "string",
                    "uuid": "0001-000",
                    "value": {
                      "format": undefined,
                      "maxLength": undefined,
                      "minLength": undefined,
                      "pattern": undefined,
                    },
                  },
                ],
                "description": {
                  "name": "fruits",
                  "optional": "implicit",
                },
                "name": "fruits",
                "type": "array",
                "uuid": "0005-000",
                "value": {
                  "maxItems": undefined,
                  "minItems": undefined,
                  "uniqueItems": undefined,
                },
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "children": [
                          {
                            "children": [],
                            "description": {
                              "description": "Do I like this vegetable?",
                              "name": "veggieLike",
                            },
                            "name": "veggieLike",
                            "type": "boolean",
                            "uuid": "0009-000",
                            "value": {},
                          },
                          {
                            "children": [],
                            "description": {
                              "description": "The name of the vegetable.",
                              "name": "veggieName",
                            },
                            "name": "veggieName",
                            "type": "string",
                            "uuid": "0008-000",
                            "value": {
                              "format": undefined,
                              "maxLength": undefined,
                              "minLength": undefined,
                              "pattern": undefined,
                            },
                          },
                        ],
                        "description": {
                          "name": "veggie",
                        },
                        "name": "veggie",
                        "type": "object",
                        "uuid": "00010-000",
                        "value": {},
                      },
                    ],
                    "description": {
                      "name": undefined,
                    },
                    "name": "veggie",
                    "type": "ref",
                    "uuid": "0003-000",
                    "value": {
                      "allowIntersectionTypes": false,
                      "cache": Map {},
                      "exportAllSymbols": false,
                      "exportSymbol": false,
                      "metaSchemas": {},
                      "optionalNullable": false,
                      "references": Map {
                        "#" => [
                          undefined,
                          [Function],
                        ],
                        "#/$defs/veggie" => [
                          "veggie",
                          [Function],
                        ],
                      },
                      "root": {
                        "$defs": {
                          "veggie": {
                            "additionalProperties": false,
                            "properties": {
                              "veggieLike": {
                                "description": "Do I like this vegetable?",
                                "type": "boolean",
                              },
                              "veggieName": {
                                "description": "The name of the vegetable.",
                                "type": "string",
                              },
                            },
                            "required": [
                              "veggieName",
                              "veggieLike",
                            ],
                            "type": "object",
                          },
                        },
                        "$id": "https://example.com/arrays.schema.json",
                        "additionalProperties": false,
                        "description": "A representation of a person, company, organization, or place",
                        "properties": {
                          "fruits": {
                            "items": {
                              "type": "string",
                            },
                            "type": "array",
                          },
                          "vegetables": {
                            "items": {
                              "$ref": "#/$defs/veggie",
                            },
                            "type": "array",
                          },
                        },
                        "type": "object",
                      },
                      "strict": true,
                    },
                  },
                ],
                "description": {
                  "name": "vegetables",
                  "optional": "implicit",
                },
                "name": "vegetables",
                "type": "array",
                "uuid": "0006-000",
                "value": {
                  "maxItems": undefined,
                  "minItems": undefined,
                  "uniqueItems": undefined,
                },
              },
            ],
            "description": {
              "description": "A representation of a person, company, organization, or place",
            },
            "prepass": true,
            "type": "object",
            "uuid": "0007-000",
            "value": {},
          }
        `)
    })

    it('jsonschema', () => {
        const json = walkTherefore(therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "description": "A representation of a person, company, organization, or place",
              "properties": {
                "fruits": {
                  "items": {
                    "type": "string",
                  },
                  "title": "fruits",
                  "type": "array",
                },
                "vegetables": {
                  "items": {
                    "$ref": "#/$defs/{{00010-000:uniqueSymbolName}}",
                  },
                  "title": "vegetables",
                  "type": "array",
                },
              },
              "type": "object",
            }
        `)
    })

    it('typescript', () => {
        expect(
            walkTherefore(therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "/**
             * A representation of a person, company, organization, or place
             */
            interface {{0007-000:symbolName}} {
                fruits?: (string)[]
                vegetables?: ({{00010-000:referenceName}})[]
            }
            ",
              "referenceName": "{{0007-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })
})

describe('petstore', () => {
    const openapi = () => got.get('https://petstore3.swagger.io/api/v3/openapi.json').json<OpenapiV3>()

    const therefore = async () => {
        const schema = await openapi()
        const entries = Object.fromEntries(
            entriesOf((schema.components as any)?.schemas ?? {}).map(([name, v]) => [
                name,
                $jsonschema(v as JsonSchema, { root: schema as JsonSchema }),
            ])
        )
        return $object(entries)
    }

    it('definition', async () => {
        expect(await therefore()).toMatchSnapshot()
    })

    it('jsonschema', async () => {
        const json = walkTherefore(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchSnapshot()
    })

    it('typescript', async () => {
        expect(
            walkTherefore(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchSnapshot()
    })
})

it('primitives', () => {
    forAll(arbitrary<string>($jsonschema({ type: 'string', minLength: 1 })), (x) => x.length >= 1)
})

describe('object with nullable property', () => {
    const schema: JsonSchema = {
        description: 'An object with nullable properties',
        type: 'object',
        properties: {
            fruits: {
                type: 'array',
                nullable: true,
                items: {
                    type: 'string',
                },
            },
            vegetables: {
                type: 'array',
                items: { type: 'string' },
            },
            store: {
                type: ['string', 'number'],
                nullable: true,
            },
        },
        additionalProperties: false,
    }
    const therefore = () => $jsonschema(schema)

    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "description": {},
                    "type": "string",
                    "uuid": "0001-000",
                    "value": {
                      "format": undefined,
                      "maxLength": undefined,
                      "minLength": undefined,
                      "pattern": undefined,
                    },
                  },
                ],
                "description": {
                  "name": "fruits",
                  "nullable": true,
                  "optional": "implicit",
                },
                "name": "fruits",
                "type": "array",
                "uuid": "0009-000",
                "value": {
                  "maxItems": undefined,
                  "minItems": undefined,
                  "uniqueItems": undefined,
                },
              },
              {
                "children": [
                  {
                    "children": [],
                    "description": {
                      "name": "store",
                      "nullable": true,
                    },
                    "name": "store",
                    "type": "string",
                    "uuid": "0005-000",
                    "value": {
                      "format": undefined,
                      "maxLength": undefined,
                      "minLength": undefined,
                      "pattern": undefined,
                    },
                  },
                  {
                    "children": [],
                    "description": {
                      "name": "store",
                      "nullable": true,
                    },
                    "name": "store",
                    "type": "number",
                    "uuid": "0006-000",
                    "value": {
                      "maximum": undefined,
                      "minimum": undefined,
                      "multipleOf": undefined,
                    },
                  },
                  {
                    "children": [
                      null,
                    ],
                    "description": {
                      "name": "store",
                      "nullable": true,
                    },
                    "name": "store",
                    "type": "enum",
                    "uuid": "0007-000",
                    "value": {},
                  },
                ],
                "description": {
                  "name": "store",
                  "optional": "implicit",
                },
                "name": "store",
                "type": "union",
                "uuid": "00010-000",
                "value": {
                  "allowIntersectionTypes": false,
                  "cache": Map {},
                  "exportAllSymbols": false,
                  "metaSchemas": {},
                  "optionalNullable": false,
                  "references": Map {
                    "#" => [
                      undefined,
                      [Function],
                    ],
                  },
                  "root": {
                    "additionalProperties": false,
                    "description": "An object with nullable properties",
                    "properties": {
                      "fruits": {
                        "items": {
                          "type": "string",
                        },
                        "nullable": true,
                        "type": "array",
                      },
                      "store": {
                        "nullable": true,
                        "type": [
                          "string",
                          "number",
                        ],
                      },
                      "vegetables": {
                        "items": {
                          "type": "string",
                        },
                        "type": "array",
                      },
                    },
                    "type": "object",
                  },
                  "strict": true,
                },
              },
              {
                "children": [
                  {
                    "children": [],
                    "description": {},
                    "type": "string",
                    "uuid": "0003-000",
                    "value": {
                      "format": undefined,
                      "maxLength": undefined,
                      "minLength": undefined,
                      "pattern": undefined,
                    },
                  },
                ],
                "description": {
                  "name": "vegetables",
                  "optional": "implicit",
                },
                "name": "vegetables",
                "type": "array",
                "uuid": "00011-000",
                "value": {
                  "maxItems": undefined,
                  "minItems": undefined,
                  "uniqueItems": undefined,
                },
              },
            ],
            "description": {
              "description": "An object with nullable properties",
            },
            "prepass": true,
            "type": "object",
            "uuid": "00012-000",
            "value": {},
          }
        `)
    })

    it('jsonschema', () => {
        const json = walkTherefore(therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "description": "An object with nullable properties",
              "properties": {
                "fruits": {
                  "items": {
                    "type": "string",
                  },
                  "nullable": true,
                  "title": "fruits",
                  "type": [
                    "array",
                    "null",
                  ],
                },
                "store": {
                  "anyOf": [
                    {
                      "nullable": true,
                      "title": "store",
                      "type": [
                        "string",
                        "null",
                      ],
                    },
                    {
                      "nullable": true,
                      "title": "store",
                      "type": [
                        "number",
                        "null",
                      ],
                    },
                    {
                      "const": null,
                      "title": "store",
                    },
                  ],
                  "title": "store",
                },
                "vegetables": {
                  "items": {
                    "type": "string",
                  },
                  "title": "vegetables",
                  "type": "array",
                },
              },
              "type": "object",
            }
        `)
    })

    it('typescript', () => {
        expect(
            walkTherefore(therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
          {
            "declaration": "/**
           * An object with nullable properties
           */
          interface {{00012-000:symbolName}} {
              fruits?: ((string)[] | null)
              store?: string | number | null
              vegetables?: (string)[]
          }
          ",
            "referenceName": "{{00012-000:symbolName}}",
            "render": [Function],
            "sourceSymbol": undefined,
          }
        `)
    })
})

describe('make optional properties nullable', () => {
    const schema: JsonSchema = {
        description: 'An object with optional properties',
        type: 'object',
        properties: {
            foo: { type: 'string' },
            bar: { type: 'number' },
            foobar: { type: ['boolean', 'number'] },
        },
        required: ['bar'],
        additionalProperties: false,
    }
    const therefore = () => $jsonschema(schema, { optionalNullable: true })

    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
          {
            "children": [
              {
                "children": [],
                "description": {
                  "name": "bar",
                },
                "name": "bar",
                "type": "number",
                "uuid": "0002-000",
                "value": {
                  "maximum": undefined,
                  "minimum": undefined,
                  "multipleOf": undefined,
                },
              },
              {
                "children": [],
                "description": {
                  "name": "foo",
                  "nullable": true,
                  "optional": "implicit",
                },
                "name": "foo",
                "type": "string",
                "uuid": "0007-000",
                "value": {
                  "format": undefined,
                  "maxLength": undefined,
                  "minLength": undefined,
                  "pattern": undefined,
                },
              },
              {
                "children": [
                  {
                    "children": [],
                    "description": {
                      "name": "foobar",
                      "nullable": true,
                    },
                    "name": "foobar",
                    "type": "boolean",
                    "uuid": "0003-000",
                    "value": {},
                  },
                  {
                    "children": [],
                    "description": {
                      "name": "foobar",
                      "nullable": true,
                    },
                    "name": "foobar",
                    "type": "number",
                    "uuid": "0004-000",
                    "value": {
                      "maximum": undefined,
                      "minimum": undefined,
                      "multipleOf": undefined,
                    },
                  },
                  {
                    "children": [
                      null,
                    ],
                    "description": {
                      "name": "foobar",
                      "nullable": true,
                    },
                    "name": "foobar",
                    "type": "enum",
                    "uuid": "0005-000",
                    "value": {},
                  },
                ],
                "description": {
                  "name": "foobar",
                  "optional": "implicit",
                },
                "name": "foobar",
                "type": "union",
                "uuid": "0008-000",
                "value": {
                  "allowIntersectionTypes": false,
                  "cache": Map {},
                  "exportAllSymbols": false,
                  "metaSchemas": {},
                  "optionalNullable": true,
                  "references": Map {
                    "#" => [
                      undefined,
                      [Function],
                    ],
                  },
                  "root": {
                    "additionalProperties": false,
                    "description": "An object with optional properties",
                    "properties": {
                      "bar": {
                        "type": "number",
                      },
                      "foo": {
                        "type": "string",
                      },
                      "foobar": {
                        "type": [
                          "boolean",
                          "number",
                        ],
                      },
                    },
                    "required": [
                      "bar",
                    ],
                    "type": "object",
                  },
                  "strict": true,
                },
              },
            ],
            "description": {
              "description": "An object with optional properties",
              "optionalNullable": true,
            },
            "prepass": true,
            "type": "object",
            "uuid": "0009-000",
            "value": {},
          }
        `)
    })

    it('jsonschema', () => {
        const json = walkTherefore(therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "description": "An object with optional properties",
              "properties": {
                "bar": {
                  "title": "bar",
                  "type": "number",
                },
                "foo": {
                  "nullable": true,
                  "title": "foo",
                  "type": [
                    "string",
                    "null",
                  ],
                },
                "foobar": {
                  "anyOf": [
                    {
                      "nullable": true,
                      "title": "foobar",
                      "type": [
                        "boolean",
                        "null",
                      ],
                    },
                    {
                      "nullable": true,
                      "title": "foobar",
                      "type": [
                        "number",
                        "null",
                      ],
                    },
                    {
                      "const": null,
                      "title": "foobar",
                    },
                  ],
                  "title": "foobar",
                },
              },
              "required": [
                "bar",
              ],
              "type": "object",
            }
        `)
    })

    it('typescript', () => {
        expect(
            walkTherefore(therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
          {
            "declaration": "/**
           * An object with optional properties
           */
          interface {{0009-000:symbolName}} {
              bar: number
              foo?: (string | null)
              foobar?: boolean | number | null
          }
          ",
            "referenceName": "{{0009-000:symbolName}}",
            "render": [Function],
            "sourceSymbol": undefined,
          }
        `)
    })
})

describe('nullable array', () => {
    const schema: JsonSchema = {
        description: 'An object with a nullable array that has a ref',
        type: 'object',
        properties: {
            foo: {
                type: 'array',
                items: { $ref: '#/$defs/Foo' },
                examples: [{ bar: 'wut' }],
            },
        },
        $defs: {
            Foo: {
                type: 'object',
                properties: {
                    bar: {
                        type: 'string',
                    },
                },
            },
        },
    }
    const therefore = () => $jsonschema(schema, { optionalNullable: true })

    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "children": [
                          {
                            "children": [],
                            "description": {
                              "name": "bar",
                              "nullable": true,
                              "optional": "implicit",
                            },
                            "name": "bar",
                            "type": "string",
                            "uuid": "0006-000",
                            "value": {
                              "format": undefined,
                              "maxLength": undefined,
                              "minLength": undefined,
                              "pattern": undefined,
                            },
                          },
                        ],
                        "description": {
                          "name": "Foo",
                        },
                        "name": "Foo",
                        "type": "object",
                        "uuid": "0007-000",
                        "value": {},
                      },
                    ],
                    "description": {
                      "name": undefined,
                    },
                    "name": "Foo",
                    "type": "ref",
                    "uuid": "0001-000",
                    "value": {
                      "allowIntersectionTypes": false,
                      "cache": Map {},
                      "exportAllSymbols": false,
                      "exportSymbol": false,
                      "metaSchemas": {},
                      "optionalNullable": true,
                      "references": Map {
                        "#" => [
                          undefined,
                          [Function],
                        ],
                        "#/$defs/Foo" => [
                          "Foo",
                          [Function],
                        ],
                      },
                      "root": {
                        "$defs": {
                          "Foo": {
                            "properties": {
                              "bar": {
                                "type": "string",
                              },
                            },
                            "type": "object",
                          },
                        },
                        "description": "An object with a nullable array that has a ref",
                        "properties": {
                          "foo": {
                            "examples": [
                              {
                                "bar": "wut",
                              },
                            ],
                            "items": {
                              "$ref": "#/$defs/Foo",
                            },
                            "type": "array",
                          },
                        },
                        "type": "object",
                      },
                      "strict": true,
                    },
                  },
                ],
                "description": {
                  "examples": [
                    {
                      "bar": "wut",
                    },
                  ],
                  "name": "foo",
                  "nullable": true,
                  "optional": "implicit",
                },
                "name": "foo",
                "type": "array",
                "uuid": "0003-000",
                "value": {
                  "maxItems": undefined,
                  "minItems": undefined,
                  "uniqueItems": undefined,
                },
              },
            ],
            "description": {
              "description": "An object with a nullable array that has a ref",
              "optionalNullable": true,
            },
            "prepass": true,
            "type": "object",
            "uuid": "0004-000",
            "value": {},
          }
        `)
    })

    it('jsonschema', () => {
        const json = walkTherefore(therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": true,
              "description": "An object with a nullable array that has a ref",
              "properties": {
                "foo": {
                  "examples": [
                    {
                      "bar": "wut",
                    },
                  ],
                  "items": {
                    "$ref": "#/$defs/{{0007-000:uniqueSymbolName}}",
                  },
                  "nullable": true,
                  "title": "foo",
                  "type": [
                    "array",
                    "null",
                  ],
                },
              },
              "type": "object",
            }
        `)
    })

    it('typescript', () => {
        expect(
            walkTherefore(therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "/**
             * An object with a nullable array that has a ref
             */
            interface {{0004-000:symbolName}} {
                /**
                 * @example foo = { bar: 'wut' }
                 */
                foo?: (({{0007-000:referenceName}})[] | null)
            }
            ",
              "referenceName": "{{0004-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })
})
