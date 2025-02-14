import type { OpenapiV3 } from '../../src/index.js'
import { $restclient } from '../../src/index.js'

export const uniqueItemsTest: OpenapiV3 = {
    openapi: '3.0.0',
    info: { title: 'openapi', version: '1.0.0' },
    paths: {
        '/unique-tags': {
            post: {
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['tags'],
                                properties: {
                                    tags: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                        },
                                        uniqueItems: true,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Tags created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        uniqueTags: {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                            },
                                            uniqueItems: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}

export const uniqueItemsClient = $restclient(uniqueItemsTest, { strict: false, validator: 'zod' })
