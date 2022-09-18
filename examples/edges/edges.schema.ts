import type { OpenapiV3 } from '../../src'
import { $restclient } from '../../src'

export const openapi: OpenapiV3 = {
    openapi: '3.0.0',
    info: { title: 'openapi', version: '1.0.0' },
    paths: {
        '/employees': {
            get: {
                responses: {
                    '200': {
                        content: {
                            'application/yaml': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'integer',
                                        },
                                        name: {
                                            type: 'string',
                                        },
                                        fullTime: {
                                            type: 'boolean',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/image': {
            get: {
                responses: {
                    '200': {
                        content: {
                            'image/png': {},
                        },
                    },
                },
            },
        },
    },
}

export const edges = $restclient(openapi, { strict: false })

export const swagger = {
    swagger: '2.0',
    info: { title: 'swagger', version: '1.0.0' },
    paths: {
        '/json-response': {
            get: {
                produces: ['application/json'],
                responses: {
                    '200': {
                        description: 'OK',
                    },
                },
            },
        },
    },
}

export const swaggerEdges = $restclient(swagger as unknown as OpenapiV3, { strict: false })
