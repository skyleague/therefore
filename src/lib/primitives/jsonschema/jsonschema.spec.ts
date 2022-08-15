import { $jsonschema } from './jsonschema'

import { awaitAll } from '../../../common/util'
import type { JsonSchema } from '../../../json'
import type { OpenapiV3 } from '../../../openapi.type'
import { walkCst } from '../../cst/visitor'
import { jsonSchemaContext, jsonSchemaVisitor } from '../../visitor/jsonschema/jsonschema'
import type { TypescriptWalkerContext } from '../../visitor/typescript/typescript'
import { typeDefinitionVisitor } from '../../visitor/typescript/typescript'
import { $object } from '../object'

import { entriesOf } from '@skyleague/axioms'
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
    test('definition', async () => {
        expect(await therefore()).toMatchInlineSnapshot(`
            Object {
              "children": Array [
                Object {
                  "children": Array [],
                  "description": Object {
                    "description": "The person's first name.",
                    "name": "firstName",
                    "optional": true,
                  },
                  "name": "firstName",
                  "type": "string",
                  "uuid": "0004-000",
                  "value": Object {
                    "format": undefined,
                    "maxLength": undefined,
                    "minLength": undefined,
                    "pattern": undefined,
                  },
                },
                Object {
                  "children": Array [],
                  "description": Object {
                    "description": "The person's last name.",
                    "name": "lastName",
                    "optional": true,
                  },
                  "name": "lastName",
                  "type": "string",
                  "uuid": "0005-000",
                  "value": Object {
                    "format": undefined,
                    "maxLength": undefined,
                    "minLength": undefined,
                    "pattern": undefined,
                  },
                },
                Object {
                  "children": Array [],
                  "description": Object {
                    "description": "Age in years which must be equal to or greater than zero.",
                    "name": "age",
                    "optional": true,
                  },
                  "name": "age",
                  "type": "integer",
                  "uuid": "0006-000",
                  "value": Object {
                    "maximum": undefined,
                    "minimum": 0,
                    "multipleOf": undefined,
                  },
                },
              ],
              "description": Object {
                "title": "Person",
              },
              "prepass": true,
              "type": "object",
              "uuid": "0007-000",
              "value": Object {},
            }
        `)
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            Object {
              "additionalProperties": false,
              "properties": Object {
                "age": Object {
                  "description": "Age in years which must be equal to or greater than zero.",
                  "minimum": 0,
                  "title": "age",
                  "type": "integer",
                },
                "firstName": Object {
                  "description": "The person's first name.",
                  "title": "firstName",
                  "type": "string",
                },
                "lastName": Object {
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

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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
        expect(therefore()).toMatchInlineSnapshot(`Promise {}`)
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            Object {
              "additionalProperties": false,
              "description": "A geographical coordinate.",
              "properties": Object {
                "latitude": Object {
                  "maximum": 90,
                  "minimum": -90,
                  "title": "latitude",
                  "type": "number",
                },
                "longitude": Object {
                  "maximum": 180,
                  "minimum": -180,
                  "title": "longitude",
                  "type": "number",
                },
              },
              "required": Array [
                "latitude",
                "longitude",
              ],
              "title": "Longitude and Latitude Values",
              "type": "object",
            }
        `)
    })

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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
        expect(therefore()).toMatchInlineSnapshot(`Promise {}`)
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            Object {
              "additionalProperties": false,
              "description": "A representation of a person, company, organization, or place",
              "properties": Object {
                "fruits": Object {
                  "items": Object {
                    "type": "string",
                  },
                  "title": "fruits",
                  "type": "array",
                },
                "vegetables": Object {
                  "items": Object {
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

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "/**
             * A representation of a person, company, organization, or place
             */
            interface {{0009-000:symbolName}} {
                fruits?: (string)[]
                vegetables?: ({{00010-000:referenceName}})[]
            }
            ",
              "referenceName": "{{0009-000:symbolName}}",
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
            await awaitAll(entriesOf(schema?.['components']?.['schemas']), async ([name, v]) => [
                name,
                await $jsonschema(v as JsonSchema, { root: schema as JsonSchema }),
            ])
        )
        return $object(entries)
    }

    test('definition', async () => {
        expect(await therefore()).toMatchInlineSnapshot(`
            Object {
              "children": Array [
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "id",
                        "optional": true,
                      },
                      "name": "id",
                      "type": "integer",
                      "uuid": "0007-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "petId",
                        "optional": true,
                      },
                      "name": "petId",
                      "type": "integer",
                      "uuid": "0008-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "quantity",
                        "optional": true,
                      },
                      "name": "quantity",
                      "type": "integer",
                      "uuid": "0009-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "shipDate",
                        "optional": true,
                      },
                      "name": "shipDate",
                      "type": "string",
                      "uuid": "00010-000",
                      "value": Object {
                        "format": "date-time",
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [
                        "placed",
                        "approved",
                        "delivered",
                      ],
                      "description": Object {
                        "description": "Order Status",
                        "name": "status",
                        "optional": true,
                      },
                      "name": "status",
                      "type": "enum",
                      "uuid": "00011-000",
                      "value": Object {},
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "complete",
                        "optional": true,
                      },
                      "name": "complete",
                      "type": "boolean",
                      "uuid": "00012-000",
                      "value": Object {},
                    },
                  ],
                  "description": Object {},
                  "name": "Order",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00013-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "id",
                        "optional": true,
                      },
                      "name": "id",
                      "type": "integer",
                      "uuid": "00022-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "username",
                        "optional": true,
                      },
                      "name": "username",
                      "type": "string",
                      "uuid": "00023-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [
                        Object {
                          "children": Array [
                            Object {
                              "children": Array [
                                Object {
                                  "children": Array [],
                                  "description": Object {
                                    "name": "street",
                                    "optional": true,
                                  },
                                  "name": "street",
                                  "type": "string",
                                  "uuid": "00026-000",
                                  "value": Object {
                                    "format": undefined,
                                    "maxLength": undefined,
                                    "minLength": undefined,
                                    "pattern": undefined,
                                  },
                                },
                                Object {
                                  "children": Array [],
                                  "description": Object {
                                    "name": "city",
                                    "optional": true,
                                  },
                                  "name": "city",
                                  "type": "string",
                                  "uuid": "00027-000",
                                  "value": Object {
                                    "format": undefined,
                                    "maxLength": undefined,
                                    "minLength": undefined,
                                    "pattern": undefined,
                                  },
                                },
                                Object {
                                  "children": Array [],
                                  "description": Object {
                                    "name": "state",
                                    "optional": true,
                                  },
                                  "name": "state",
                                  "type": "string",
                                  "uuid": "00028-000",
                                  "value": Object {
                                    "format": undefined,
                                    "maxLength": undefined,
                                    "minLength": undefined,
                                    "pattern": undefined,
                                  },
                                },
                                Object {
                                  "children": Array [],
                                  "description": Object {
                                    "name": "zip",
                                    "optional": true,
                                  },
                                  "name": "zip",
                                  "type": "string",
                                  "uuid": "00029-000",
                                  "value": Object {
                                    "format": undefined,
                                    "maxLength": undefined,
                                    "minLength": undefined,
                                    "pattern": undefined,
                                  },
                                },
                              ],
                              "description": Object {
                                "name": "Address",
                              },
                              "name": "Address",
                              "type": "object",
                              "uuid": "00030-000",
                              "value": Object {},
                            },
                          ],
                          "description": Object {
                            "name": undefined,
                          },
                          "name": "Address",
                          "type": "ref",
                          "uuid": "00016-000",
                          "value": Object {
                            "cache": Map {
                              "#/components/schemas/Address" => Promise {},
                            },
                            "exportAllSymbols": false,
                            "exportSymbol": false,
                            "metaSchemas": Object {},
                            "references": Map {
                              "#/components/schemas/Address" => Array [
                                "Address",
                                [Function],
                              ],
                            },
                            "root": Object {
                              "components": Object {
                                "requestBodies": Object {
                                  "Pet": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                    },
                                    "description": "Pet object that needs to be added to the store",
                                  },
                                  "UserArray": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "items": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                          "type": "array",
                                        },
                                      },
                                    },
                                    "description": "List of user object",
                                  },
                                },
                                "schemas": Object {
                                  "Address": Object {
                                    "properties": Object {
                                      "city": Object {
                                        "example": "Palo Alto",
                                        "type": "string",
                                      },
                                      "state": Object {
                                        "example": "CA",
                                        "type": "string",
                                      },
                                      "street": Object {
                                        "example": "437 Lytton",
                                        "type": "string",
                                      },
                                      "zip": Object {
                                        "example": "94301",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "address",
                                    },
                                  },
                                  "ApiResponse": Object {
                                    "properties": Object {
                                      "code": Object {
                                        "format": "int32",
                                        "type": "integer",
                                      },
                                      "message": Object {
                                        "type": "string",
                                      },
                                      "type": Object {
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "##default",
                                    },
                                  },
                                  "Category": Object {
                                    "properties": Object {
                                      "id": Object {
                                        "example": 1,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "name": Object {
                                        "example": "Dogs",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "category",
                                    },
                                  },
                                  "Customer": Object {
                                    "properties": Object {
                                      "address": Object {
                                        "items": Object {
                                          "$ref": "#/components/schemas/Address",
                                        },
                                        "type": "array",
                                        "xml": Object {
                                          "name": "addresses",
                                          "wrapped": true,
                                        },
                                      },
                                      "id": Object {
                                        "example": 100000,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "username": Object {
                                        "example": "fehguy",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "customer",
                                    },
                                  },
                                  "Order": Object {
                                    "properties": Object {
                                      "complete": Object {
                                        "type": "boolean",
                                      },
                                      "id": Object {
                                        "example": 10,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "petId": Object {
                                        "example": 198772,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "quantity": Object {
                                        "example": 7,
                                        "format": "int32",
                                        "type": "integer",
                                      },
                                      "shipDate": Object {
                                        "format": "date-time",
                                        "type": "string",
                                      },
                                      "status": Object {
                                        "description": "Order Status",
                                        "enum": Array [
                                          "placed",
                                          "approved",
                                          "delivered",
                                        ],
                                        "example": "approved",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "order",
                                    },
                                  },
                                  "Pet": Object {
                                    "properties": Object {
                                      "category": Object {
                                        "$ref": "#/components/schemas/Category",
                                      },
                                      "id": Object {
                                        "example": 10,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "name": Object {
                                        "example": "doggie",
                                        "type": "string",
                                      },
                                      "photoUrls": Object {
                                        "items": Object {
                                          "type": "string",
                                          "xml": Object {
                                            "name": "photoUrl",
                                          },
                                        },
                                        "type": "array",
                                        "xml": Object {
                                          "wrapped": true,
                                        },
                                      },
                                      "status": Object {
                                        "description": "pet status in the store",
                                        "enum": Array [
                                          "available",
                                          "pending",
                                          "sold",
                                        ],
                                        "type": "string",
                                      },
                                      "tags": Object {
                                        "items": Object {
                                          "$ref": "#/components/schemas/Tag",
                                        },
                                        "type": "array",
                                        "xml": Object {
                                          "wrapped": true,
                                        },
                                      },
                                    },
                                    "required": Array [
                                      "name",
                                      "photoUrls",
                                    ],
                                    "type": "object",
                                    "xml": Object {
                                      "name": "pet",
                                    },
                                  },
                                  "Tag": Object {
                                    "properties": Object {
                                      "id": Object {
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "name": Object {
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "tag",
                                    },
                                  },
                                  "User": Object {
                                    "properties": Object {
                                      "email": Object {
                                        "example": "john@email.com",
                                        "type": "string",
                                      },
                                      "firstName": Object {
                                        "example": "John",
                                        "type": "string",
                                      },
                                      "id": Object {
                                        "example": 10,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "lastName": Object {
                                        "example": "James",
                                        "type": "string",
                                      },
                                      "password": Object {
                                        "example": "12345",
                                        "type": "string",
                                      },
                                      "phone": Object {
                                        "example": "12345",
                                        "type": "string",
                                      },
                                      "userStatus": Object {
                                        "description": "User Status",
                                        "example": 1,
                                        "format": "int32",
                                        "type": "integer",
                                      },
                                      "username": Object {
                                        "example": "theUser",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "user",
                                    },
                                  },
                                },
                                "securitySchemes": Object {
                                  "api_key": Object {
                                    "in": "header",
                                    "name": "api_key",
                                    "type": "apiKey",
                                  },
                                  "petstore_auth": Object {
                                    "flows": Object {
                                      "implicit": Object {
                                        "authorizationUrl": "https://petstore3.swagger.io/oauth/authorize",
                                        "scopes": Object {
                                          "read:pets": "read your pets",
                                          "write:pets": "modify pets in your account",
                                        },
                                      },
                                    },
                                    "type": "oauth2",
                                  },
                                },
                              },
                              "externalDocs": Object {
                                "description": "Find out more about Swagger",
                                "url": "http://swagger.io",
                              },
                              "info": Object {
                                "contact": Object {
                                  "email": "apiteam@swagger.io",
                                },
                                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
            Swagger at [http://swagger.io](http://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
            You can now help us improve the API whether it's by making changes to the definition itself or to the code.
            That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

            Some useful links:
            - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
            - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                                "license": Object {
                                  "name": "Apache 2.0",
                                  "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                                },
                                "termsOfService": "http://swagger.io/terms/",
                                "title": "Swagger Petstore - OpenAPI 3.0",
                                "version": "1.0.14",
                              },
                              "openapi": "3.0.2",
                              "paths": Object {
                                "/pet": Object {
                                  "post": Object {
                                    "description": "Add a new pet to the store",
                                    "operationId": "addPet",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                      },
                                      "description": "Create a new pet in the store",
                                      "required": true,
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                        },
                                        "description": "Successful operation",
                                      },
                                      "405": Object {
                                        "description": "Invalid input",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Add a new pet to the store",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                  "put": Object {
                                    "description": "Update an existing pet by Id",
                                    "operationId": "updatePet",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                      },
                                      "description": "Update an existent pet in the store",
                                      "required": true,
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                        },
                                        "description": "Successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Pet not found",
                                      },
                                      "405": Object {
                                        "description": "Validation exception",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Update an existing pet",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/findByStatus": Object {
                                  "get": Object {
                                    "description": "Multiple status values can be provided with comma separated strings",
                                    "operationId": "findPetsByStatus",
                                    "parameters": Array [
                                      Object {
                                        "description": "Status values that need to be considered for filter",
                                        "explode": true,
                                        "in": "query",
                                        "name": "status",
                                        "required": false,
                                        "schema": Object {
                                          "default": "available",
                                          "enum": Array [
                                            "available",
                                            "pending",
                                            "sold",
                                          ],
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid status value",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Finds Pets by status",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/findByTags": Object {
                                  "get": Object {
                                    "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                                    "operationId": "findPetsByTags",
                                    "parameters": Array [
                                      Object {
                                        "description": "Tags to filter by",
                                        "explode": true,
                                        "in": "query",
                                        "name": "tags",
                                        "required": false,
                                        "schema": Object {
                                          "items": Object {
                                            "type": "string",
                                          },
                                          "type": "array",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid tag value",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Finds Pets by tags",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/{petId}": Object {
                                  "delete": Object {
                                    "description": "",
                                    "operationId": "deletePet",
                                    "parameters": Array [
                                      Object {
                                        "description": "",
                                        "in": "header",
                                        "name": "api_key",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      Object {
                                        "description": "Pet id to delete",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "400": Object {
                                        "description": "Invalid pet value",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Deletes a pet",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                  "get": Object {
                                    "description": "Returns a single pet",
                                    "operationId": "getPetById",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of pet to return",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Pet not found",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "api_key": Array [],
                                      },
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Find pet by ID",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                  "post": Object {
                                    "description": "",
                                    "operationId": "updatePetWithForm",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of pet that needs to be updated",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                      Object {
                                        "description": "Name of pet that needs to be updated",
                                        "in": "query",
                                        "name": "name",
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      Object {
                                        "description": "Status of pet that needs to be updated",
                                        "in": "query",
                                        "name": "status",
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "405": Object {
                                        "description": "Invalid input",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Updates a pet in the store with form data",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/{petId}/uploadImage": Object {
                                  "post": Object {
                                    "description": "",
                                    "operationId": "uploadFile",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of pet to update",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                      Object {
                                        "description": "Additional Metadata",
                                        "in": "query",
                                        "name": "additionalMetadata",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/octet-stream": Object {
                                          "schema": Object {
                                            "format": "binary",
                                            "type": "string",
                                          },
                                        },
                                      },
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/ApiResponse",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "uploads an image",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/store/inventory": Object {
                                  "get": Object {
                                    "description": "Returns a map of status codes to quantities",
                                    "operationId": "getInventory",
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "additionalProperties": Object {
                                                "format": "int32",
                                                "type": "integer",
                                              },
                                              "type": "object",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "api_key": Array [],
                                      },
                                    ],
                                    "summary": "Returns pet inventories by status",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                },
                                "/store/order": Object {
                                  "post": Object {
                                    "description": "Place a new order in the store",
                                    "operationId": "placeOrder",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Order",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Order",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Order",
                                          },
                                        },
                                      },
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Order",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "405": Object {
                                        "description": "Invalid input",
                                      },
                                    },
                                    "summary": "Place an order for a pet",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                },
                                "/store/order/{orderId}": Object {
                                  "delete": Object {
                                    "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                                    "operationId": "deleteOrder",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of the order that needs to be deleted",
                                        "in": "path",
                                        "name": "orderId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Order not found",
                                      },
                                    },
                                    "summary": "Delete purchase order by ID",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                  "get": Object {
                                    "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                                    "operationId": "getOrderById",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of order that needs to be fetched",
                                        "in": "path",
                                        "name": "orderId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Order",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Order",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Order not found",
                                      },
                                    },
                                    "summary": "Find purchase order by ID",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                },
                                "/user": Object {
                                  "post": Object {
                                    "description": "This can only be done by the logged in user.",
                                    "operationId": "createUser",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                      },
                                      "description": "Created user object",
                                    },
                                    "responses": Object {
                                      "default": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Create user",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/createWithList": Object {
                                  "post": Object {
                                    "description": "Creates list of users with given input array",
                                    "operationId": "createUsersWithListInput",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "items": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                            "type": "array",
                                          },
                                        },
                                      },
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                        },
                                        "description": "Successful operation",
                                      },
                                      "default": Object {
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Creates list of users with given input array",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/login": Object {
                                  "get": Object {
                                    "description": "",
                                    "operationId": "loginUser",
                                    "parameters": Array [
                                      Object {
                                        "description": "The user name for login",
                                        "in": "query",
                                        "name": "username",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      Object {
                                        "description": "The password for login in clear text",
                                        "in": "query",
                                        "name": "password",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "type": "string",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "type": "string",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                        "headers": Object {
                                          "X-Expires-After": Object {
                                            "description": "date in UTC when token expires",
                                            "schema": Object {
                                              "format": "date-time",
                                              "type": "string",
                                            },
                                          },
                                          "X-Rate-Limit": Object {
                                            "description": "calls per hour allowed by the user",
                                            "schema": Object {
                                              "format": "int32",
                                              "type": "integer",
                                            },
                                          },
                                        },
                                      },
                                      "400": Object {
                                        "description": "Invalid username/password supplied",
                                      },
                                    },
                                    "summary": "Logs user into the system",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/logout": Object {
                                  "get": Object {
                                    "description": "",
                                    "operationId": "logoutUser",
                                    "parameters": Array [],
                                    "responses": Object {
                                      "default": Object {
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Logs out current logged in user session",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/{username}": Object {
                                  "delete": Object {
                                    "description": "This can only be done by the logged in user.",
                                    "operationId": "deleteUser",
                                    "parameters": Array [
                                      Object {
                                        "description": "The name that needs to be deleted",
                                        "in": "path",
                                        "name": "username",
                                        "required": true,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "400": Object {
                                        "description": "Invalid username supplied",
                                      },
                                      "404": Object {
                                        "description": "User not found",
                                      },
                                    },
                                    "summary": "Delete user",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                  "get": Object {
                                    "description": "",
                                    "operationId": "getUserByName",
                                    "parameters": Array [
                                      Object {
                                        "description": "The name that needs to be fetched. Use user1 for testing. ",
                                        "in": "path",
                                        "name": "username",
                                        "required": true,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid username supplied",
                                      },
                                      "404": Object {
                                        "description": "User not found",
                                      },
                                    },
                                    "summary": "Get user by user name",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                  "put": Object {
                                    "description": "This can only be done by the logged in user.",
                                    "operationId": "updateUser",
                                    "parameters": Array [
                                      Object {
                                        "description": "name that need to be deleted",
                                        "in": "path",
                                        "name": "username",
                                        "required": true,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                      },
                                      "description": "Update an existent user in the store",
                                    },
                                    "responses": Object {
                                      "default": Object {
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Update user",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                              },
                              "servers": Array [
                                Object {
                                  "url": "/api/v3",
                                },
                              ],
                              "tags": Array [
                                Object {
                                  "description": "Everything about your Pets",
                                  "externalDocs": Object {
                                    "description": "Find out more",
                                    "url": "http://swagger.io",
                                  },
                                  "name": "pet",
                                },
                                Object {
                                  "description": "Access to Petstore orders",
                                  "externalDocs": Object {
                                    "description": "Find out more about our store",
                                    "url": "http://swagger.io",
                                  },
                                  "name": "store",
                                },
                                Object {
                                  "description": "Operations about user",
                                  "name": "user",
                                },
                              ],
                            },
                          },
                        },
                      ],
                      "description": Object {
                        "name": "address",
                        "optional": true,
                      },
                      "name": "address",
                      "type": "array",
                      "uuid": "00024-000",
                      "value": Object {
                        "maxItems": undefined,
                        "minItems": undefined,
                        "uniqueItems": undefined,
                      },
                    },
                  ],
                  "description": Object {},
                  "name": "Customer",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00025-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "street",
                        "optional": true,
                      },
                      "name": "street",
                      "type": "string",
                      "uuid": "00035-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "city",
                        "optional": true,
                      },
                      "name": "city",
                      "type": "string",
                      "uuid": "00036-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "state",
                        "optional": true,
                      },
                      "name": "state",
                      "type": "string",
                      "uuid": "00037-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "zip",
                        "optional": true,
                      },
                      "name": "zip",
                      "type": "string",
                      "uuid": "00038-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                  ],
                  "description": Object {},
                  "name": "Address",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00039-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "id",
                        "optional": true,
                      },
                      "name": "id",
                      "type": "integer",
                      "uuid": "00042-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "name",
                        "optional": true,
                      },
                      "name": "name",
                      "type": "string",
                      "uuid": "00043-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                  ],
                  "description": Object {},
                  "name": "Category",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00044-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "id",
                        "optional": true,
                      },
                      "name": "id",
                      "type": "integer",
                      "uuid": "00053-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "username",
                        "optional": true,
                      },
                      "name": "username",
                      "type": "string",
                      "uuid": "00054-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "firstName",
                        "optional": true,
                      },
                      "name": "firstName",
                      "type": "string",
                      "uuid": "00055-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "lastName",
                        "optional": true,
                      },
                      "name": "lastName",
                      "type": "string",
                      "uuid": "00056-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "email",
                        "optional": true,
                      },
                      "name": "email",
                      "type": "string",
                      "uuid": "00057-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "password",
                        "optional": true,
                      },
                      "name": "password",
                      "type": "string",
                      "uuid": "00058-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "phone",
                        "optional": true,
                      },
                      "name": "phone",
                      "type": "string",
                      "uuid": "00059-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "description": "User Status",
                        "name": "userStatus",
                        "optional": true,
                      },
                      "name": "userStatus",
                      "type": "integer",
                      "uuid": "00060-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                  ],
                  "description": Object {},
                  "name": "User",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00061-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "id",
                        "optional": true,
                      },
                      "name": "id",
                      "type": "integer",
                      "uuid": "00064-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "name",
                        "optional": true,
                      },
                      "name": "name",
                      "type": "string",
                      "uuid": "00065-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                  ],
                  "description": Object {},
                  "name": "Tag",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00066-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "id",
                        "optional": true,
                      },
                      "name": "id",
                      "type": "integer",
                      "uuid": "00085-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "name",
                      },
                      "name": "name",
                      "type": "string",
                      "uuid": "00068-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [
                        Object {
                          "children": Array [
                            Object {
                              "children": Array [],
                              "description": Object {
                                "name": "id",
                                "optional": true,
                              },
                              "name": "id",
                              "type": "integer",
                              "uuid": "00079-000",
                              "value": Object {
                                "maximum": undefined,
                                "minimum": undefined,
                                "multipleOf": undefined,
                              },
                            },
                            Object {
                              "children": Array [],
                              "description": Object {
                                "name": "name",
                                "optional": true,
                              },
                              "name": "name",
                              "type": "string",
                              "uuid": "00080-000",
                              "value": Object {
                                "format": undefined,
                                "maxLength": undefined,
                                "minLength": undefined,
                                "pattern": undefined,
                              },
                            },
                          ],
                          "description": Object {
                            "name": "Category",
                          },
                          "name": "Category",
                          "type": "object",
                          "uuid": "00081-000",
                          "value": Object {},
                        },
                      ],
                      "description": Object {
                        "name": "category",
                        "optional": true,
                      },
                      "name": "category",
                      "type": "ref",
                      "uuid": "00086-000",
                      "value": Object {
                        "cache": Map {
                          "#/components/schemas/Category" => Promise {},
                          "#/components/schemas/Tag" => Promise {},
                        },
                        "exportAllSymbols": false,
                        "exportSymbol": false,
                        "metaSchemas": Object {},
                        "references": Map {
                          "#/components/schemas/Category" => Array [
                            "Category",
                            [Function],
                          ],
                          "#/components/schemas/Tag" => Array [
                            "Tag",
                            [Function],
                          ],
                        },
                        "root": Object {
                          "components": Object {
                            "requestBodies": Object {
                              "Pet": Object {
                                "content": Object {
                                  "application/json": Object {
                                    "schema": Object {
                                      "$ref": "#/components/schemas/Pet",
                                    },
                                  },
                                  "application/xml": Object {
                                    "schema": Object {
                                      "$ref": "#/components/schemas/Pet",
                                    },
                                  },
                                },
                                "description": "Pet object that needs to be added to the store",
                              },
                              "UserArray": Object {
                                "content": Object {
                                  "application/json": Object {
                                    "schema": Object {
                                      "items": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                      "type": "array",
                                    },
                                  },
                                },
                                "description": "List of user object",
                              },
                            },
                            "schemas": Object {
                              "Address": Object {
                                "properties": Object {
                                  "city": Object {
                                    "example": "Palo Alto",
                                    "type": "string",
                                  },
                                  "state": Object {
                                    "example": "CA",
                                    "type": "string",
                                  },
                                  "street": Object {
                                    "example": "437 Lytton",
                                    "type": "string",
                                  },
                                  "zip": Object {
                                    "example": "94301",
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "address",
                                },
                              },
                              "ApiResponse": Object {
                                "properties": Object {
                                  "code": Object {
                                    "format": "int32",
                                    "type": "integer",
                                  },
                                  "message": Object {
                                    "type": "string",
                                  },
                                  "type": Object {
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "##default",
                                },
                              },
                              "Category": Object {
                                "properties": Object {
                                  "id": Object {
                                    "example": 1,
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "name": Object {
                                    "example": "Dogs",
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "category",
                                },
                              },
                              "Customer": Object {
                                "properties": Object {
                                  "address": Object {
                                    "items": Object {
                                      "$ref": "#/components/schemas/Address",
                                    },
                                    "type": "array",
                                    "xml": Object {
                                      "name": "addresses",
                                      "wrapped": true,
                                    },
                                  },
                                  "id": Object {
                                    "example": 100000,
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "username": Object {
                                    "example": "fehguy",
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "customer",
                                },
                              },
                              "Order": Object {
                                "properties": Object {
                                  "complete": Object {
                                    "type": "boolean",
                                  },
                                  "id": Object {
                                    "example": 10,
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "petId": Object {
                                    "example": 198772,
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "quantity": Object {
                                    "example": 7,
                                    "format": "int32",
                                    "type": "integer",
                                  },
                                  "shipDate": Object {
                                    "format": "date-time",
                                    "type": "string",
                                  },
                                  "status": Object {
                                    "description": "Order Status",
                                    "enum": Array [
                                      "placed",
                                      "approved",
                                      "delivered",
                                    ],
                                    "example": "approved",
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "order",
                                },
                              },
                              "Pet": Object {
                                "properties": Object {
                                  "category": Object {
                                    "$ref": "#/components/schemas/Category",
                                  },
                                  "id": Object {
                                    "example": 10,
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "name": Object {
                                    "example": "doggie",
                                    "type": "string",
                                  },
                                  "photoUrls": Object {
                                    "items": Object {
                                      "type": "string",
                                      "xml": Object {
                                        "name": "photoUrl",
                                      },
                                    },
                                    "type": "array",
                                    "xml": Object {
                                      "wrapped": true,
                                    },
                                  },
                                  "status": Object {
                                    "description": "pet status in the store",
                                    "enum": Array [
                                      "available",
                                      "pending",
                                      "sold",
                                    ],
                                    "type": "string",
                                  },
                                  "tags": Object {
                                    "items": Object {
                                      "$ref": "#/components/schemas/Tag",
                                    },
                                    "type": "array",
                                    "xml": Object {
                                      "wrapped": true,
                                    },
                                  },
                                },
                                "required": Array [
                                  "name",
                                  "photoUrls",
                                ],
                                "type": "object",
                                "xml": Object {
                                  "name": "pet",
                                },
                              },
                              "Tag": Object {
                                "properties": Object {
                                  "id": Object {
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "name": Object {
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "tag",
                                },
                              },
                              "User": Object {
                                "properties": Object {
                                  "email": Object {
                                    "example": "john@email.com",
                                    "type": "string",
                                  },
                                  "firstName": Object {
                                    "example": "John",
                                    "type": "string",
                                  },
                                  "id": Object {
                                    "example": 10,
                                    "format": "int64",
                                    "type": "integer",
                                  },
                                  "lastName": Object {
                                    "example": "James",
                                    "type": "string",
                                  },
                                  "password": Object {
                                    "example": "12345",
                                    "type": "string",
                                  },
                                  "phone": Object {
                                    "example": "12345",
                                    "type": "string",
                                  },
                                  "userStatus": Object {
                                    "description": "User Status",
                                    "example": 1,
                                    "format": "int32",
                                    "type": "integer",
                                  },
                                  "username": Object {
                                    "example": "theUser",
                                    "type": "string",
                                  },
                                },
                                "type": "object",
                                "xml": Object {
                                  "name": "user",
                                },
                              },
                            },
                            "securitySchemes": Object {
                              "api_key": Object {
                                "in": "header",
                                "name": "api_key",
                                "type": "apiKey",
                              },
                              "petstore_auth": Object {
                                "flows": Object {
                                  "implicit": Object {
                                    "authorizationUrl": "https://petstore3.swagger.io/oauth/authorize",
                                    "scopes": Object {
                                      "read:pets": "read your pets",
                                      "write:pets": "modify pets in your account",
                                    },
                                  },
                                },
                                "type": "oauth2",
                              },
                            },
                          },
                          "externalDocs": Object {
                            "description": "Find out more about Swagger",
                            "url": "http://swagger.io",
                          },
                          "info": Object {
                            "contact": Object {
                              "email": "apiteam@swagger.io",
                            },
                            "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
            Swagger at [http://swagger.io](http://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
            You can now help us improve the API whether it's by making changes to the definition itself or to the code.
            That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

            Some useful links:
            - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
            - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                            "license": Object {
                              "name": "Apache 2.0",
                              "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                            },
                            "termsOfService": "http://swagger.io/terms/",
                            "title": "Swagger Petstore - OpenAPI 3.0",
                            "version": "1.0.14",
                          },
                          "openapi": "3.0.2",
                          "paths": Object {
                            "/pet": Object {
                              "post": Object {
                                "description": "Add a new pet to the store",
                                "operationId": "addPet",
                                "requestBody": Object {
                                  "content": Object {
                                    "application/json": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Pet",
                                      },
                                    },
                                    "application/x-www-form-urlencoded": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Pet",
                                      },
                                    },
                                    "application/xml": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Pet",
                                      },
                                    },
                                  },
                                  "description": "Create a new pet in the store",
                                  "required": true,
                                },
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                    },
                                    "description": "Successful operation",
                                  },
                                  "405": Object {
                                    "description": "Invalid input",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Add a new pet to the store",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                              "put": Object {
                                "description": "Update an existing pet by Id",
                                "operationId": "updatePet",
                                "requestBody": Object {
                                  "content": Object {
                                    "application/json": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Pet",
                                      },
                                    },
                                    "application/x-www-form-urlencoded": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Pet",
                                      },
                                    },
                                    "application/xml": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Pet",
                                      },
                                    },
                                  },
                                  "description": "Update an existent pet in the store",
                                  "required": true,
                                },
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                    },
                                    "description": "Successful operation",
                                  },
                                  "400": Object {
                                    "description": "Invalid ID supplied",
                                  },
                                  "404": Object {
                                    "description": "Pet not found",
                                  },
                                  "405": Object {
                                    "description": "Validation exception",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Update an existing pet",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                            },
                            "/pet/findByStatus": Object {
                              "get": Object {
                                "description": "Multiple status values can be provided with comma separated strings",
                                "operationId": "findPetsByStatus",
                                "parameters": Array [
                                  Object {
                                    "description": "Status values that need to be considered for filter",
                                    "explode": true,
                                    "in": "query",
                                    "name": "status",
                                    "required": false,
                                    "schema": Object {
                                      "default": "available",
                                      "enum": Array [
                                        "available",
                                        "pending",
                                        "sold",
                                      ],
                                      "type": "string",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "items": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                          "type": "array",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "items": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                          "type": "array",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                  "400": Object {
                                    "description": "Invalid status value",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Finds Pets by status",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                            },
                            "/pet/findByTags": Object {
                              "get": Object {
                                "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                                "operationId": "findPetsByTags",
                                "parameters": Array [
                                  Object {
                                    "description": "Tags to filter by",
                                    "explode": true,
                                    "in": "query",
                                    "name": "tags",
                                    "required": false,
                                    "schema": Object {
                                      "items": Object {
                                        "type": "string",
                                      },
                                      "type": "array",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "items": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                          "type": "array",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "items": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                          "type": "array",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                  "400": Object {
                                    "description": "Invalid tag value",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Finds Pets by tags",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                            },
                            "/pet/{petId}": Object {
                              "delete": Object {
                                "description": "",
                                "operationId": "deletePet",
                                "parameters": Array [
                                  Object {
                                    "description": "",
                                    "in": "header",
                                    "name": "api_key",
                                    "required": false,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                  Object {
                                    "description": "Pet id to delete",
                                    "in": "path",
                                    "name": "petId",
                                    "required": true,
                                    "schema": Object {
                                      "format": "int64",
                                      "type": "integer",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "400": Object {
                                    "description": "Invalid pet value",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Deletes a pet",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                              "get": Object {
                                "description": "Returns a single pet",
                                "operationId": "getPetById",
                                "parameters": Array [
                                  Object {
                                    "description": "ID of pet to return",
                                    "in": "path",
                                    "name": "petId",
                                    "required": true,
                                    "schema": Object {
                                      "format": "int64",
                                      "type": "integer",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                  "400": Object {
                                    "description": "Invalid ID supplied",
                                  },
                                  "404": Object {
                                    "description": "Pet not found",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "api_key": Array [],
                                  },
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Find pet by ID",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                              "post": Object {
                                "description": "",
                                "operationId": "updatePetWithForm",
                                "parameters": Array [
                                  Object {
                                    "description": "ID of pet that needs to be updated",
                                    "in": "path",
                                    "name": "petId",
                                    "required": true,
                                    "schema": Object {
                                      "format": "int64",
                                      "type": "integer",
                                    },
                                  },
                                  Object {
                                    "description": "Name of pet that needs to be updated",
                                    "in": "query",
                                    "name": "name",
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                  Object {
                                    "description": "Status of pet that needs to be updated",
                                    "in": "query",
                                    "name": "status",
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "405": Object {
                                    "description": "Invalid input",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "Updates a pet in the store with form data",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                            },
                            "/pet/{petId}/uploadImage": Object {
                              "post": Object {
                                "description": "",
                                "operationId": "uploadFile",
                                "parameters": Array [
                                  Object {
                                    "description": "ID of pet to update",
                                    "in": "path",
                                    "name": "petId",
                                    "required": true,
                                    "schema": Object {
                                      "format": "int64",
                                      "type": "integer",
                                    },
                                  },
                                  Object {
                                    "description": "Additional Metadata",
                                    "in": "query",
                                    "name": "additionalMetadata",
                                    "required": false,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                ],
                                "requestBody": Object {
                                  "content": Object {
                                    "application/octet-stream": Object {
                                      "schema": Object {
                                        "format": "binary",
                                        "type": "string",
                                      },
                                    },
                                  },
                                },
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/ApiResponse",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "petstore_auth": Array [
                                      "write:pets",
                                      "read:pets",
                                    ],
                                  },
                                ],
                                "summary": "uploads an image",
                                "tags": Array [
                                  "pet",
                                ],
                              },
                            },
                            "/store/inventory": Object {
                              "get": Object {
                                "description": "Returns a map of status codes to quantities",
                                "operationId": "getInventory",
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "additionalProperties": Object {
                                            "format": "int32",
                                            "type": "integer",
                                          },
                                          "type": "object",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                },
                                "security": Array [
                                  Object {
                                    "api_key": Array [],
                                  },
                                ],
                                "summary": "Returns pet inventories by status",
                                "tags": Array [
                                  "store",
                                ],
                              },
                            },
                            "/store/order": Object {
                              "post": Object {
                                "description": "Place a new order in the store",
                                "operationId": "placeOrder",
                                "requestBody": Object {
                                  "content": Object {
                                    "application/json": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Order",
                                      },
                                    },
                                    "application/x-www-form-urlencoded": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Order",
                                      },
                                    },
                                    "application/xml": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/Order",
                                      },
                                    },
                                  },
                                },
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Order",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                  "405": Object {
                                    "description": "Invalid input",
                                  },
                                },
                                "summary": "Place an order for a pet",
                                "tags": Array [
                                  "store",
                                ],
                              },
                            },
                            "/store/order/{orderId}": Object {
                              "delete": Object {
                                "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                                "operationId": "deleteOrder",
                                "parameters": Array [
                                  Object {
                                    "description": "ID of the order that needs to be deleted",
                                    "in": "path",
                                    "name": "orderId",
                                    "required": true,
                                    "schema": Object {
                                      "format": "int64",
                                      "type": "integer",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "400": Object {
                                    "description": "Invalid ID supplied",
                                  },
                                  "404": Object {
                                    "description": "Order not found",
                                  },
                                },
                                "summary": "Delete purchase order by ID",
                                "tags": Array [
                                  "store",
                                ],
                              },
                              "get": Object {
                                "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                                "operationId": "getOrderById",
                                "parameters": Array [
                                  Object {
                                    "description": "ID of order that needs to be fetched",
                                    "in": "path",
                                    "name": "orderId",
                                    "required": true,
                                    "schema": Object {
                                      "format": "int64",
                                      "type": "integer",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Order",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Order",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                  "400": Object {
                                    "description": "Invalid ID supplied",
                                  },
                                  "404": Object {
                                    "description": "Order not found",
                                  },
                                },
                                "summary": "Find purchase order by ID",
                                "tags": Array [
                                  "store",
                                ],
                              },
                            },
                            "/user": Object {
                              "post": Object {
                                "description": "This can only be done by the logged in user.",
                                "operationId": "createUser",
                                "requestBody": Object {
                                  "content": Object {
                                    "application/json": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                    },
                                    "application/x-www-form-urlencoded": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                    },
                                    "application/xml": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                    },
                                  },
                                  "description": "Created user object",
                                },
                                "responses": Object {
                                  "default": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                },
                                "summary": "Create user",
                                "tags": Array [
                                  "user",
                                ],
                              },
                            },
                            "/user/createWithList": Object {
                              "post": Object {
                                "description": "Creates list of users with given input array",
                                "operationId": "createUsersWithListInput",
                                "requestBody": Object {
                                  "content": Object {
                                    "application/json": Object {
                                      "schema": Object {
                                        "items": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                        "type": "array",
                                      },
                                    },
                                  },
                                },
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                      },
                                    },
                                    "description": "Successful operation",
                                  },
                                  "default": Object {
                                    "description": "successful operation",
                                  },
                                },
                                "summary": "Creates list of users with given input array",
                                "tags": Array [
                                  "user",
                                ],
                              },
                            },
                            "/user/login": Object {
                              "get": Object {
                                "description": "",
                                "operationId": "loginUser",
                                "parameters": Array [
                                  Object {
                                    "description": "The user name for login",
                                    "in": "query",
                                    "name": "username",
                                    "required": false,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                  Object {
                                    "description": "The password for login in clear text",
                                    "in": "query",
                                    "name": "password",
                                    "required": false,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                    "headers": Object {
                                      "X-Expires-After": Object {
                                        "description": "date in UTC when token expires",
                                        "schema": Object {
                                          "format": "date-time",
                                          "type": "string",
                                        },
                                      },
                                      "X-Rate-Limit": Object {
                                        "description": "calls per hour allowed by the user",
                                        "schema": Object {
                                          "format": "int32",
                                          "type": "integer",
                                        },
                                      },
                                    },
                                  },
                                  "400": Object {
                                    "description": "Invalid username/password supplied",
                                  },
                                },
                                "summary": "Logs user into the system",
                                "tags": Array [
                                  "user",
                                ],
                              },
                            },
                            "/user/logout": Object {
                              "get": Object {
                                "description": "",
                                "operationId": "logoutUser",
                                "parameters": Array [],
                                "responses": Object {
                                  "default": Object {
                                    "description": "successful operation",
                                  },
                                },
                                "summary": "Logs out current logged in user session",
                                "tags": Array [
                                  "user",
                                ],
                              },
                            },
                            "/user/{username}": Object {
                              "delete": Object {
                                "description": "This can only be done by the logged in user.",
                                "operationId": "deleteUser",
                                "parameters": Array [
                                  Object {
                                    "description": "The name that needs to be deleted",
                                    "in": "path",
                                    "name": "username",
                                    "required": true,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "400": Object {
                                    "description": "Invalid username supplied",
                                  },
                                  "404": Object {
                                    "description": "User not found",
                                  },
                                },
                                "summary": "Delete user",
                                "tags": Array [
                                  "user",
                                ],
                              },
                              "get": Object {
                                "description": "",
                                "operationId": "getUserByName",
                                "parameters": Array [
                                  Object {
                                    "description": "The name that needs to be fetched. Use user1 for testing. ",
                                    "in": "path",
                                    "name": "username",
                                    "required": true,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                ],
                                "responses": Object {
                                  "200": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/User",
                                        },
                                      },
                                    },
                                    "description": "successful operation",
                                  },
                                  "400": Object {
                                    "description": "Invalid username supplied",
                                  },
                                  "404": Object {
                                    "description": "User not found",
                                  },
                                },
                                "summary": "Get user by user name",
                                "tags": Array [
                                  "user",
                                ],
                              },
                              "put": Object {
                                "description": "This can only be done by the logged in user.",
                                "operationId": "updateUser",
                                "parameters": Array [
                                  Object {
                                    "description": "name that need to be deleted",
                                    "in": "path",
                                    "name": "username",
                                    "required": true,
                                    "schema": Object {
                                      "type": "string",
                                    },
                                  },
                                ],
                                "requestBody": Object {
                                  "content": Object {
                                    "application/json": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                    },
                                    "application/x-www-form-urlencoded": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                    },
                                    "application/xml": Object {
                                      "schema": Object {
                                        "$ref": "#/components/schemas/User",
                                      },
                                    },
                                  },
                                  "description": "Update an existent user in the store",
                                },
                                "responses": Object {
                                  "default": Object {
                                    "description": "successful operation",
                                  },
                                },
                                "summary": "Update user",
                                "tags": Array [
                                  "user",
                                ],
                              },
                            },
                          },
                          "servers": Array [
                            Object {
                              "url": "/api/v3",
                            },
                          ],
                          "tags": Array [
                            Object {
                              "description": "Everything about your Pets",
                              "externalDocs": Object {
                                "description": "Find out more",
                                "url": "http://swagger.io",
                              },
                              "name": "pet",
                            },
                            Object {
                              "description": "Access to Petstore orders",
                              "externalDocs": Object {
                                "description": "Find out more about our store",
                                "url": "http://swagger.io",
                              },
                              "name": "store",
                            },
                            Object {
                              "description": "Operations about user",
                              "name": "user",
                            },
                          ],
                        },
                      },
                    },
                    Object {
                      "children": Array [
                        Object {
                          "children": Array [],
                          "description": Object {},
                          "type": "string",
                          "uuid": "00069-000",
                          "value": Object {
                            "format": undefined,
                            "maxLength": undefined,
                            "minLength": undefined,
                            "pattern": undefined,
                          },
                        },
                      ],
                      "description": Object {
                        "name": "photoUrls",
                      },
                      "name": "photoUrls",
                      "type": "array",
                      "uuid": "00072-000",
                      "value": Object {
                        "maxItems": undefined,
                        "minItems": undefined,
                        "uniqueItems": undefined,
                      },
                    },
                    Object {
                      "children": Array [
                        Object {
                          "children": Array [
                            Object {
                              "children": Array [
                                Object {
                                  "children": Array [],
                                  "description": Object {
                                    "name": "id",
                                    "optional": true,
                                  },
                                  "name": "id",
                                  "type": "integer",
                                  "uuid": "00082-000",
                                  "value": Object {
                                    "maximum": undefined,
                                    "minimum": undefined,
                                    "multipleOf": undefined,
                                  },
                                },
                                Object {
                                  "children": Array [],
                                  "description": Object {
                                    "name": "name",
                                    "optional": true,
                                  },
                                  "name": "name",
                                  "type": "string",
                                  "uuid": "00083-000",
                                  "value": Object {
                                    "format": undefined,
                                    "maxLength": undefined,
                                    "minLength": undefined,
                                    "pattern": undefined,
                                  },
                                },
                              ],
                              "description": Object {
                                "name": "Tag",
                              },
                              "name": "Tag",
                              "type": "object",
                              "uuid": "00084-000",
                              "value": Object {},
                            },
                          ],
                          "description": Object {
                            "name": undefined,
                          },
                          "name": "Tag",
                          "type": "ref",
                          "uuid": "00073-000",
                          "value": Object {
                            "cache": Map {
                              "#/components/schemas/Category" => Promise {},
                              "#/components/schemas/Tag" => Promise {},
                            },
                            "exportAllSymbols": false,
                            "exportSymbol": false,
                            "metaSchemas": Object {},
                            "references": Map {
                              "#/components/schemas/Category" => Array [
                                "Category",
                                [Function],
                              ],
                              "#/components/schemas/Tag" => Array [
                                "Tag",
                                [Function],
                              ],
                            },
                            "root": Object {
                              "components": Object {
                                "requestBodies": Object {
                                  "Pet": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                      "application/xml": Object {
                                        "schema": Object {
                                          "$ref": "#/components/schemas/Pet",
                                        },
                                      },
                                    },
                                    "description": "Pet object that needs to be added to the store",
                                  },
                                  "UserArray": Object {
                                    "content": Object {
                                      "application/json": Object {
                                        "schema": Object {
                                          "items": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                          "type": "array",
                                        },
                                      },
                                    },
                                    "description": "List of user object",
                                  },
                                },
                                "schemas": Object {
                                  "Address": Object {
                                    "properties": Object {
                                      "city": Object {
                                        "example": "Palo Alto",
                                        "type": "string",
                                      },
                                      "state": Object {
                                        "example": "CA",
                                        "type": "string",
                                      },
                                      "street": Object {
                                        "example": "437 Lytton",
                                        "type": "string",
                                      },
                                      "zip": Object {
                                        "example": "94301",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "address",
                                    },
                                  },
                                  "ApiResponse": Object {
                                    "properties": Object {
                                      "code": Object {
                                        "format": "int32",
                                        "type": "integer",
                                      },
                                      "message": Object {
                                        "type": "string",
                                      },
                                      "type": Object {
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "##default",
                                    },
                                  },
                                  "Category": Object {
                                    "properties": Object {
                                      "id": Object {
                                        "example": 1,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "name": Object {
                                        "example": "Dogs",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "category",
                                    },
                                  },
                                  "Customer": Object {
                                    "properties": Object {
                                      "address": Object {
                                        "items": Object {
                                          "$ref": "#/components/schemas/Address",
                                        },
                                        "type": "array",
                                        "xml": Object {
                                          "name": "addresses",
                                          "wrapped": true,
                                        },
                                      },
                                      "id": Object {
                                        "example": 100000,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "username": Object {
                                        "example": "fehguy",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "customer",
                                    },
                                  },
                                  "Order": Object {
                                    "properties": Object {
                                      "complete": Object {
                                        "type": "boolean",
                                      },
                                      "id": Object {
                                        "example": 10,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "petId": Object {
                                        "example": 198772,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "quantity": Object {
                                        "example": 7,
                                        "format": "int32",
                                        "type": "integer",
                                      },
                                      "shipDate": Object {
                                        "format": "date-time",
                                        "type": "string",
                                      },
                                      "status": Object {
                                        "description": "Order Status",
                                        "enum": Array [
                                          "placed",
                                          "approved",
                                          "delivered",
                                        ],
                                        "example": "approved",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "order",
                                    },
                                  },
                                  "Pet": Object {
                                    "properties": Object {
                                      "category": Object {
                                        "$ref": "#/components/schemas/Category",
                                      },
                                      "id": Object {
                                        "example": 10,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "name": Object {
                                        "example": "doggie",
                                        "type": "string",
                                      },
                                      "photoUrls": Object {
                                        "items": Object {
                                          "type": "string",
                                          "xml": Object {
                                            "name": "photoUrl",
                                          },
                                        },
                                        "type": "array",
                                        "xml": Object {
                                          "wrapped": true,
                                        },
                                      },
                                      "status": Object {
                                        "description": "pet status in the store",
                                        "enum": Array [
                                          "available",
                                          "pending",
                                          "sold",
                                        ],
                                        "type": "string",
                                      },
                                      "tags": Object {
                                        "items": Object {
                                          "$ref": "#/components/schemas/Tag",
                                        },
                                        "type": "array",
                                        "xml": Object {
                                          "wrapped": true,
                                        },
                                      },
                                    },
                                    "required": Array [
                                      "name",
                                      "photoUrls",
                                    ],
                                    "type": "object",
                                    "xml": Object {
                                      "name": "pet",
                                    },
                                  },
                                  "Tag": Object {
                                    "properties": Object {
                                      "id": Object {
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "name": Object {
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "tag",
                                    },
                                  },
                                  "User": Object {
                                    "properties": Object {
                                      "email": Object {
                                        "example": "john@email.com",
                                        "type": "string",
                                      },
                                      "firstName": Object {
                                        "example": "John",
                                        "type": "string",
                                      },
                                      "id": Object {
                                        "example": 10,
                                        "format": "int64",
                                        "type": "integer",
                                      },
                                      "lastName": Object {
                                        "example": "James",
                                        "type": "string",
                                      },
                                      "password": Object {
                                        "example": "12345",
                                        "type": "string",
                                      },
                                      "phone": Object {
                                        "example": "12345",
                                        "type": "string",
                                      },
                                      "userStatus": Object {
                                        "description": "User Status",
                                        "example": 1,
                                        "format": "int32",
                                        "type": "integer",
                                      },
                                      "username": Object {
                                        "example": "theUser",
                                        "type": "string",
                                      },
                                    },
                                    "type": "object",
                                    "xml": Object {
                                      "name": "user",
                                    },
                                  },
                                },
                                "securitySchemes": Object {
                                  "api_key": Object {
                                    "in": "header",
                                    "name": "api_key",
                                    "type": "apiKey",
                                  },
                                  "petstore_auth": Object {
                                    "flows": Object {
                                      "implicit": Object {
                                        "authorizationUrl": "https://petstore3.swagger.io/oauth/authorize",
                                        "scopes": Object {
                                          "read:pets": "read your pets",
                                          "write:pets": "modify pets in your account",
                                        },
                                      },
                                    },
                                    "type": "oauth2",
                                  },
                                },
                              },
                              "externalDocs": Object {
                                "description": "Find out more about Swagger",
                                "url": "http://swagger.io",
                              },
                              "info": Object {
                                "contact": Object {
                                  "email": "apiteam@swagger.io",
                                },
                                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
            Swagger at [http://swagger.io](http://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
            You can now help us improve the API whether it's by making changes to the definition itself or to the code.
            That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

            Some useful links:
            - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
            - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                                "license": Object {
                                  "name": "Apache 2.0",
                                  "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                                },
                                "termsOfService": "http://swagger.io/terms/",
                                "title": "Swagger Petstore - OpenAPI 3.0",
                                "version": "1.0.14",
                              },
                              "openapi": "3.0.2",
                              "paths": Object {
                                "/pet": Object {
                                  "post": Object {
                                    "description": "Add a new pet to the store",
                                    "operationId": "addPet",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                      },
                                      "description": "Create a new pet in the store",
                                      "required": true,
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                        },
                                        "description": "Successful operation",
                                      },
                                      "405": Object {
                                        "description": "Invalid input",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Add a new pet to the store",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                  "put": Object {
                                    "description": "Update an existing pet by Id",
                                    "operationId": "updatePet",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Pet",
                                          },
                                        },
                                      },
                                      "description": "Update an existent pet in the store",
                                      "required": true,
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                        },
                                        "description": "Successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Pet not found",
                                      },
                                      "405": Object {
                                        "description": "Validation exception",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Update an existing pet",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/findByStatus": Object {
                                  "get": Object {
                                    "description": "Multiple status values can be provided with comma separated strings",
                                    "operationId": "findPetsByStatus",
                                    "parameters": Array [
                                      Object {
                                        "description": "Status values that need to be considered for filter",
                                        "explode": true,
                                        "in": "query",
                                        "name": "status",
                                        "required": false,
                                        "schema": Object {
                                          "default": "available",
                                          "enum": Array [
                                            "available",
                                            "pending",
                                            "sold",
                                          ],
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid status value",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Finds Pets by status",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/findByTags": Object {
                                  "get": Object {
                                    "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                                    "operationId": "findPetsByTags",
                                    "parameters": Array [
                                      Object {
                                        "description": "Tags to filter by",
                                        "explode": true,
                                        "in": "query",
                                        "name": "tags",
                                        "required": false,
                                        "schema": Object {
                                          "items": Object {
                                            "type": "string",
                                          },
                                          "type": "array",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "items": Object {
                                                "$ref": "#/components/schemas/Pet",
                                              },
                                              "type": "array",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid tag value",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Finds Pets by tags",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/{petId}": Object {
                                  "delete": Object {
                                    "description": "",
                                    "operationId": "deletePet",
                                    "parameters": Array [
                                      Object {
                                        "description": "",
                                        "in": "header",
                                        "name": "api_key",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      Object {
                                        "description": "Pet id to delete",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "400": Object {
                                        "description": "Invalid pet value",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Deletes a pet",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                  "get": Object {
                                    "description": "Returns a single pet",
                                    "operationId": "getPetById",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of pet to return",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Pet",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Pet not found",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "api_key": Array [],
                                      },
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Find pet by ID",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                  "post": Object {
                                    "description": "",
                                    "operationId": "updatePetWithForm",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of pet that needs to be updated",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                      Object {
                                        "description": "Name of pet that needs to be updated",
                                        "in": "query",
                                        "name": "name",
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      Object {
                                        "description": "Status of pet that needs to be updated",
                                        "in": "query",
                                        "name": "status",
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "405": Object {
                                        "description": "Invalid input",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "Updates a pet in the store with form data",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/pet/{petId}/uploadImage": Object {
                                  "post": Object {
                                    "description": "",
                                    "operationId": "uploadFile",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of pet to update",
                                        "in": "path",
                                        "name": "petId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                      Object {
                                        "description": "Additional Metadata",
                                        "in": "query",
                                        "name": "additionalMetadata",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/octet-stream": Object {
                                          "schema": Object {
                                            "format": "binary",
                                            "type": "string",
                                          },
                                        },
                                      },
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/ApiResponse",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "petstore_auth": Array [
                                          "write:pets",
                                          "read:pets",
                                        ],
                                      },
                                    ],
                                    "summary": "uploads an image",
                                    "tags": Array [
                                      "pet",
                                    ],
                                  },
                                },
                                "/store/inventory": Object {
                                  "get": Object {
                                    "description": "Returns a map of status codes to quantities",
                                    "operationId": "getInventory",
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "additionalProperties": Object {
                                                "format": "int32",
                                                "type": "integer",
                                              },
                                              "type": "object",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                    },
                                    "security": Array [
                                      Object {
                                        "api_key": Array [],
                                      },
                                    ],
                                    "summary": "Returns pet inventories by status",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                },
                                "/store/order": Object {
                                  "post": Object {
                                    "description": "Place a new order in the store",
                                    "operationId": "placeOrder",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Order",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Order",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/Order",
                                          },
                                        },
                                      },
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Order",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "405": Object {
                                        "description": "Invalid input",
                                      },
                                    },
                                    "summary": "Place an order for a pet",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                },
                                "/store/order/{orderId}": Object {
                                  "delete": Object {
                                    "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                                    "operationId": "deleteOrder",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of the order that needs to be deleted",
                                        "in": "path",
                                        "name": "orderId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Order not found",
                                      },
                                    },
                                    "summary": "Delete purchase order by ID",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                  "get": Object {
                                    "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                                    "operationId": "getOrderById",
                                    "parameters": Array [
                                      Object {
                                        "description": "ID of order that needs to be fetched",
                                        "in": "path",
                                        "name": "orderId",
                                        "required": true,
                                        "schema": Object {
                                          "format": "int64",
                                          "type": "integer",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Order",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/Order",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid ID supplied",
                                      },
                                      "404": Object {
                                        "description": "Order not found",
                                      },
                                    },
                                    "summary": "Find purchase order by ID",
                                    "tags": Array [
                                      "store",
                                    ],
                                  },
                                },
                                "/user": Object {
                                  "post": Object {
                                    "description": "This can only be done by the logged in user.",
                                    "operationId": "createUser",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                      },
                                      "description": "Created user object",
                                    },
                                    "responses": Object {
                                      "default": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Create user",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/createWithList": Object {
                                  "post": Object {
                                    "description": "Creates list of users with given input array",
                                    "operationId": "createUsersWithListInput",
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "items": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                            "type": "array",
                                          },
                                        },
                                      },
                                    },
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                        },
                                        "description": "Successful operation",
                                      },
                                      "default": Object {
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Creates list of users with given input array",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/login": Object {
                                  "get": Object {
                                    "description": "",
                                    "operationId": "loginUser",
                                    "parameters": Array [
                                      Object {
                                        "description": "The user name for login",
                                        "in": "query",
                                        "name": "username",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                      Object {
                                        "description": "The password for login in clear text",
                                        "in": "query",
                                        "name": "password",
                                        "required": false,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "type": "string",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "type": "string",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                        "headers": Object {
                                          "X-Expires-After": Object {
                                            "description": "date in UTC when token expires",
                                            "schema": Object {
                                              "format": "date-time",
                                              "type": "string",
                                            },
                                          },
                                          "X-Rate-Limit": Object {
                                            "description": "calls per hour allowed by the user",
                                            "schema": Object {
                                              "format": "int32",
                                              "type": "integer",
                                            },
                                          },
                                        },
                                      },
                                      "400": Object {
                                        "description": "Invalid username/password supplied",
                                      },
                                    },
                                    "summary": "Logs user into the system",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/logout": Object {
                                  "get": Object {
                                    "description": "",
                                    "operationId": "logoutUser",
                                    "parameters": Array [],
                                    "responses": Object {
                                      "default": Object {
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Logs out current logged in user session",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                                "/user/{username}": Object {
                                  "delete": Object {
                                    "description": "This can only be done by the logged in user.",
                                    "operationId": "deleteUser",
                                    "parameters": Array [
                                      Object {
                                        "description": "The name that needs to be deleted",
                                        "in": "path",
                                        "name": "username",
                                        "required": true,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "400": Object {
                                        "description": "Invalid username supplied",
                                      },
                                      "404": Object {
                                        "description": "User not found",
                                      },
                                    },
                                    "summary": "Delete user",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                  "get": Object {
                                    "description": "",
                                    "operationId": "getUserByName",
                                    "parameters": Array [
                                      Object {
                                        "description": "The name that needs to be fetched. Use user1 for testing. ",
                                        "in": "path",
                                        "name": "username",
                                        "required": true,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "responses": Object {
                                      "200": Object {
                                        "content": Object {
                                          "application/json": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                          "application/xml": Object {
                                            "schema": Object {
                                              "$ref": "#/components/schemas/User",
                                            },
                                          },
                                        },
                                        "description": "successful operation",
                                      },
                                      "400": Object {
                                        "description": "Invalid username supplied",
                                      },
                                      "404": Object {
                                        "description": "User not found",
                                      },
                                    },
                                    "summary": "Get user by user name",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                  "put": Object {
                                    "description": "This can only be done by the logged in user.",
                                    "operationId": "updateUser",
                                    "parameters": Array [
                                      Object {
                                        "description": "name that need to be deleted",
                                        "in": "path",
                                        "name": "username",
                                        "required": true,
                                        "schema": Object {
                                          "type": "string",
                                        },
                                      },
                                    ],
                                    "requestBody": Object {
                                      "content": Object {
                                        "application/json": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/x-www-form-urlencoded": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                        "application/xml": Object {
                                          "schema": Object {
                                            "$ref": "#/components/schemas/User",
                                          },
                                        },
                                      },
                                      "description": "Update an existent user in the store",
                                    },
                                    "responses": Object {
                                      "default": Object {
                                        "description": "successful operation",
                                      },
                                    },
                                    "summary": "Update user",
                                    "tags": Array [
                                      "user",
                                    ],
                                  },
                                },
                              },
                              "servers": Array [
                                Object {
                                  "url": "/api/v3",
                                },
                              ],
                              "tags": Array [
                                Object {
                                  "description": "Everything about your Pets",
                                  "externalDocs": Object {
                                    "description": "Find out more",
                                    "url": "http://swagger.io",
                                  },
                                  "name": "pet",
                                },
                                Object {
                                  "description": "Access to Petstore orders",
                                  "externalDocs": Object {
                                    "description": "Find out more about our store",
                                    "url": "http://swagger.io",
                                  },
                                  "name": "store",
                                },
                                Object {
                                  "description": "Operations about user",
                                  "name": "user",
                                },
                              ],
                            },
                          },
                        },
                      ],
                      "description": Object {
                        "name": "tags",
                        "optional": true,
                      },
                      "name": "tags",
                      "type": "array",
                      "uuid": "00087-000",
                      "value": Object {
                        "maxItems": undefined,
                        "minItems": undefined,
                        "uniqueItems": undefined,
                      },
                    },
                    Object {
                      "children": Array [
                        "available",
                        "pending",
                        "sold",
                      ],
                      "description": Object {
                        "description": "pet status in the store",
                        "name": "status",
                        "optional": true,
                      },
                      "name": "status",
                      "type": "enum",
                      "uuid": "00088-000",
                      "value": Object {},
                    },
                  ],
                  "description": Object {},
                  "name": "Pet",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00089-000",
                  "value": Object {},
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "code",
                        "optional": true,
                      },
                      "name": "code",
                      "type": "integer",
                      "uuid": "00093-000",
                      "value": Object {
                        "maximum": undefined,
                        "minimum": undefined,
                        "multipleOf": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "type",
                        "optional": true,
                      },
                      "name": "type",
                      "type": "string",
                      "uuid": "00094-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                    Object {
                      "children": Array [],
                      "description": Object {
                        "name": "message",
                        "optional": true,
                      },
                      "name": "message",
                      "type": "string",
                      "uuid": "00095-000",
                      "value": Object {
                        "format": undefined,
                        "maxLength": undefined,
                        "minLength": undefined,
                        "pattern": undefined,
                      },
                    },
                  ],
                  "description": Object {},
                  "name": "ApiResponse",
                  "prepass": true,
                  "type": "object",
                  "uuid": "00096-000",
                  "value": Object {},
                },
              ],
              "description": Object {},
              "type": "object",
              "uuid": "00097-000",
              "value": Object {},
            }
        `)
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            Object {
              "additionalProperties": false,
              "properties": Object {
                "Address": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "city": Object {
                      "title": "city",
                      "type": "string",
                    },
                    "state": Object {
                      "title": "state",
                      "type": "string",
                    },
                    "street": Object {
                      "title": "street",
                      "type": "string",
                    },
                    "zip": Object {
                      "title": "zip",
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
                "ApiResponse": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "code": Object {
                      "title": "code",
                      "type": "integer",
                    },
                    "message": Object {
                      "title": "message",
                      "type": "string",
                    },
                    "type": Object {
                      "title": "type",
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
                "Category": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "id": Object {
                      "title": "id",
                      "type": "integer",
                    },
                    "name": Object {
                      "title": "name",
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
                "Customer": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "address": Object {
                      "items": Object {
                        "$ref": "#/$defs/{{00030-000:uniqueSymbolName}}",
                      },
                      "title": "address",
                      "type": "array",
                    },
                    "id": Object {
                      "title": "id",
                      "type": "integer",
                    },
                    "username": Object {
                      "title": "username",
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
                "Order": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "complete": Object {
                      "title": "complete",
                      "type": "boolean",
                    },
                    "id": Object {
                      "title": "id",
                      "type": "integer",
                    },
                    "petId": Object {
                      "title": "petId",
                      "type": "integer",
                    },
                    "quantity": Object {
                      "title": "quantity",
                      "type": "integer",
                    },
                    "shipDate": Object {
                      "format": "date-time",
                      "title": "shipDate",
                      "type": "string",
                    },
                    "status": Object {
                      "description": "Order Status",
                      "enum": Array [
                        "placed",
                        "approved",
                        "delivered",
                      ],
                      "title": "status",
                    },
                  },
                  "type": "object",
                },
                "Pet": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "category": Object {
                      "$ref": "#/$defs/{{00081-000:uniqueSymbolName}}",
                      "title": "category",
                    },
                    "id": Object {
                      "title": "id",
                      "type": "integer",
                    },
                    "name": Object {
                      "title": "name",
                      "type": "string",
                    },
                    "photoUrls": Object {
                      "items": Object {
                        "type": "string",
                      },
                      "title": "photoUrls",
                      "type": "array",
                    },
                    "status": Object {
                      "description": "pet status in the store",
                      "enum": Array [
                        "available",
                        "pending",
                        "sold",
                      ],
                      "title": "status",
                    },
                    "tags": Object {
                      "items": Object {
                        "$ref": "#/$defs/{{00084-000:uniqueSymbolName}}",
                      },
                      "title": "tags",
                      "type": "array",
                    },
                  },
                  "required": Array [
                    "name",
                    "photoUrls",
                  ],
                  "type": "object",
                },
                "Tag": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "id": Object {
                      "title": "id",
                      "type": "integer",
                    },
                    "name": Object {
                      "title": "name",
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
                "User": Object {
                  "additionalProperties": false,
                  "properties": Object {
                    "email": Object {
                      "title": "email",
                      "type": "string",
                    },
                    "firstName": Object {
                      "title": "firstName",
                      "type": "string",
                    },
                    "id": Object {
                      "title": "id",
                      "type": "integer",
                    },
                    "lastName": Object {
                      "title": "lastName",
                      "type": "string",
                    },
                    "password": Object {
                      "title": "password",
                      "type": "string",
                    },
                    "phone": Object {
                      "title": "phone",
                      "type": "string",
                    },
                    "userStatus": Object {
                      "description": "User Status",
                      "title": "userStatus",
                      "type": "integer",
                    },
                    "username": Object {
                      "title": "username",
                      "type": "string",
                    },
                  },
                  "type": "object",
                },
              },
              "required": Array [
                "Order",
                "Customer",
                "Address",
                "Category",
                "User",
                "Tag",
                "Pet",
                "ApiResponse",
              ],
              "type": "object",
            }
        `)
    })

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "interface {{00097-000:symbolName}} {
                Order: {
                    id?: number
                    petId?: number
                    quantity?: number
                    shipDate?: string
                    /**
                     * Order Status
                     */
                    status?: 'placed' | 'approved' | 'delivered'
                    complete?: boolean
                }
                Customer: {
                    id?: number
                    username?: string
                    address?: ({{00030-000:referenceName}})[]
                }
                Address: {
                    street?: string
                    city?: string
                    state?: string
                    zip?: string
                }
                Category: {
                    id?: number
                    name?: string
                }
                User: {
                    id?: number
                    username?: string
                    firstName?: string
                    lastName?: string
                    email?: string
                    password?: string
                    phone?: string
                    /**
                     * User Status
                     */
                    userStatus?: number
                }
                Tag: {
                    id?: number
                    name?: string
                }
                Pet: {
                    id?: number
                    name: string
                    category?: {{00081-000:referenceName}}
                    photoUrls: (string)[]
                    tags?: ({{00084-000:referenceName}})[]
                    /**
                     * pet status in the store
                     */
                    status?: 'available' | 'pending' | 'sold'
                }
                ApiResponse: {
                    code?: number
                    type?: string
                    message?: string
                }
            }
            ",
              "referenceName": "{{00097-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })
})
