import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

import got from 'got'
import yaml from 'js-yaml'

export const banking = got
    .get(
        'https://raw.githubusercontent.com/APIs-guru/openapi-directory/433a94f3e9e268f2b000b0b497785ede34332a7f/APIs/apimatic.io/1.0/openapi.yaml',
    )
    .text()
    .then((data) => {
        const content = yaml.load(data) as OpenapiV3
        return $restclient(content, { explicitContentNegotiation: true })
    })
