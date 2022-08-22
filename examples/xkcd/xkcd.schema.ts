import type { OpenapiV3 } from '../../src/'
import { $restclient } from '../../src/'

import got from 'got'
import yaml from 'js-yaml'

export const XKCD = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/xkcd.com/1.0.0/openapi.yaml')
    .text()
    .then((data) => $restclient(yaml.load(data) as OpenapiV3, { useEither: false }))
