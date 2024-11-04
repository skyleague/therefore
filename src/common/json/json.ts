import pointer from 'jsonpointer'
import makeSynchronous from 'make-synchronous'
import type { JsonSchema } from '../../json.js'

// global caching is good enough for our purposes here
const cache = new Map<string, JsonSchema>()

export function jsonPointer<T extends {}>({
    schema,
    ptr,
}: {
    schema: object
    ptr:
        | T
        | {
              $ref: string
          }
        | undefined
}): JsonSchema | undefined {
    if (ptr !== undefined && '$ref' in ptr) {
        if (ptr.$ref.startsWith('#')) {
            return pointer.get(schema, ptr.$ref.slice(1)) as JsonSchema | undefined
        }
        if (ptr.$ref.includes('#') && ptr.$ref.startsWith('http')) {
            const [url, reference] = ptr.$ref.split('#') as [string, string]

            if (!cache.has(url)) {
                console.log(`fetching schema from ${url}`)
                const json = makeSynchronous(async () => {
                    const response = await fetch(url)
                    return response.json() as Promise<JsonSchema>
                })
                cache.set(url, json())
            }
            // biome-ignore lint/style/noNonNullAssertion: cache is checked explicitly
            const metaSchema = cache.get(url)!
            return pointer.get(metaSchema, reference) as JsonSchema | undefined
        }
        throw new Error('unsupported reference type')
    }
    return ptr
}
