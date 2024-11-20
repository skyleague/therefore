import type { OpenapiV3 } from '../../src/index.js'
import { $restclient } from '../../src/index.js'

export const kyurlencoded: OpenapiV3 = {
    openapi: '3.0.1',
    info: {
        title: 'Token SDK',
        version: '1.0.0',
    },
    components: {
        securitySchemes: {
            basic: {
                type: 'http',
                scheme: 'basic',
            },
        },
    },
    security: [
        {
            basic: [],
        },
    ],
    paths: {
        '/connect/token': {
            post: {
                responses: {
                    '200': {
                        description: 'Bearer token response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        access_token: {
                                            type: 'string',
                                        },
                                        expires_in: {
                                            type: 'number',
                                        },
                                        scope: {
                                            type: 'string',
                                        },
                                        token_type: {
                                            type: 'string',
                                            enum: ['Bearer'],
                                        },
                                    },
                                    required: ['access_token', 'expires_in'],
                                },
                            },
                        },
                    },
                },
                requestBody: {
                    content: {
                        'application/x-www-form-urlencoded': {
                            schema: {
                                type: 'object',
                                properties: {
                                    grant_type: {
                                        type: 'string',
                                        enum: ['client_credentials'],
                                    },
                                    client_id: {
                                        type: 'string',
                                    },
                                    client_secret: {
                                        type: 'string',
                                    },
                                    scope: {
                                        type: 'string',
                                    },
                                },
                                required: ['grant_type', 'client_id', 'client_secret', 'scope'],
                                additionalProperties: false,
                            },
                        },
                    },
                },
            },
        },
    },
}
export const kyurlencodedClient = $restclient(kyurlencoded, { client: 'ky' })
