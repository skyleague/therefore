import got from 'got'
import yaml from 'js-yaml'
import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

export const XKCD = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/xkcd.com/1.0.0/openapi.yaml')
    .text()
    .then((data) => $restclient(yaml.load(data) as OpenapiV3, { useEither: false, validator: 'zod/v4' }))

export const XKCDNullable = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/xkcd.com/1.0.0/openapi.yaml')
    .text()
    .then((data) =>
        $restclient(yaml.load(data) as OpenapiV3, {
            useEither: false,
            optionalNullable: true,
            compile: false,
            validator: 'zod/v4',
            filename: 'nullable/nullable.client.ts',
        }),
    )
