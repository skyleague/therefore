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

export const issue3 = $restclient(
    {
        openapi: '3.0.1',
        info: {
            title: 'API Specification',
            description: 'REST APIs',
            version: '1.0.0',
        },
        servers: [
            {
                url: '//api.example.com/',
            },
        ],
        tags: [
            {
                name: 'controller-v2',
                description: 'Controller V2',
            },
        ],
        paths: {
            '/api/v2/executeRequest': {
                post: {
                    tags: ['controller-v2'],
                    summary: 'executeRequest',
                    operationId: 'executeRequestUsingPOST',
                    requestBody: {
                        description: 'request',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/EntityType',
                                },
                            },
                        },
                        required: true,
                    },
                    responses: {
                        '200': {
                            description: 'OK',
                            content: {
                                '*/*': {
                                    schema: {
                                        $ref: '#/components/schemas/EntityType',
                                    },
                                },
                            },
                        },
                        '201': {
                            description: 'Created',
                            content: {},
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {},
                        },
                        '403': {
                            description: 'Forbidden',
                            content: {},
                        },
                        '404': {
                            description: 'Not Found',
                            content: {},
                        },
                    },
                    'x-codegen-request-body-name': 'request',
                },
            },
        },
        components: {
            schemas: {
                EntityRelationRegistrationType: {
                    title: 'EntityRelationRegistrationType',
                    type: 'object',
                    properties: {
                        entity: {
                            $ref: '#/components/schemas/EntityType',
                        },
                    },
                    xml: {
                        name: 'EntityRelationRegistrationType',
                        attribute: false,
                        wrapped: false,
                    },
                },
                EntityType: {
                    title: 'EntityType',
                    type: 'object',
                    properties: {
                        hasRelationA: {
                            $ref: '#/components/schemas/ParentRelationRegistrationType',
                        },
                        hasRelationB: {
                            $ref: '#/components/schemas/ChildrenRelationRegistrationType',
                        },
                    },
                    xml: {
                        name: 'EntityType',
                        attribute: false,
                        wrapped: false,
                    },
                },
                ParentRelationRegistrationType: {
                    title: 'ParentRelationRegistrationType',
                    type: 'object',
                    properties: {
                        parent: {
                            $ref: '#/components/schemas/ParentType',
                        },
                    },
                    xml: {
                        name: 'ParentRelationRegistrationType',
                        attribute: false,
                        wrapped: false,
                    },
                },
                ParentType: {
                    title: 'ParentType',
                    type: 'object',
                    properties: {
                        hasChildren: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/EntityRelationRegistrationType',
                            },
                        },
                    },
                    xml: {
                        name: 'ParentType',
                        attribute: false,
                        wrapped: false,
                    },
                },
                ChildrenRelationRegistrationType: {
                    title: 'ChildrenRelationRegistrationType',
                    type: 'object',
                    properties: {
                        children: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/EntityType',
                            },
                        },
                    },
                    xml: {
                        name: 'ChildrenRelationRegistrationType',
                        attribute: false,
                        wrapped: false,
                    },
                },
            },
        },
    },
    { strict: false, validator: 'zod' },
)
