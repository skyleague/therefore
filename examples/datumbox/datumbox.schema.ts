import type { OpenapiV3 } from '../../src'
import { $restclient } from '../../src'

import got from 'got'
import yaml from 'js-yaml'

export const petStore = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/datumbox.com/1.0/openapi.yaml')
    .text()
    .then((data) => $restclient(yaml.load(data) as OpenapiV3))
