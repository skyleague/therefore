import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

import got from 'got'

export const hey = got
    .get('https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v3.json')
    .text()
    .then((data) => {
        const content = JSON.parse(data) as OpenapiV3
        return $restclient(content)
    })
