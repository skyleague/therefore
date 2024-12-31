import { $jsonschema } from './jsonschema.js'

import { TypescriptFileOutput } from '../../../commands/generate/output/typescript.js'
import type { JsonSchema } from '../../../json.js'
import type { OpenapiV3 } from '../../../types/openapi.type.js'
import { walkTherefore } from '../../cst/visitor.js'
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  IntegerType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {
                      "description": "Age in years which must be equal to or greater than zero.",
                    },
                    "_id": "3",
                    "_isCommutative": true,
                    "_name": "age",
                    "_options": {
                      "maxInclusive": true,
                      "min": 0,
                      "minInclusive": true,
                    },
                    "_origin": {},
                    "_type": "integer",
                  },
                ],
                "_definition": {},
                "_id": "4",
                "_isCommutative": true,
                "_name": "age",
                "_origin": {},
                "_type": "optional",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {
                      "description": "The person's first name.",
                    },
                    "_id": "1",
                    "_isCommutative": true,
                    "_name": "firstName",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                ],
                "_definition": {},
                "_id": "5",
                "_isCommutative": true,
                "_name": "firstName",
                "_origin": {},
                "_type": "optional",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {
                      "description": "The person's last name.",
                    },
                    "_id": "2",
                    "_isCommutative": true,
                    "_name": "lastName",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                ],
                "_definition": {},
                "_id": "6",
                "_isCommutative": true,
                "_name": "lastName",
                "_origin": {},
                "_type": "optional",
              },
            ],
            "_definition": {
              "jsonschema": {
                "title": "Person",
              },
            },
            "_id": "7",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "loaded": true,
            "shape": {
              "age": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  IntegerType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {
                      "description": "Age in years which must be equal to or greater than zero.",
                    },
                    "_id": "3",
                    "_isCommutative": true,
                    "_name": "age",
                    "_options": {
                      "maxInclusive": true,
                      "min": 0,
                      "minInclusive": true,
                    },
                    "_origin": {},
                    "_type": "integer",
                  },
                ],
                "_definition": {},
                "_id": "4",
                "_isCommutative": true,
                "_name": "age",
                "_origin": {},
                "_type": "optional",
              },
              "firstName": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {
                      "description": "The person's first name.",
                    },
                    "_id": "1",
                    "_isCommutative": true,
                    "_name": "firstName",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                ],
                "_definition": {},
                "_id": "5",
                "_isCommutative": true,
                "_name": "firstName",
                "_origin": {},
                "_type": "optional",
              },
              "lastName": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {
                      "description": "The person's last name.",
                    },
                    "_id": "2",
                    "_isCommutative": true,
                    "_name": "lastName",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                ],
                "_definition": {},
                "_id": "6",
                "_isCommutative": true,
                "_name": "lastName",
                "_origin": {},
                "_type": "optional",
              },
            },
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
          interface {{7:symbolName}} {
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              NumberType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_definition": {},
                "_id": "1",
                "_isCommutative": true,
                "_name": "latitude",
                "_options": {
                  "max": 90,
                  "min": -90,
                },
                "_origin": {},
                "_type": "number",
              },
              NumberType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_definition": {},
                "_id": "2",
                "_isCommutative": true,
                "_name": "longitude",
                "_options": {
                  "max": 180,
                  "min": -180,
                },
                "_origin": {},
                "_type": "number",
              },
            ],
            "_definition": {
              "description": "A geographical coordinate.",
              "jsonschema": {
                "title": "Longitude and Latitude Values",
              },
            },
            "_id": "3",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "loaded": true,
            "shape": {
              "latitude": NumberType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_definition": {},
                "_id": "1",
                "_isCommutative": true,
                "_name": "latitude",
                "_options": {
                  "max": 90,
                  "min": -90,
                },
                "_origin": {},
                "_type": "number",
              },
              "longitude": NumberType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_definition": {},
                "_id": "2",
                "_isCommutative": true,
                "_name": "longitude",
                "_options": {
                  "max": 180,
                  "min": -180,
                },
                "_origin": {},
                "_type": "number",
              },
            },
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
          interface {{3:symbolName}} {
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      StringType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_definition": {},
                        "_id": "1",
                        "_isCommutative": true,
                        "_name": "fruits",
                        "_options": {},
                        "_origin": {},
                        "_type": "string",
                      },
                    ],
                    "_definition": {},
                    "_id": "2",
                    "_isCommutative": false,
                    "_name": "fruits",
                    "_options": {},
                    "_origin": {},
                    "_type": "array",
                    "element": StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                      },
                      "_definition": {},
                      "_id": "1",
                      "_isCommutative": true,
                      "_name": "fruits",
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  },
                ],
                "_definition": {},
                "_id": "5",
                "_isCommutative": true,
                "_name": "fruits",
                "_origin": {},
                "_type": "optional",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          JSONObjectType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": "ajv",
                            },
                            "_children": [
                              BooleanType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "Do I like this vegetable?",
                                },
                                "_id": "9",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "boolean",
                              },
                              StringType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "The name of the vegetable.",
                                },
                                "_id": "8",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "string",
                              },
                            ],
                            "_definition": {},
                            "_id": "10",
                            "_isCommutative": false,
                            "_name": "veggie",
                            "_options": {},
                            "_origin": {},
                            "_type": "object",
                            "shape": {
                              "veggieLike": BooleanType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "Do I like this vegetable?",
                                },
                                "_id": "9",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "boolean",
                              },
                              "veggieName": StringType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "The name of the vegetable.",
                                },
                                "_id": "8",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "string",
                              },
                            },
                          },
                        ],
                        "_definition": {},
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
                        "_name": "vegetables",
                        "_options": {},
                        "_origin": {},
                        "_type": "ref",
                      },
                    ],
                    "_definition": {},
                    "_id": "4",
                    "_isCommutative": false,
                    "_name": "vegetables",
                    "_options": {},
                    "_origin": {},
                    "_type": "array",
                    "element": NodeTrait {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                      },
                      "_children": [
                        JSONObjectType {
                          "_attributes": {
                            "generic": {},
                            "isGenerated": true,
                            "typescript": {},
                            "validator": "ajv",
                          },
                          "_children": [
                            BooleanType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "Do I like this vegetable?",
                              },
                              "_id": "9",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "boolean",
                            },
                            StringType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "The name of the vegetable.",
                              },
                              "_id": "8",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_id": "10",
                          "_isCommutative": false,
                          "_name": "veggie",
                          "_options": {},
                          "_origin": {},
                          "_type": "object",
                          "shape": {
                            "veggieLike": BooleanType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "Do I like this vegetable?",
                              },
                              "_id": "9",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "boolean",
                            },
                            "veggieName": StringType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "The name of the vegetable.",
                              },
                              "_id": "8",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "string",
                            },
                          },
                        },
                      ],
                      "_definition": {},
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
                      "_name": "vegetables",
                      "_options": {},
                      "_origin": {},
                      "_type": "ref",
                    },
                  },
                ],
                "_definition": {},
                "_id": "6",
                "_isCommutative": true,
                "_name": "vegetables",
                "_origin": {},
                "_type": "optional",
              },
            ],
            "_definition": {
              "description": "A representation of a person, company, organization, or place",
            },
            "_id": "7",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "loaded": true,
            "shape": {
              "fruits": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      StringType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_definition": {},
                        "_id": "1",
                        "_isCommutative": true,
                        "_name": "fruits",
                        "_options": {},
                        "_origin": {},
                        "_type": "string",
                      },
                    ],
                    "_definition": {},
                    "_id": "2",
                    "_isCommutative": false,
                    "_name": "fruits",
                    "_options": {},
                    "_origin": {},
                    "_type": "array",
                    "element": StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                      },
                      "_definition": {},
                      "_id": "1",
                      "_isCommutative": true,
                      "_name": "fruits",
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  },
                ],
                "_definition": {},
                "_id": "5",
                "_isCommutative": true,
                "_name": "fruits",
                "_origin": {},
                "_type": "optional",
              },
              "vegetables": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          JSONObjectType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": "ajv",
                            },
                            "_children": [
                              BooleanType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "Do I like this vegetable?",
                                },
                                "_id": "9",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "boolean",
                              },
                              StringType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "The name of the vegetable.",
                                },
                                "_id": "8",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "string",
                              },
                            ],
                            "_definition": {},
                            "_id": "10",
                            "_isCommutative": false,
                            "_name": "veggie",
                            "_options": {},
                            "_origin": {},
                            "_type": "object",
                            "shape": {
                              "veggieLike": BooleanType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "Do I like this vegetable?",
                                },
                                "_id": "9",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "boolean",
                              },
                              "veggieName": StringType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": undefined,
                                },
                                "_definition": {
                                  "description": "The name of the vegetable.",
                                },
                                "_id": "8",
                                "_isCommutative": true,
                                "_name": "veggie",
                                "_options": {},
                                "_origin": {},
                                "_type": "string",
                              },
                            },
                          },
                        ],
                        "_definition": {},
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
                        "_name": "vegetables",
                        "_options": {},
                        "_origin": {},
                        "_type": "ref",
                      },
                    ],
                    "_definition": {},
                    "_id": "4",
                    "_isCommutative": false,
                    "_name": "vegetables",
                    "_options": {},
                    "_origin": {},
                    "_type": "array",
                    "element": NodeTrait {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                      },
                      "_children": [
                        JSONObjectType {
                          "_attributes": {
                            "generic": {},
                            "isGenerated": true,
                            "typescript": {},
                            "validator": "ajv",
                          },
                          "_children": [
                            BooleanType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "Do I like this vegetable?",
                              },
                              "_id": "9",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "boolean",
                            },
                            StringType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "The name of the vegetable.",
                              },
                              "_id": "8",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "string",
                            },
                          ],
                          "_definition": {},
                          "_id": "10",
                          "_isCommutative": false,
                          "_name": "veggie",
                          "_options": {},
                          "_origin": {},
                          "_type": "object",
                          "shape": {
                            "veggieLike": BooleanType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "Do I like this vegetable?",
                              },
                              "_id": "9",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "boolean",
                            },
                            "veggieName": StringType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": undefined,
                              },
                              "_definition": {
                                "description": "The name of the vegetable.",
                              },
                              "_id": "8",
                              "_isCommutative": true,
                              "_name": "veggie",
                              "_options": {},
                              "_origin": {},
                              "_type": "string",
                            },
                          },
                        },
                      ],
                      "_definition": {},
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
                      "_name": "vegetables",
                      "_options": {},
                      "_origin": {},
                      "_type": "ref",
                    },
                  },
                ],
                "_definition": {},
                "_id": "6",
                "_isCommutative": true,
                "_name": "vegetables",
                "_origin": {},
                "_type": "optional",
              },
            },
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
          interface {{7:symbolName}} {
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          StringType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "1",
                            "_isCommutative": true,
                            "_name": "fruits",
                            "_options": {},
                            "_origin": {},
                            "_type": "string",
                          },
                        ],
                        "_definition": {},
                        "_id": "2",
                        "_isCommutative": false,
                        "_name": "fruits",
                        "_options": {},
                        "_origin": {},
                        "_type": "array",
                        "element": StringType {
                          "_attributes": {
                            "generic": {},
                            "isGenerated": true,
                            "typescript": {},
                            "validator": undefined,
                          },
                          "_definition": {},
                          "_id": "1",
                          "_isCommutative": true,
                          "_name": "fruits",
                          "_options": {},
                          "_origin": {},
                          "_type": "string",
                        },
                      },
                    ],
                    "_definition": {},
                    "_id": "3",
                    "_isCommutative": true,
                    "_name": "fruits",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "10",
                "_isCommutative": true,
                "_name": "fruits",
                "_origin": {},
                "_type": "optional",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      UnionType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          StringType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "6",
                            "_isCommutative": true,
                            "_name": "store",
                            "_options": {},
                            "_origin": {},
                            "_type": "string",
                          },
                          NumberType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "7",
                            "_isCommutative": true,
                            "_name": "store",
                            "_options": {},
                            "_origin": {},
                            "_type": "number",
                          },
                        ],
                        "_definition": {},
                        "_id": "8",
                        "_isCommutative": false,
                        "_name": "store",
                        "_options": {},
                        "_origin": {},
                        "_type": "union",
                      },
                    ],
                    "_definition": {},
                    "_id": "9",
                    "_isCommutative": true,
                    "_name": "store",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "11",
                "_isCommutative": true,
                "_name": "store",
                "_origin": {},
                "_type": "optional",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      StringType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_definition": {},
                        "_id": "4",
                        "_isCommutative": true,
                        "_name": "vegetables",
                        "_options": {},
                        "_origin": {},
                        "_type": "string",
                      },
                    ],
                    "_definition": {},
                    "_id": "5",
                    "_isCommutative": false,
                    "_name": "vegetables",
                    "_options": {},
                    "_origin": {},
                    "_type": "array",
                    "element": StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                      },
                      "_definition": {},
                      "_id": "4",
                      "_isCommutative": true,
                      "_name": "vegetables",
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  },
                ],
                "_definition": {},
                "_id": "12",
                "_isCommutative": true,
                "_name": "vegetables",
                "_origin": {},
                "_type": "optional",
              },
            ],
            "_definition": {
              "description": "An object with nullable properties",
            },
            "_id": "13",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "loaded": true,
            "shape": {
              "fruits": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          StringType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "1",
                            "_isCommutative": true,
                            "_name": "fruits",
                            "_options": {},
                            "_origin": {},
                            "_type": "string",
                          },
                        ],
                        "_definition": {},
                        "_id": "2",
                        "_isCommutative": false,
                        "_name": "fruits",
                        "_options": {},
                        "_origin": {},
                        "_type": "array",
                        "element": StringType {
                          "_attributes": {
                            "generic": {},
                            "isGenerated": true,
                            "typescript": {},
                            "validator": undefined,
                          },
                          "_definition": {},
                          "_id": "1",
                          "_isCommutative": true,
                          "_name": "fruits",
                          "_options": {},
                          "_origin": {},
                          "_type": "string",
                        },
                      },
                    ],
                    "_definition": {},
                    "_id": "3",
                    "_isCommutative": true,
                    "_name": "fruits",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "10",
                "_isCommutative": true,
                "_name": "fruits",
                "_origin": {},
                "_type": "optional",
              },
              "store": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      UnionType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          StringType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "6",
                            "_isCommutative": true,
                            "_name": "store",
                            "_options": {},
                            "_origin": {},
                            "_type": "string",
                          },
                          NumberType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "7",
                            "_isCommutative": true,
                            "_name": "store",
                            "_options": {},
                            "_origin": {},
                            "_type": "number",
                          },
                        ],
                        "_definition": {},
                        "_id": "8",
                        "_isCommutative": false,
                        "_name": "store",
                        "_options": {},
                        "_origin": {},
                        "_type": "union",
                      },
                    ],
                    "_definition": {},
                    "_id": "9",
                    "_isCommutative": true,
                    "_name": "store",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "11",
                "_isCommutative": true,
                "_name": "store",
                "_origin": {},
                "_type": "optional",
              },
              "vegetables": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      StringType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_definition": {},
                        "_id": "4",
                        "_isCommutative": true,
                        "_name": "vegetables",
                        "_options": {},
                        "_origin": {},
                        "_type": "string",
                      },
                    ],
                    "_definition": {},
                    "_id": "5",
                    "_isCommutative": false,
                    "_name": "vegetables",
                    "_options": {},
                    "_origin": {},
                    "_type": "array",
                    "element": StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                      },
                      "_definition": {},
                      "_id": "4",
                      "_isCommutative": true,
                      "_name": "vegetables",
                      "_options": {},
                      "_origin": {},
                      "_type": "string",
                    },
                  },
                ],
                "_definition": {},
                "_id": "12",
                "_isCommutative": true,
                "_name": "vegetables",
                "_origin": {},
                "_type": "optional",
              },
            },
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
                "type": [
                  "array",
                  "null",
                ],
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
          interface {{13:symbolName}} {
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              NumberType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_definition": {},
                "_id": "2",
                "_isCommutative": true,
                "_name": "bar",
                "_options": {},
                "_origin": {},
                "_type": "number",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      StringType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_definition": {},
                        "_id": "1",
                        "_isCommutative": true,
                        "_name": "foo",
                        "_options": {},
                        "_origin": {},
                        "_type": "string",
                      },
                    ],
                    "_definition": {},
                    "_id": "6",
                    "_isCommutative": true,
                    "_name": "foo",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "7",
                "_isCommutative": true,
                "_name": "foo",
                "_origin": {},
                "_type": "optional",
              },
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      UnionType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          BooleanType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "3",
                            "_isCommutative": true,
                            "_name": "foobar",
                            "_options": {},
                            "_origin": {},
                            "_type": "boolean",
                          },
                          NumberType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "4",
                            "_isCommutative": true,
                            "_name": "foobar",
                            "_options": {},
                            "_origin": {},
                            "_type": "number",
                          },
                        ],
                        "_definition": {},
                        "_id": "5",
                        "_isCommutative": false,
                        "_name": "foobar",
                        "_options": {},
                        "_origin": {},
                        "_type": "union",
                      },
                    ],
                    "_definition": {},
                    "_id": "8",
                    "_isCommutative": true,
                    "_name": "foobar",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "9",
                "_isCommutative": true,
                "_name": "foobar",
                "_origin": {},
                "_type": "optional",
              },
            ],
            "_definition": {
              "description": "An object with optional properties",
            },
            "_id": "10",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "loaded": true,
            "shape": {
              "bar": NumberType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_definition": {},
                "_id": "2",
                "_isCommutative": true,
                "_name": "bar",
                "_options": {},
                "_origin": {},
                "_type": "number",
              },
              "foo": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      StringType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_definition": {},
                        "_id": "1",
                        "_isCommutative": true,
                        "_name": "foo",
                        "_options": {},
                        "_origin": {},
                        "_type": "string",
                      },
                    ],
                    "_definition": {},
                    "_id": "6",
                    "_isCommutative": true,
                    "_name": "foo",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "7",
                "_isCommutative": true,
                "_name": "foo",
                "_origin": {},
                "_type": "optional",
              },
              "foobar": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      UnionType {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          BooleanType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "3",
                            "_isCommutative": true,
                            "_name": "foobar",
                            "_options": {},
                            "_origin": {},
                            "_type": "boolean",
                          },
                          NumberType {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_definition": {},
                            "_id": "4",
                            "_isCommutative": true,
                            "_name": "foobar",
                            "_options": {},
                            "_origin": {},
                            "_type": "number",
                          },
                        ],
                        "_definition": {},
                        "_id": "5",
                        "_isCommutative": false,
                        "_name": "foobar",
                        "_options": {},
                        "_origin": {},
                        "_type": "union",
                      },
                    ],
                    "_definition": {},
                    "_id": "8",
                    "_isCommutative": true,
                    "_name": "foobar",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "9",
                "_isCommutative": true,
                "_name": "foobar",
                "_origin": {},
                "_type": "optional",
              },
            },
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
                "type": [
                  "string",
                  "null",
                ],
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
          interface {{10:symbolName}} {
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_children": [
                              JSONObjectType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": "ajv",
                                },
                                "_children": [
                                  NodeTrait {
                                    "_attributes": {
                                      "generic": {},
                                      "isGenerated": true,
                                      "typescript": {},
                                      "validator": undefined,
                                    },
                                    "_children": [
                                      NodeTrait {
                                        "_attributes": {
                                          "generic": {},
                                          "isGenerated": true,
                                          "typescript": {},
                                          "validator": undefined,
                                        },
                                        "_children": [
                                          StringType {
                                            "_attributes": {
                                              "generic": {},
                                              "isGenerated": true,
                                              "typescript": {},
                                              "validator": undefined,
                                            },
                                            "_definition": {},
                                            "_id": "6",
                                            "_isCommutative": true,
                                            "_name": "Foo",
                                            "_options": {},
                                            "_origin": {},
                                            "_type": "string",
                                          },
                                        ],
                                        "_definition": {},
                                        "_id": "7",
                                        "_isCommutative": true,
                                        "_name": "Foo",
                                        "_origin": {},
                                        "_type": "nullable",
                                      },
                                    ],
                                    "_definition": {},
                                    "_id": "8",
                                    "_isCommutative": true,
                                    "_name": "Foo",
                                    "_origin": {},
                                    "_type": "optional",
                                  },
                                ],
                                "_definition": {},
                                "_id": "9",
                                "_isCommutative": false,
                                "_name": "Foo",
                                "_options": {},
                                "_origin": {},
                                "_type": "object",
                                "shape": {
                                  "bar": NodeTrait {
                                    "_attributes": {
                                      "generic": {},
                                      "isGenerated": true,
                                      "typescript": {},
                                      "validator": undefined,
                                    },
                                    "_children": [
                                      NodeTrait {
                                        "_attributes": {
                                          "generic": {},
                                          "isGenerated": true,
                                          "typescript": {},
                                          "validator": undefined,
                                        },
                                        "_children": [
                                          StringType {
                                            "_attributes": {
                                              "generic": {},
                                              "isGenerated": true,
                                              "typescript": {},
                                              "validator": undefined,
                                            },
                                            "_definition": {},
                                            "_id": "6",
                                            "_isCommutative": true,
                                            "_name": "Foo",
                                            "_options": {},
                                            "_origin": {},
                                            "_type": "string",
                                          },
                                        ],
                                        "_definition": {},
                                        "_id": "7",
                                        "_isCommutative": true,
                                        "_name": "Foo",
                                        "_origin": {},
                                        "_type": "nullable",
                                      },
                                    ],
                                    "_definition": {},
                                    "_id": "8",
                                    "_isCommutative": true,
                                    "_name": "Foo",
                                    "_origin": {},
                                    "_type": "optional",
                                  },
                                },
                              },
                            ],
                            "_definition": {},
                            "_hooks": {
                              "onGenerate": [
                                [Function],
                              ],
                              "onLoad": [
                                [Function],
                              ],
                            },
                            "_id": "1",
                            "_isCommutative": true,
                            "_name": "foo",
                            "_options": {},
                            "_origin": {},
                            "_type": "ref",
                          },
                        ],
                        "_definition": {
                          "jsonschema": {
                            "examples": [
                              {
                                "bar": "wut",
                              },
                            ],
                          },
                        },
                        "_id": "2",
                        "_isCommutative": false,
                        "_name": "foo",
                        "_options": {},
                        "_origin": {},
                        "_type": "array",
                        "element": NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "isGenerated": true,
                            "typescript": {},
                            "validator": undefined,
                          },
                          "_children": [
                            JSONObjectType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": "ajv",
                              },
                              "_children": [
                                NodeTrait {
                                  "_attributes": {
                                    "generic": {},
                                    "isGenerated": true,
                                    "typescript": {},
                                    "validator": undefined,
                                  },
                                  "_children": [
                                    NodeTrait {
                                      "_attributes": {
                                        "generic": {},
                                        "isGenerated": true,
                                        "typescript": {},
                                        "validator": undefined,
                                      },
                                      "_children": [
                                        StringType {
                                          "_attributes": {
                                            "generic": {},
                                            "isGenerated": true,
                                            "typescript": {},
                                            "validator": undefined,
                                          },
                                          "_definition": {},
                                          "_id": "6",
                                          "_isCommutative": true,
                                          "_name": "Foo",
                                          "_options": {},
                                          "_origin": {},
                                          "_type": "string",
                                        },
                                      ],
                                      "_definition": {},
                                      "_id": "7",
                                      "_isCommutative": true,
                                      "_name": "Foo",
                                      "_origin": {},
                                      "_type": "nullable",
                                    },
                                  ],
                                  "_definition": {},
                                  "_id": "8",
                                  "_isCommutative": true,
                                  "_name": "Foo",
                                  "_origin": {},
                                  "_type": "optional",
                                },
                              ],
                              "_definition": {},
                              "_id": "9",
                              "_isCommutative": false,
                              "_name": "Foo",
                              "_options": {},
                              "_origin": {},
                              "_type": "object",
                              "shape": {
                                "bar": NodeTrait {
                                  "_attributes": {
                                    "generic": {},
                                    "isGenerated": true,
                                    "typescript": {},
                                    "validator": undefined,
                                  },
                                  "_children": [
                                    NodeTrait {
                                      "_attributes": {
                                        "generic": {},
                                        "isGenerated": true,
                                        "typescript": {},
                                        "validator": undefined,
                                      },
                                      "_children": [
                                        StringType {
                                          "_attributes": {
                                            "generic": {},
                                            "isGenerated": true,
                                            "typescript": {},
                                            "validator": undefined,
                                          },
                                          "_definition": {},
                                          "_id": "6",
                                          "_isCommutative": true,
                                          "_name": "Foo",
                                          "_options": {},
                                          "_origin": {},
                                          "_type": "string",
                                        },
                                      ],
                                      "_definition": {},
                                      "_id": "7",
                                      "_isCommutative": true,
                                      "_name": "Foo",
                                      "_origin": {},
                                      "_type": "nullable",
                                    },
                                  ],
                                  "_definition": {},
                                  "_id": "8",
                                  "_isCommutative": true,
                                  "_name": "Foo",
                                  "_origin": {},
                                  "_type": "optional",
                                },
                              },
                            },
                          ],
                          "_definition": {},
                          "_hooks": {
                            "onGenerate": [
                              [Function],
                            ],
                            "onLoad": [
                              [Function],
                            ],
                          },
                          "_id": "1",
                          "_isCommutative": true,
                          "_name": "foo",
                          "_options": {},
                          "_origin": {},
                          "_type": "ref",
                        },
                      },
                    ],
                    "_definition": {},
                    "_id": "3",
                    "_isCommutative": true,
                    "_name": "foo",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "4",
                "_isCommutative": true,
                "_name": "foo",
                "_origin": {},
                "_type": "optional",
              },
            ],
            "_definition": {
              "description": "An object with a nullable array that has a ref",
            },
            "_id": "5",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "object",
            "loaded": true,
            "shape": {
              "foo": NodeTrait {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  NodeTrait {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_children": [
                      NodeTrait {
                        "_attributes": {
                          "generic": {},
                          "isGenerated": true,
                          "typescript": {},
                          "validator": undefined,
                        },
                        "_children": [
                          NodeTrait {
                            "_attributes": {
                              "generic": {},
                              "isGenerated": true,
                              "typescript": {},
                              "validator": undefined,
                            },
                            "_children": [
                              JSONObjectType {
                                "_attributes": {
                                  "generic": {},
                                  "isGenerated": true,
                                  "typescript": {},
                                  "validator": "ajv",
                                },
                                "_children": [
                                  NodeTrait {
                                    "_attributes": {
                                      "generic": {},
                                      "isGenerated": true,
                                      "typescript": {},
                                      "validator": undefined,
                                    },
                                    "_children": [
                                      NodeTrait {
                                        "_attributes": {
                                          "generic": {},
                                          "isGenerated": true,
                                          "typescript": {},
                                          "validator": undefined,
                                        },
                                        "_children": [
                                          StringType {
                                            "_attributes": {
                                              "generic": {},
                                              "isGenerated": true,
                                              "typescript": {},
                                              "validator": undefined,
                                            },
                                            "_definition": {},
                                            "_id": "6",
                                            "_isCommutative": true,
                                            "_name": "Foo",
                                            "_options": {},
                                            "_origin": {},
                                            "_type": "string",
                                          },
                                        ],
                                        "_definition": {},
                                        "_id": "7",
                                        "_isCommutative": true,
                                        "_name": "Foo",
                                        "_origin": {},
                                        "_type": "nullable",
                                      },
                                    ],
                                    "_definition": {},
                                    "_id": "8",
                                    "_isCommutative": true,
                                    "_name": "Foo",
                                    "_origin": {},
                                    "_type": "optional",
                                  },
                                ],
                                "_definition": {},
                                "_id": "9",
                                "_isCommutative": false,
                                "_name": "Foo",
                                "_options": {},
                                "_origin": {},
                                "_type": "object",
                                "shape": {
                                  "bar": NodeTrait {
                                    "_attributes": {
                                      "generic": {},
                                      "isGenerated": true,
                                      "typescript": {},
                                      "validator": undefined,
                                    },
                                    "_children": [
                                      NodeTrait {
                                        "_attributes": {
                                          "generic": {},
                                          "isGenerated": true,
                                          "typescript": {},
                                          "validator": undefined,
                                        },
                                        "_children": [
                                          StringType {
                                            "_attributes": {
                                              "generic": {},
                                              "isGenerated": true,
                                              "typescript": {},
                                              "validator": undefined,
                                            },
                                            "_definition": {},
                                            "_id": "6",
                                            "_isCommutative": true,
                                            "_name": "Foo",
                                            "_options": {},
                                            "_origin": {},
                                            "_type": "string",
                                          },
                                        ],
                                        "_definition": {},
                                        "_id": "7",
                                        "_isCommutative": true,
                                        "_name": "Foo",
                                        "_origin": {},
                                        "_type": "nullable",
                                      },
                                    ],
                                    "_definition": {},
                                    "_id": "8",
                                    "_isCommutative": true,
                                    "_name": "Foo",
                                    "_origin": {},
                                    "_type": "optional",
                                  },
                                },
                              },
                            ],
                            "_definition": {},
                            "_hooks": {
                              "onGenerate": [
                                [Function],
                              ],
                              "onLoad": [
                                [Function],
                              ],
                            },
                            "_id": "1",
                            "_isCommutative": true,
                            "_name": "foo",
                            "_options": {},
                            "_origin": {},
                            "_type": "ref",
                          },
                        ],
                        "_definition": {
                          "jsonschema": {
                            "examples": [
                              {
                                "bar": "wut",
                              },
                            ],
                          },
                        },
                        "_id": "2",
                        "_isCommutative": false,
                        "_name": "foo",
                        "_options": {},
                        "_origin": {},
                        "_type": "array",
                        "element": NodeTrait {
                          "_attributes": {
                            "generic": {},
                            "isGenerated": true,
                            "typescript": {},
                            "validator": undefined,
                          },
                          "_children": [
                            JSONObjectType {
                              "_attributes": {
                                "generic": {},
                                "isGenerated": true,
                                "typescript": {},
                                "validator": "ajv",
                              },
                              "_children": [
                                NodeTrait {
                                  "_attributes": {
                                    "generic": {},
                                    "isGenerated": true,
                                    "typescript": {},
                                    "validator": undefined,
                                  },
                                  "_children": [
                                    NodeTrait {
                                      "_attributes": {
                                        "generic": {},
                                        "isGenerated": true,
                                        "typescript": {},
                                        "validator": undefined,
                                      },
                                      "_children": [
                                        StringType {
                                          "_attributes": {
                                            "generic": {},
                                            "isGenerated": true,
                                            "typescript": {},
                                            "validator": undefined,
                                          },
                                          "_definition": {},
                                          "_id": "6",
                                          "_isCommutative": true,
                                          "_name": "Foo",
                                          "_options": {},
                                          "_origin": {},
                                          "_type": "string",
                                        },
                                      ],
                                      "_definition": {},
                                      "_id": "7",
                                      "_isCommutative": true,
                                      "_name": "Foo",
                                      "_origin": {},
                                      "_type": "nullable",
                                    },
                                  ],
                                  "_definition": {},
                                  "_id": "8",
                                  "_isCommutative": true,
                                  "_name": "Foo",
                                  "_origin": {},
                                  "_type": "optional",
                                },
                              ],
                              "_definition": {},
                              "_id": "9",
                              "_isCommutative": false,
                              "_name": "Foo",
                              "_options": {},
                              "_origin": {},
                              "_type": "object",
                              "shape": {
                                "bar": NodeTrait {
                                  "_attributes": {
                                    "generic": {},
                                    "isGenerated": true,
                                    "typescript": {},
                                    "validator": undefined,
                                  },
                                  "_children": [
                                    NodeTrait {
                                      "_attributes": {
                                        "generic": {},
                                        "isGenerated": true,
                                        "typescript": {},
                                        "validator": undefined,
                                      },
                                      "_children": [
                                        StringType {
                                          "_attributes": {
                                            "generic": {},
                                            "isGenerated": true,
                                            "typescript": {},
                                            "validator": undefined,
                                          },
                                          "_definition": {},
                                          "_id": "6",
                                          "_isCommutative": true,
                                          "_name": "Foo",
                                          "_options": {},
                                          "_origin": {},
                                          "_type": "string",
                                        },
                                      ],
                                      "_definition": {},
                                      "_id": "7",
                                      "_isCommutative": true,
                                      "_name": "Foo",
                                      "_origin": {},
                                      "_type": "nullable",
                                    },
                                  ],
                                  "_definition": {},
                                  "_id": "8",
                                  "_isCommutative": true,
                                  "_name": "Foo",
                                  "_origin": {},
                                  "_type": "optional",
                                },
                              },
                            },
                          ],
                          "_definition": {},
                          "_hooks": {
                            "onGenerate": [
                              [Function],
                            ],
                            "onLoad": [
                              [Function],
                            ],
                          },
                          "_id": "1",
                          "_isCommutative": true,
                          "_name": "foo",
                          "_options": {},
                          "_origin": {},
                          "_type": "ref",
                        },
                      },
                    ],
                    "_definition": {},
                    "_id": "3",
                    "_isCommutative": true,
                    "_name": "foo",
                    "_origin": {},
                    "_type": "nullable",
                  },
                ],
                "_definition": {},
                "_id": "4",
                "_isCommutative": true,
                "_name": "foo",
                "_origin": {},
                "_type": "optional",
              },
            },
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
                  "$ref": "#/$defs/{{9:symbolName}}",
                },
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
        expect(TypescriptFileOutput.define({ symbol: therefore() })).toMatchInlineSnapshot(`
          "/**
           * An object with a nullable array that has a ref
           */
          interface {{5:symbolName}} {
              /**
               * @example Foo = { bar: 'wut' }
               */
              foo?: (({{9:referenceName}})[] | null | undefined)
          }
          interface {{9:symbolName}} {
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
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_definition": {
              "jsonschema": {
                "title": "  ",
              },
            },
            "_id": "1",
            "_isCommutative": true,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "const",
            "const": {},
            "loaded": true,
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
          type {{1:symbolName}} = {  }"
        `)
    })

    it('generate', () => {
        forAll(arbitrary(therefore()), (x) => {
            expect(x).toEqual({})
        })
    })
})

