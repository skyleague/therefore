import { $jsonschema } from '../../src/lib/primitives/jsonschema/jsonschema.js'

export const reffed = $jsonschema(
    {
        properties: {
            foo: {
                type: 'string',
                $ref: '#/$defs/bar',
            },
        },
        $defs: {
            bar: {
                type: 'string',
            },
        },
    },
    { exportAllSymbols: true },
)
