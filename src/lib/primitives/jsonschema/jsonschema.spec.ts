import { $jsonschema } from './jsonschema'

import { awaitAll } from '../../../common/util'
import type { JsonSchema } from '../../../json'
import { walkCst } from '../../cst/visitor'
import { toArbitrary } from '../../visitor'
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
    test('definition', async () => {
        expect(await therefore()).toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [],
                  "description": {
                    "description": "The person's first name.",
                    "name": "firstName",
                    "optional": true,
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
                    "optional": true,
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
                    "optional": true,
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

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
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

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
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
        expect(therefore()).toMatchInlineSnapshot(`Promise {}`)
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
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

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
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
        expect(therefore()).toMatchInlineSnapshot(`Promise {}`)
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchInlineSnapshot(`
            {
              "additionalProperties": false,
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

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
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
            await awaitAll(entriesOf(schema?.['components']?.['schemas'] ?? {}), async ([name, v]) => [
                name,
                await $jsonschema(v as JsonSchema, { root: schema as JsonSchema }),
            ])
        )
        return $object(entries)
    }

    test('definition', async () => {
        expect(await therefore()).toMatchSnapshot()
    })

    test('jsonschema', async () => {
        const json = walkCst(await therefore(), jsonSchemaVisitor, jsonSchemaContext())
        expect(json).toMatchSnapshot()
    })

    test('typescript', async () => {
        expect(
            walkCst(await therefore(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchSnapshot()
    })
})

test('primitives', async () => {
    forAll(toArbitrary<string>(await $jsonschema({ type: 'string', minLength: 1 })), (x) => x.length >= 1)
})
