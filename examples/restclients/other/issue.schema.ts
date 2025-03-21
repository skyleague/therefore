import type { OpenapiV3 } from '../../../src/index.js'
import { $restclient } from '../../../src/index.js'

export const openapi: OpenapiV3 = {
    openapi: '3.0.0',
    info: {
        title: 'test',
        version: 'v1',
    },
    paths: {
        '/api/company/{id}': {
            get: {
                tags: ['Company'],
                operationId: 'Company_Get',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        'x-position': 1,
                    },
                ],
                responses: {
                    '200': {
                        description: '',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Company',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Company: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    owns: {
                        type: 'array',
                        nullable: true,
                        items: {
                            $ref: '#/components/schemas/ICompany',
                        },
                    },
                },
            },
            ICompany: {
                type: 'object',
                'x-abstract': true,
                additionalProperties: false,
                properties: {
                    owns: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ICompany',
                        },
                    },
                },
            },
        },
    },
}

export const issue = $restclient(openapi, { strict: false, validator: 'zod' })

export const issue2 = $restclient(
    {
        openapi: '3.0.1',
        info: {
            title: 'Test',
            version: '1.0.0',
        },
        paths: {
            '/search': {
                post: {
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/foobar',
                                },
                            },
                        },
                    },
                    responses: {
                        '204': {
                            description: 'OK',
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                foobar: {
                    type: 'object',
                    properties: {
                        prop: {
                            type: 'string',
                            description: 'foobar',
                            nullable: true,
                        },
                    },
                },
            },
        },
    },
    { strict: false, validator: 'zod' },
)
