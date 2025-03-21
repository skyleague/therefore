import type { JsonSchema } from '../json.js'
import { $jsonschema } from '../lib/primitives/jsonschema/jsonschema.js'

import got from 'got'
import yaml from 'js-yaml'

const urlv3_0 = 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/refs/heads/main/_archive_/schemas/v3.0/schema.yaml'

export const openapiV3 = got
    .get(urlv3_0)
    .text()
    .then((data) => {
        const content = yaml.load(data) as JsonSchema
        return $jsonschema(content, { exportAllSymbols: true })
    })
