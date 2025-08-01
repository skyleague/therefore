import got from 'got'
import yaml from 'js-yaml'
import type { OpenapiV3 } from '../../../../src/index.js'
import { $restclient } from '../../../../src/index.js'

export const banking = got
    .get(
        'https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/openbanking.org.uk/payment-initiation-openapi/3.1.7/openapi.yaml',
    )
    .text()
    .then((data) => {
        const content = yaml.load(data) as OpenapiV3
        return $restclient(content, {
            transformOpenapi: (api) => {
                api.paths = {
                    // biome-ignore lint/style/noNonNullAssertion: ignore
                    '/file-payment-consents/{ConsentId}/file': api.paths['/file-payment-consents/{ConsentId}/file']!,
                }
                return api
            },
            validator: 'zod/v3',
        })
    })
