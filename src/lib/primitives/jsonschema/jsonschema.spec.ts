import { $jsonschema } from './jsonschema'

import type { JsonSchema } from '../../../json'
import { walkTherefore } from '../../cst/visitor'
import { arbitrary } from '../../visitor'
import { jsonSchemaContext, jsonSchemaVisitor } from '../../visitor/jsonschema/jsonschema'
import type { TypescriptWalkerContext } from '../../visitor/typescript/typescript'
import { typeDefinitionVisitor } from '../../visitor/typescript/typescript'
import { $object } from '../object'
import type { OpenapiV3 } from '../restclient/openapi.type'

import { entriesOf, forAll } from '@skyleague/axioms'
import got from 'got'

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
    test('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [],
                  "description": {
                    "description": "The person's first name.",
                    "name": "firstName",
                    "optional": "implicit",
                  },
                  "name": "firstName",
                  "type": "string",
                  "uuid": "0004-000",
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
                    "description": "Age in years which must be equal to or greater than zero.",
                    "name": "age",
                    "optional": "implicit",
                  },
                  "name": "age",
                  "type": "integer",
                  "uuid": "0006-000",
                  "value": {
                    "maximum": undefined,
                    "minimum": 0,
                    "multipleOf": undefined,
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

    test('jsonschema', () => {
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

    test('typescript', () => {
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
                 * The person's first name.
                 */
                firstName?: string
                /**
                 * The person's last name.
                 */
                lastName?: string
                /**
                 * Age in years which must be equal to or greater than zero.
                 */
                age?: number
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
    test('definition', () => {
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

    test('jsonschema', () => {
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

    test('typescript', () => {
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

    test('definition', () => {
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
                        "cache": Map {},
                        "exportAllSymbols": false,
                        "exportSymbol": false,
                        "metaSchemas": {},
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

    test('jsonschema', () => {
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

    test('typescript', () => {
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

    test('definition', async () => {
        expect(await therefore()).toMatchSnapshot()
    })

    test('jsonschema', async () => {
        const json = walkTherefore(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchSnapshot()
    })

    test('typescript', async () => {
        expect(
            walkTherefore(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchSnapshot()
    })
})

test('primitives', () => {
    forAll(arbitrary<string>($jsonschema({ type: 'string', minLength: 1 })), (x) => x.length >= 1)
})
