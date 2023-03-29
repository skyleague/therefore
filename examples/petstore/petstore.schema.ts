import type { OpenapiV3 } from '../../src/index.js'
import { $restclient } from '../../src/index.js'

import got from 'got'

export const petStore = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) => $restclient(data, { strict: false }))
