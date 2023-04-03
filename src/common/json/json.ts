import type { JsonSchema } from '../../json.js'

import got from 'got'
import pointer from 'jsonpointer'
import makeSynchronous from 'make-synchronous'

export function jsonPointer<T extends {}>({
    schema,
    ptr,
    metaSchemas,
}: {
    schema: object
    ptr:
        | T
        | {
              $ref: string
          }
        | undefined
    metaSchemas?: Record<string, JsonSchema | undefined>
}): JsonSchema | undefined {
    if (ptr !== undefined && '$ref' in ptr) {
        if (ptr.$ref.startsWith('#')) {
            return pointer.get(schema, ptr.$ref.slice(1)) as JsonSchema | undefined
        } else if (ptr.$ref.includes('#') && ptr.$ref.startsWith('http')) {
            const [url, reference] = ptr.$ref.split('#') as [string, string]
            metaSchemas ??= {}
            const metaSchema = metaSchemas[url]

            if (metaSchema !== undefined) {
                return pointer.get(metaSchema, reference) as JsonSchema | undefined
            }

            console.log(`fetching schema from ${url}`)

            const json = makeSynchronous(async () => got.get(url).json<JsonSchema>())

            metaSchemas[url] = json()

            return pointer.get(metaSchemas[url]!, reference) as JsonSchema | undefined
        }
        throw new Error('unsupported reference type')
    }
    return ptr
}
