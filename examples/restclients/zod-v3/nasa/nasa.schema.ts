import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

import got from 'got'
import yaml from 'js-yaml'

const astroids = await got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/nasa.gov/asteroids%20neows/3.4.0/openapi.yaml')
    .text()
export const Astroids = await $restclient(yaml.load(astroids) as OpenapiV3, {
    filename: 'astroids/nasa.client.ts',
    formats: false,
    validator: 'zod',
})

const apod = await got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/nasa.gov/apod/1.0.0/openapi.yaml')
    .text()
export const Apod = $restclient(yaml.load(apod) as OpenapiV3, {
    filename: 'apod/nasa.client.ts',
    validator: 'zod',
})
