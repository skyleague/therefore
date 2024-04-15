import { $jsonschema } from './jsonschema.js'

import type { JsonSchema } from '../../../json.js'
import type { OpenapiV3 } from '../../../types/openapi.type.js'
import { walkTherefore } from '../../cst/visitor.js'
import { TypescriptFileOutput } from '../../output/typescript.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'
import { buildContext, jsonSchemaVisitor } from '../../visitor/jsonschema/jsonschema.js'
import { $object } from '../object/object.js'
import type { StringType } from '../string/string.js'

import { entriesOf, forAll } from '@skyleague/axioms'
import got from 'got'
import { describe, expect, it } from 'vitest'

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
          JSONObjectType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              IntegerType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "description": "Age in years which must be equal to or greater than zero.",
                  "optional": true,
                },
                "id": "5",
                "isCommutative": true,
                "name": "age",
                "options": {
                  "maxInclusive": true,
                  "min": 0,
                  "minInclusive": true,
                },
                "type": "integer",
              },
              StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "description": "The person's first name.",
                  "optional": true,
                },
                "id": "6",
                "isCommutative": true,
                "name": "firstName",
                "options": {},
                "type": "string",
              },
              StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "description": "The person's last name.",
                  "optional": true,
                },
                "id": "7",
                "isCommutative": true,
                "name": "lastName",
                "options": {},
                "type": "string",
              },
            ],
            "definition": {
              "jsonschema": {
                "title": "Person",
              },
            },
            "id": "4",
            "isCommutative": false,
            "loaded": true,
            "options": {},
            "shape": {
              "age": IntegerType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "description": "Age in years which must be equal to or greater than zero.",
                  "optional": true,
                },
                "id": "5",
                "isCommutative": true,
                "name": "age",
                "options": {
                  "maxInclusive": true,
                  "min": 0,
                  "minInclusive": true,
                },
                "type": "integer",
              },
              "firstName": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "description": "The person's first name.",
                  "optional": true,
                },
                "id": "6",
                "isCommutative": true,
                "name": "firstName",
                "options": {},
                "type": "string",
              },
              "lastName": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "description": "The person's last name.",
                  "optional": true,
                },
                "id": "7",
                "isCommutative": true,
                "name": "lastName",
                "options": {},
                "type": "string",
              },
            },
            "type": "object",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
        expect(json).toMatchInlineSnapshot(`
          {
            "additionalProperties": true,
            "properties": {
              "age": {
                "description": "Age in years which must be equal to or greater than zero.",
                "minimum": 0,
                "type": "integer",
              },
              "firstName": {
                "description": "The person's first name.",
                "type": "string",
              },
              "lastName": {
                "description": "The person's last name.",
                "type": "string",
              },
            },
            "title": "Person",
            "type": "object",
          }
        `)
    })

    it('typescript', () => {
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * Person
           */
          export interface {{4:symbolName}} {
              /**
               * Age in years which must be equal to or greater than zero.
               */
              age?: (number | undefined)
              /**
               * The person's first name.
               */
              firstName?: (string | undefined)
              /**
               * The person's last name.
               */
              lastName?: (string | undefined)
          }"
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
          JSONObjectType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              NumberType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "4",
                "isCommutative": true,
                "name": "latitude",
                "options": {
                  "max": 90,
                  "maxInclusive": true,
                  "min": -90,
                  "minInclusive": true,
                },
                "type": "number",
              },
              NumberType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "5",
                "isCommutative": true,
                "name": "longitude",
                "options": {
                  "max": 180,
                  "maxInclusive": true,
                  "min": -180,
                  "minInclusive": true,
                },
                "type": "number",
              },
            ],
            "definition": {
              "description": "A geographical coordinate.",
              "jsonschema": {
                "title": "Longitude and Latitude Values",
              },
            },
            "id": "3",
            "isCommutative": false,
            "loaded": true,
            "options": {},
            "shape": {
              "latitude": NumberType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "4",
                "isCommutative": true,
                "name": "latitude",
                "options": {
                  "max": 90,
                  "maxInclusive": true,
                  "min": -90,
                  "minInclusive": true,
                },
                "type": "number",
              },
              "longitude": NumberType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "5",
                "isCommutative": true,
                "name": "longitude",
                "options": {
                  "max": 180,
                  "maxInclusive": true,
                  "min": -180,
                  "minInclusive": true,
                },
                "type": "number",
              },
            },
            "type": "object",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
        expect(json).toMatchInlineSnapshot(`
          {
            "additionalProperties": true,
            "description": "A geographical coordinate.",
            "properties": {
              "latitude": {
                "maximum": 90,
                "minimum": -90,
                "type": "number",
              },
              "longitude": {
                "maximum": 180,
                "minimum": -180,
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
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * Longitude and Latitude Values
           * 
           * A geographical coordinate.
           */
          export interface {{3:symbolName}} {
              latitude: number
              longitude: number
          }"
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
          JSONObjectType {
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
                    "id": "1",
                    "isCommutative": true,
                    "name": "fruits",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {
                  "optional": true,
                },
                "element": StringType {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "definition": {},
                  "id": "1",
                  "isCommutative": true,
                  "name": "fruits",
                  "options": {},
                  "type": "string",
                },
                "id": "6",
                "isCommutative": false,
                "name": "fruits",
                "options": {},
                "type": "array",
              },
              NodeTrait {
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
                      JSONObjectType {
                        "attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "children": [
                          BooleanType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "Do I like this vegetable?",
                            },
                            "id": "11",
                            "isCommutative": true,
                            "name": "veggieLike",
                            "options": {},
                            "type": "boolean",
                          },
                          StringType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "The name of the vegetable.",
                            },
                            "id": "12",
                            "isCommutative": true,
                            "name": "veggieName",
                            "options": {},
                            "type": "string",
                          },
                        ],
                        "definition": {},
                        "id": "10",
                        "isCommutative": false,
                        "name": "veggie",
                        "options": {},
                        "shape": {
                          "veggieLike": BooleanType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "Do I like this vegetable?",
                            },
                            "id": "11",
                            "isCommutative": true,
                            "name": "veggieLike",
                            "options": {},
                            "type": "boolean",
                          },
                          "veggieName": StringType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "The name of the vegetable.",
                            },
                            "id": "12",
                            "isCommutative": true,
                            "name": "veggieName",
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
                    "id": "3",
                    "isCommutative": true,
                    "name": "vegetables",
                    "options": {},
                    "type": "ref",
                  },
                ],
                "definition": {
                  "optional": true,
                },
                "element": NodeTrait {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "children": [
                    JSONObjectType {
                      "attributes": {
                        "generic": {},
                        "typescript": {},
                      },
                      "children": [
                        BooleanType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "Do I like this vegetable?",
                          },
                          "id": "11",
                          "isCommutative": true,
                          "name": "veggieLike",
                          "options": {},
                          "type": "boolean",
                        },
                        StringType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "The name of the vegetable.",
                          },
                          "id": "12",
                          "isCommutative": true,
                          "name": "veggieName",
                          "options": {},
                          "type": "string",
                        },
                      ],
                      "definition": {},
                      "id": "10",
                      "isCommutative": false,
                      "name": "veggie",
                      "options": {},
                      "shape": {
                        "veggieLike": BooleanType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "Do I like this vegetable?",
                          },
                          "id": "11",
                          "isCommutative": true,
                          "name": "veggieLike",
                          "options": {},
                          "type": "boolean",
                        },
                        "veggieName": StringType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "The name of the vegetable.",
                          },
                          "id": "12",
                          "isCommutative": true,
                          "name": "veggieName",
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
                  "id": "3",
                  "isCommutative": true,
                  "name": "vegetables",
                  "options": {},
                  "type": "ref",
                },
                "id": "7",
                "isCommutative": false,
                "name": "vegetables",
                "options": {},
                "type": "array",
              },
            ],
            "definition": {
              "description": "A representation of a person, company, organization, or place",
            },
            "id": "5",
            "isCommutative": false,
            "loaded": true,
            "options": {},
            "shape": {
              "fruits": NodeTrait {
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
                    "id": "1",
                    "isCommutative": true,
                    "name": "fruits",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {
                  "optional": true,
                },
                "element": StringType {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "definition": {},
                  "id": "1",
                  "isCommutative": true,
                  "name": "fruits",
                  "options": {},
                  "type": "string",
                },
                "id": "6",
                "isCommutative": false,
                "name": "fruits",
                "options": {},
                "type": "array",
              },
              "vegetables": NodeTrait {
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
                      JSONObjectType {
                        "attributes": {
                          "generic": {},
                          "typescript": {},
                        },
                        "children": [
                          BooleanType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "Do I like this vegetable?",
                            },
                            "id": "11",
                            "isCommutative": true,
                            "name": "veggieLike",
                            "options": {},
                            "type": "boolean",
                          },
                          StringType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "The name of the vegetable.",
                            },
                            "id": "12",
                            "isCommutative": true,
                            "name": "veggieName",
                            "options": {},
                            "type": "string",
                          },
                        ],
                        "definition": {},
                        "id": "10",
                        "isCommutative": false,
                        "name": "veggie",
                        "options": {},
                        "shape": {
                          "veggieLike": BooleanType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "Do I like this vegetable?",
                            },
                            "id": "11",
                            "isCommutative": true,
                            "name": "veggieLike",
                            "options": {},
                            "type": "boolean",
                          },
                          "veggieName": StringType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "description": "The name of the vegetable.",
                            },
                            "id": "12",
                            "isCommutative": true,
                            "name": "veggieName",
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
                    "id": "3",
                    "isCommutative": true,
                    "name": "vegetables",
                    "options": {},
                    "type": "ref",
                  },
                ],
                "definition": {
                  "optional": true,
                },
                "element": NodeTrait {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "children": [
                    JSONObjectType {
                      "attributes": {
                        "generic": {},
                        "typescript": {},
                      },
                      "children": [
                        BooleanType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "Do I like this vegetable?",
                          },
                          "id": "11",
                          "isCommutative": true,
                          "name": "veggieLike",
                          "options": {},
                          "type": "boolean",
                        },
                        StringType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "The name of the vegetable.",
                          },
                          "id": "12",
                          "isCommutative": true,
                          "name": "veggieName",
                          "options": {},
                          "type": "string",
                        },
                      ],
                      "definition": {},
                      "id": "10",
                      "isCommutative": false,
                      "name": "veggie",
                      "options": {},
                      "shape": {
                        "veggieLike": BooleanType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "Do I like this vegetable?",
                          },
                          "id": "11",
                          "isCommutative": true,
                          "name": "veggieLike",
                          "options": {},
                          "type": "boolean",
                        },
                        "veggieName": StringType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "description": "The name of the vegetable.",
                          },
                          "id": "12",
                          "isCommutative": true,
                          "name": "veggieName",
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
                  "id": "3",
                  "isCommutative": true,
                  "name": "vegetables",
                  "options": {},
                  "type": "ref",
                },
                "id": "7",
                "isCommutative": false,
                "name": "vegetables",
                "options": {},
                "type": "array",
              },
            },
            "type": "object",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
        expect(json).toMatchInlineSnapshot(`
          {
            "additionalProperties": true,
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
                  "$ref": "#/$defs/{{10:symbolName}}",
                },
                "type": "array",
              },
            },
            "type": "object",
          }
        `)
    })

    it('typescript', () => {
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * A representation of a person, company, organization, or place
           */
          export interface {{5:symbolName}} {
              fruits?: ((string)[] | undefined)
              vegetables?: (({{10:referenceName}})[] | undefined)
          }
          interface {{10:symbolName}} {
              /**
               * Do I like this vegetable?
               */
              veggieLike: boolean
              /**
               * The name of the vegetable.
               */
              veggieName: string
          }"
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
                $jsonschema(v as JsonSchema, { document: schema }),
            ]),
        )
        return $object(entries)
    }

    it('definition', async () => {
        expect(await therefore()).toMatchSnapshot()
    })

    it('jsonschema', async () => {
        const json = walkTherefore(await therefore(), jsonSchemaVisitor, buildContext())
        expect(json).toMatchSnapshot()
    })

    it('typescript', async () => {
        expect(TypescriptFileOutput.define({ symbol: await therefore() })).toMatchSnapshot()
    })
})

it('primitives', () => {
    forAll(arbitrary($jsonschema({ type: 'string', minLength: 1 }) as StringType), (x) => x.length >= 1)
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
          JSONObjectType {
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
                    "id": "1",
                    "isCommutative": true,
                    "name": "fruits",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "element": StringType {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "definition": {},
                  "id": "1",
                  "isCommutative": true,
                  "name": "fruits",
                  "options": {},
                  "type": "string",
                },
                "id": "9",
                "isCommutative": false,
                "name": "fruits",
                "options": {},
                "type": "array",
              },
              UnionType {
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
                    "id": "5",
                    "isCommutative": true,
                    "name": "store",
                    "options": {},
                    "type": "string",
                  },
                  NumberType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "6",
                    "isCommutative": true,
                    "name": "store",
                    "options": {
                      "maxInclusive": true,
                      "minInclusive": true,
                    },
                    "type": "number",
                  },
                ],
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "id": "10",
                "isCommutative": true,
                "name": "store",
                "options": {},
                "type": "union",
              },
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
                    "id": "3",
                    "isCommutative": true,
                    "name": "vegetables",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {
                  "optional": true,
                },
                "element": StringType {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "definition": {},
                  "id": "3",
                  "isCommutative": true,
                  "name": "vegetables",
                  "options": {},
                  "type": "string",
                },
                "id": "11",
                "isCommutative": false,
                "name": "vegetables",
                "options": {},
                "type": "array",
              },
            ],
            "definition": {
              "description": "An object with nullable properties",
            },
            "id": "8",
            "isCommutative": false,
            "loaded": true,
            "options": {},
            "shape": {
              "fruits": NodeTrait {
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
                    "id": "1",
                    "isCommutative": true,
                    "name": "fruits",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "element": StringType {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "definition": {},
                  "id": "1",
                  "isCommutative": true,
                  "name": "fruits",
                  "options": {},
                  "type": "string",
                },
                "id": "9",
                "isCommutative": false,
                "name": "fruits",
                "options": {},
                "type": "array",
              },
              "store": UnionType {
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
                    "id": "5",
                    "isCommutative": true,
                    "name": "store",
                    "options": {},
                    "type": "string",
                  },
                  NumberType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "6",
                    "isCommutative": true,
                    "name": "store",
                    "options": {
                      "maxInclusive": true,
                      "minInclusive": true,
                    },
                    "type": "number",
                  },
                ],
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "id": "10",
                "isCommutative": true,
                "name": "store",
                "options": {},
                "type": "union",
              },
              "vegetables": NodeTrait {
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
                    "name": "vegetables",
                    "options": {},
                    "type": "string",
                  },
                ],
                "definition": {
                  "optional": true,
                },
                "element": StringType {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "definition": {},
                  "id": "3",
                  "isCommutative": true,
                  "name": "vegetables",
                  "options": {},
                  "type": "string",
                },
                "id": "11",
                "isCommutative": false,
                "name": "vegetables",
                "options": {},
                "type": "array",
              },
            },
            "type": "object",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
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
                "type": "array",
              },
              "store": {
                "anyOf": [
                  {
                    "type": "string",
                  },
                  {
                    "type": "number",
                  },
                  {
                    "type": "null",
                  },
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
          }
        `)
    })

    it('typescript', () => {
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * An object with nullable properties
           */
          export interface {{8:symbolName}} {
              fruits?: ((string)[] | null | undefined)
              store?: ((string | number) | null | undefined)
              vegetables?: ((string)[] | undefined)
          }"
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
          JSONObjectType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "children": [
              NumberType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "7",
                "isCommutative": true,
                "name": "bar",
                "options": {
                  "maxInclusive": true,
                  "minInclusive": true,
                },
                "type": "number",
              },
              StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "id": "8",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
              UnionType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "children": [
                  BooleanType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "3",
                    "isCommutative": true,
                    "name": "foobar",
                    "options": {},
                    "type": "boolean",
                  },
                  NumberType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "4",
                    "isCommutative": true,
                    "name": "foobar",
                    "options": {
                      "maxInclusive": true,
                      "minInclusive": true,
                    },
                    "type": "number",
                  },
                ],
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "id": "9",
                "isCommutative": true,
                "name": "foobar",
                "options": {},
                "type": "union",
              },
            ],
            "definition": {
              "description": "An object with optional properties",
            },
            "id": "6",
            "isCommutative": false,
            "loaded": true,
            "options": {},
            "shape": {
              "bar": NumberType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {},
                "id": "7",
                "isCommutative": true,
                "name": "bar",
                "options": {
                  "maxInclusive": true,
                  "minInclusive": true,
                },
                "type": "number",
              },
              "foo": StringType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "id": "8",
                "isCommutative": true,
                "name": "foo",
                "options": {},
                "type": "string",
              },
              "foobar": UnionType {
                "attributes": {
                  "generic": {},
                  "typescript": {},
                },
                "children": [
                  BooleanType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "3",
                    "isCommutative": true,
                    "name": "foobar",
                    "options": {},
                    "type": "boolean",
                  },
                  NumberType {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "definition": {},
                    "id": "4",
                    "isCommutative": true,
                    "name": "foobar",
                    "options": {
                      "maxInclusive": true,
                      "minInclusive": true,
                    },
                    "type": "number",
                  },
                ],
                "definition": {
                  "nullable": true,
                  "optional": true,
                },
                "id": "9",
                "isCommutative": true,
                "name": "foobar",
                "options": {},
                "type": "union",
              },
            },
            "type": "object",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
        expect(json).toMatchInlineSnapshot(`
          {
            "additionalProperties": true,
            "description": "An object with optional properties",
            "properties": {
              "bar": {
                "type": "number",
              },
              "foo": {
                "nullable": true,
                "type": "string",
              },
              "foobar": {
                "anyOf": [
                  {
                    "type": "boolean",
                  },
                  {
                    "type": "number",
                  },
                  {
                    "type": "null",
                  },
                ],
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
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * An object with optional properties
           */
          export interface {{6:symbolName}} {
              bar: number
              foo?: (string | null | undefined)
              foobar?: ((boolean | number) | null | undefined)
          }"
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
          JSONObjectType {
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
                  NodeTrait {
                    "attributes": {
                      "generic": {},
                      "typescript": {},
                    },
                    "children": [
                      JSONObjectType {
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
                            "definition": {
                              "nullable": true,
                              "optional": true,
                            },
                            "id": "7",
                            "isCommutative": true,
                            "name": "bar",
                            "options": {},
                            "type": "string",
                          },
                        ],
                        "definition": {},
                        "id": "6",
                        "isCommutative": false,
                        "name": "Foo",
                        "options": {},
                        "shape": {
                          "bar": StringType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "nullable": true,
                              "optional": true,
                            },
                            "id": "7",
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
                    "id": "1",
                    "isCommutative": true,
                    "name": "foo",
                    "options": {},
                    "type": "ref",
                  },
                ],
                "definition": {
                  "jsonschema": {
                    "examples": [
                      {
                        "bar": "wut",
                      },
                    ],
                  },
                  "nullable": true,
                  "optional": true,
                },
                "element": NodeTrait {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "children": [
                    JSONObjectType {
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
                          "definition": {
                            "nullable": true,
                            "optional": true,
                          },
                          "id": "7",
                          "isCommutative": true,
                          "name": "bar",
                          "options": {},
                          "type": "string",
                        },
                      ],
                      "definition": {},
                      "id": "6",
                      "isCommutative": false,
                      "name": "Foo",
                      "options": {},
                      "shape": {
                        "bar": StringType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "nullable": true,
                            "optional": true,
                          },
                          "id": "7",
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
                  "id": "1",
                  "isCommutative": true,
                  "name": "foo",
                  "options": {},
                  "type": "ref",
                },
                "id": "4",
                "isCommutative": false,
                "name": "foo",
                "options": {},
                "type": "array",
              },
            ],
            "definition": {
              "description": "An object with a nullable array that has a ref",
            },
            "id": "3",
            "isCommutative": false,
            "loaded": true,
            "options": {},
            "shape": {
              "foo": NodeTrait {
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
                      JSONObjectType {
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
                            "definition": {
                              "nullable": true,
                              "optional": true,
                            },
                            "id": "7",
                            "isCommutative": true,
                            "name": "bar",
                            "options": {},
                            "type": "string",
                          },
                        ],
                        "definition": {},
                        "id": "6",
                        "isCommutative": false,
                        "name": "Foo",
                        "options": {},
                        "shape": {
                          "bar": StringType {
                            "attributes": {
                              "generic": {},
                              "typescript": {},
                            },
                            "definition": {
                              "nullable": true,
                              "optional": true,
                            },
                            "id": "7",
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
                    "id": "1",
                    "isCommutative": true,
                    "name": "foo",
                    "options": {},
                    "type": "ref",
                  },
                ],
                "definition": {
                  "jsonschema": {
                    "examples": [
                      {
                        "bar": "wut",
                      },
                    ],
                  },
                  "nullable": true,
                  "optional": true,
                },
                "element": NodeTrait {
                  "attributes": {
                    "generic": {},
                    "typescript": {},
                  },
                  "children": [
                    JSONObjectType {
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
                          "definition": {
                            "nullable": true,
                            "optional": true,
                          },
                          "id": "7",
                          "isCommutative": true,
                          "name": "bar",
                          "options": {},
                          "type": "string",
                        },
                      ],
                      "definition": {},
                      "id": "6",
                      "isCommutative": false,
                      "name": "Foo",
                      "options": {},
                      "shape": {
                        "bar": StringType {
                          "attributes": {
                            "generic": {},
                            "typescript": {},
                          },
                          "definition": {
                            "nullable": true,
                            "optional": true,
                          },
                          "id": "7",
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
                  "id": "1",
                  "isCommutative": true,
                  "name": "foo",
                  "options": {},
                  "type": "ref",
                },
                "id": "4",
                "isCommutative": false,
                "name": "foo",
                "options": {},
                "type": "array",
              },
            },
            "type": "object",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
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
                  "$ref": "#/$defs/{{6:symbolName}}",
                },
                "nullable": true,
                "type": "array",
              },
            },
            "type": "object",
          }
        `)
    })

    it('typescript', () => {
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * An object with a nullable array that has a ref
           */
          export interface {{3:symbolName}} {
              foo?: (({{6:referenceName}})[] | null | undefined)
          }
          interface {{6:symbolName}} {
              bar?: (string | null | undefined)
          }"
        `)
    })
})

describe('const', () => {
    const schema: JsonSchema = { const: {}, title: '  ' }
    const therefore = () => $jsonschema(schema)

    it('definition', () => {
        expect(therefore()).toMatchInlineSnapshot(`
          ConstType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "const": {},
            "definition": {
              "jsonschema": {
                "title": "  ",
              },
            },
            "id": "1",
            "isCommutative": true,
            "loaded": true,
            "options": {},
            "type": "const",
          }
        `)
    })

    it('jsonschema', () => {
        const json = buildContext().render(therefore())
        expect(json).toMatchInlineSnapshot(`
          {
            "const": {},
            "title": "  ",
          }
        `)
    })

    it('typescript', () => {
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * 
           */
          export type {{1:symbolName}} = {  }"
        `)
    })

    it('generate', () => {
        forAll(arbitrary(therefore()), (x) => {
            expect(x).toEqual({})
        })
    })
})
