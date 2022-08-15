import type { JsonSchema } from '../../json'

import got from 'got'
import pointer from 'jsonpointer'

export async function jsonPointer<T>({
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
    metaSchemas?: Record<string, Promise<JsonSchema>>
}): Promise<JsonSchema | undefined> {
    if (ptr !== undefined && '$ref' in ptr) {
        if (ptr.$ref.startsWith('#')) {
            return pointer.get(schema, ptr.$ref.slice(1)) as JsonSchema | undefined
        } else if (ptr.$ref.includes('#') && ptr.$ref.startsWith('http')) {
            const [url, reference] = ptr.$ref.split('#')
            metaSchemas ??= {}
            const metaSchema = metaSchemas?.[url]

            if (metaSchema !== undefined) {
                return pointer.get(await metaSchema, reference) as Promise<JsonSchema | undefined>
            }

            console.log(`fetching schema from ${url}`)

            metaSchemas[url] = got.get(url).json<JsonSchema>()

            return pointer.get(await metaSchemas[url], reference) as Promise<JsonSchema | undefined>
        }
        throw new Error('unsupported reference type')
    }
    return ptr
}
