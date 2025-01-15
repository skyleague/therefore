import { expect, it } from 'vitest'
import { Pet } from '../examples/restclients/zod/petstore/petstore.zod.js'
import { $ref } from '../src/lib/primitives/ref/ref.js'
import { Therefore } from '../src/lib/primitives/therefore.js'

it('pet - compiled jsonschema to have the correct names', async () => {
    const pet = Pet
    const reffed = $ref(pet)

    expect(await Therefore.jsonschema(reffed)).toMatchInlineSnapshot(`
      {
        "$defs": {
          "Category": {
            "additionalProperties": true,
            "properties": {
              "id": {
                "type": "integer",
              },
              "name": {
                "type": "string",
              },
            },
            "type": "object",
          },
          "Tag": {
            "additionalProperties": true,
            "properties": {
              "id": {
                "type": "integer",
              },
              "name": {
                "type": "string",
              },
            },
            "type": "object",
          },
        },
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalProperties": true,
        "properties": {
          "category": {
            "$ref": "#/$defs/Category",
          },
          "id": {
            "type": "integer",
          },
          "name": {
            "type": "string",
          },
          "photoUrls": {
            "items": {
              "type": "string",
            },
            "type": "array",
          },
          "status": {
            "description": "pet status in the store",
            "enum": [
              "available",
              "pending",
              "sold",
            ],
          },
          "tags": {
            "items": {
              "$ref": "#/$defs/Tag",
            },
            "type": "array",
          },
        },
        "required": [
          "name",
          "photoUrls",
        ],
        "title": "Pet",
        "type": "object",
      }
    `)
})

// biome-ignore lint/suspicious/noExportsInTest: we need this export here
export const petArray = Pet.array()
it('petArray - compiled jsonschema to have the correct names', async () => {
    const reffed = $ref(petArray)

    expect(await Therefore.jsonschema(reffed)).toMatchInlineSnapshot(`
      {
        "$defs": {
          "Category": {
            "additionalProperties": true,
            "properties": {
              "id": {
                "type": "integer",
              },
              "name": {
                "type": "string",
              },
            },
            "type": "object",
          },
          "Pet": {
            "additionalProperties": true,
            "properties": {
              "category": {
                "$ref": "#/$defs/Category",
              },
              "id": {
                "type": "integer",
              },
              "name": {
                "type": "string",
              },
              "photoUrls": {
                "items": {
                  "type": "string",
                },
                "type": "array",
              },
              "status": {
                "description": "pet status in the store",
                "enum": [
                  "available",
                  "pending",
                  "sold",
                ],
              },
              "tags": {
                "items": {
                  "$ref": "#/$defs/Tag",
                },
                "type": "array",
              },
            },
            "required": [
              "name",
              "photoUrls",
            ],
            "type": "object",
          },
          "Tag": {
            "additionalProperties": true,
            "properties": {
              "id": {
                "type": "integer",
              },
              "name": {
                "type": "string",
              },
            },
            "type": "object",
          },
        },
        "$schema": "http://json-schema.org/draft-07/schema#",
        "items": {
          "$ref": "#/$defs/Pet",
        },
        "title": "PetArray",
        "type": "array",
      }
    `)
})
