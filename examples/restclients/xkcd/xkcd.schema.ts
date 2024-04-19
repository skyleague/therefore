import { $restclient } from '../../../src/index.js'
import type { OpenapiV3 } from '../../../src/index.js'

import got from 'got'
import yaml from 'js-yaml'

export const XKCD = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/xkcd.com/1.0.0/openapi.yaml')
    .text()
    .then((data) => $restclient(yaml.load(data) as OpenapiV3, { useEither: false }))

export const XKCDNullable = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/xkcd.com/1.0.0/openapi.yaml')
    .text()
    .then((data) =>
        $restclient(yaml.load(data) as OpenapiV3, {
            useEither: false,
            optionalNullable: true,
            compile: false,
            filename: 'nullable/nullable.client.ts',
        }),
    )