describe('edge cases', () => {
    it('correctly handles oneOf', () => {
        const schema: JsonSchema = {
            type: 'object',
            oneOf: [
                {
                    required: ['OrgId'],
                    properties: {
                        OrgId: {
                            type: 'string',
                        },
                    },
                },
                {
                    required: ['PrvtId'],
                    properties: {
                        PrvtId: {
                            type: 'string',
                        },
                    },
                },
            ],
        }

        const therefore = () => $jsonschema(schema)
        expect(therefore()).toMatchInlineSnapshot(`
          UnionType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_children": [
              JSONObjectType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {},
                    "_id": "2",
                    "_isCommutative": true,
                    "_name": "OrgId",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                ],
                "_definition": {},
                "_id": "3",
                "_isCommutative": false,
                "_options": {},
                "_origin": {},
                "_type": "object",
                "shape": {
                  "OrgId": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {},
                    "_id": "2",
                    "_isCommutative": true,
                    "_name": "OrgId",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                },
              },
              JSONObjectType {
                "_attributes": {
                  "generic": {},
                  "isGenerated": true,
                  "typescript": {},
                  "validator": undefined,
                },
                "_children": [
                  StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {},
                    "_id": "4",
                    "_isCommutative": true,
                    "_name": "PrvtId",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                ],
                "_definition": {},
                "_id": "5",
                "_isCommutative": false,
                "_options": {},
                "_origin": {},
                "_type": "object",
                "shape": {
                  "PrvtId": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                    },
                    "_definition": {},
                    "_id": "4",
                    "_isCommutative": true,
                    "_name": "PrvtId",
                    "_options": {},
                    "_origin": {},
                    "_type": "string",
                  },
                },
              },
            ],
            "_definition": {},
            "_id": "6",
            "_isCommutative": false,
            "_name": undefined,
            "_options": {},
            "_origin": {},
            "_type": "union",
            "loaded": true,
          }
        `)
    })
})
