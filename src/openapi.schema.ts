import type { JsonSchema } from './json'
import { $jsonschema } from './lib/primitives'

import got from 'got'

const urlv3_0 = 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/schemas/v3.0/schema.json'

export const openapiV3 = got
    .get(urlv3_0)
    .json<JsonSchema>()
    .then((data) => $jsonschema(data, { exportAllSymbols: true }))
