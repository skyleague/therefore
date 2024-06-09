import { $jsonschema } from '../../src/lib/primitives/jsonschema/jsonschema.js'

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
