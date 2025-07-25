import got from 'got'
import yaml from 'js-yaml'
import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

export const datumbox = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/datumbox.com/1.0/openapi.yaml')
    .text()
    .then((data) => $restclient(yaml.load(data) as OpenapiV3, { validator: 'zod/v4' }))
