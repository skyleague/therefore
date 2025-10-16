import got from 'got'
import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

export const hey = got
    .get('https://raw.githubusercontent.com/hey-api/openapi-ts/refs/heads/main/packages/openapi-ts-tests/specs/v3.json')
    .text()
    .then((data) => {
        const content = JSON.parse(data) as OpenapiV3
        return $restclient(content)
    })
