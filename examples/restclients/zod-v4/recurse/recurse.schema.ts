import { $restclient } from '../../../../src/lib/primitives/restclient/restclient.js'
import type { OpenapiV3 } from '../../../../src/types/openapi.type.js'

export const openapi: OpenapiV3 = {
    openapi: '3.0.0',
    info: {
        version: '1.0',
        title: 'Recursive Model Example',
    },
    paths: {
        '/business': {
            get: {
                operationId: 'getBusiness',
                responses: {
                    '200': {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/BusinessRelationModel',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/businesses': {
            get: {
                operationId: 'getBusinesses',
                responses: {
                    '200': {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/BusinessRelationModel',
                                    },
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
            BusinessRelationModel: {
                type: 'object',
                properties: {
                    relations: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/BusinessRelationModel',
                        },
                    },
                    other: {
                        $ref: '#/components/schemas/OtherModel',
                    },
                },
            },
            OtherModel: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                },
            },
        },
    },
}
export const client = $restclient(openapi, { client: 'ky', validator: 'zod/v4' })
