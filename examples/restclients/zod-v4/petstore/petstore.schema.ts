import got from 'got'
import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

export const petStore = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) => $restclient(data, { strict: false, validator: 'zod/v4' }))

export const petStoreOptions = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) =>
        $restclient(data, {
            strict: true,
            useEither: false,
            compile: false,
            validator: 'zod/v4',
            filename: './options/petstore.client.ts',
        }),
    )
export const petStoreKy = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) =>
        $restclient(data, {
            strict: true,
            client: 'ky',
            validator: 'zod/v4',
            filename: './ky/petstore.client.ts',
            options: { timeout: 4000 },
        }),
    )

export const petStoreOptionsKy = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) =>
        $restclient(data, {
            strict: true,
            useEither: false,
            client: 'ky',
            validator: 'zod/v4',
            filename: './oky/petstore.client.ts',
        }),
    )
