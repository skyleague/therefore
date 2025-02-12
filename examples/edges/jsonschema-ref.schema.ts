import { $jsonschema } from '../../src/lib/primitives/jsonschema/jsonschema.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'
import { $union } from '../../src/lib/primitives/union/union.js'
import { Pet } from '../restclients/ajv/petstore/petstore.type.js'

export const reference1 = $jsonschema({
    required: ['keys'],
    properties: {
        keys: { $ref: '#/definitions/Keys' },
    },
    additionalProperties: false,
    title: 'Loan repayment executed',
    definitions: {
        'Foo.Key': {
            enum: ['foo', 'bar'],
            type: 'string',
            minLength: 1,
        },
        Keys: {
            items: {
                $ref: '#/definitions/Foo',
            },
            type: 'array',
            uniqueItems: true,
        },
        Foo: { type: 'string' },
    },
    type: 'object',
})

export const reference2 = $jsonschema({
    required: ['keys'],
    properties: {
        keys: { $ref: '#/definitions/Keys' },
    },
    additionalProperties: false,
    title: 'Loan repayment executed',
    definitions: {
        'Foo.Key': {
            enum: ['foo', 'bar'],
            type: 'string',
            minLength: 1,
        },
        Keys: {
            items: {
                $ref: '#/definitions/Foo',
            },
            type: 'array',
            uniqueItems: true,
        },
        Foo: { type: 'string' },
    },
    type: 'object',
})

export const combined = $union([reference1, reference2]).validator({ compile: false })

export const existingRef = $ref(Pet).extend({
    foo: $string,
})

export const existingRefDuplicate = $ref(Pet).extend({
    foo: $string,
})
