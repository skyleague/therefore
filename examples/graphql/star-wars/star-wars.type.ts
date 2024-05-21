/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

export const introspection = {
    __schema: {
        queryType: { name: 'Query' },
        mutationType: null,
        subscriptionType: null,
        types: [
            {
                kind: 'OBJECT',
                name: 'Query',
                fields: [
                    {
                        name: 'droid',
                        type: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Droid', ofType: null } },
                        args: [{ name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } }],
                    },
                    {
                        name: 'hero',
                        type: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Character', ofType: null } },
                        args: [{ name: 'input', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } }],
                    },
                    {
                        name: 'human',
                        type: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Human', ofType: null } },
                        args: [{ name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } }],
                    },
                ],
                interfaces: [],
            },
            {
                kind: 'OBJECT',
                name: 'Character',
                fields: [
                    {
                        name: 'appearsIn',
                        type: {
                            kind: 'NON_NULL',
                            ofType: { kind: 'LIST', ofType: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } },
                        },
                        args: [{ name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } }],
                    },
                    {
                        name: 'friends',
                        type: {
                            kind: 'NON_NULL',
                            ofType: {
                                kind: 'LIST',
                                ofType: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Character', ofType: null } },
                            },
                        },
                        args: [],
                    },
                    { name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                    { name: 'name', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                ],
                interfaces: [],
            },
            {
                kind: 'OBJECT',
                name: 'Droid',
                fields: [
                    {
                        name: 'appearsIn',
                        type: {
                            kind: 'NON_NULL',
                            ofType: { kind: 'LIST', ofType: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } },
                        },
                        args: [{ name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } }],
                    },
                    {
                        name: 'friends',
                        type: {
                            kind: 'NON_NULL',
                            ofType: {
                                kind: 'LIST',
                                ofType: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Character', ofType: null } },
                            },
                        },
                        args: [],
                    },
                    { name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                    { name: 'name', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                    { name: 'primaryFunction', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                ],
                interfaces: [],
            },
            {
                kind: 'OBJECT',
                name: 'Human',
                fields: [
                    {
                        name: 'appearsIn',
                        type: {
                            kind: 'NON_NULL',
                            ofType: { kind: 'LIST', ofType: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } },
                        },
                        args: [{ name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } } }],
                    },
                    {
                        name: 'friends',
                        type: {
                            kind: 'NON_NULL',
                            ofType: {
                                kind: 'LIST',
                                ofType: { kind: 'NON_NULL', ofType: { kind: 'OBJECT', name: 'Character', ofType: null } },
                            },
                        },
                        args: [],
                    },
                    { name: 'homePlanet', type: { kind: 'SCALAR', name: 'Any' }, args: [] },
                    { name: 'id', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                    { name: 'name', type: { kind: 'NON_NULL', ofType: { kind: 'SCALAR', name: 'Any' } }, args: [] },
                ],
                interfaces: [],
            },
            { kind: 'SCALAR', name: 'Any' },
        ],
        directives: [],
    },
} as const