import { asyncForAll } from '@skyleague/axioms'
import nock from 'nock'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { UniqueItemsClient } from '../../../examples/edges/client-zod.client.js'
import { CreateUniqueTagRequest, CreateUniqueTagResponse } from '../../../examples/edges/client-zod.zod.js'
import { arbitrary } from '../../../src/index.js'
import { $nockClient } from '../../../src/lib/primitives/restclient/mock.js'

const prefixUrl = 'http://www.example.com'

describe('methods', () => {
    beforeEach(() => nock.disableNetConnect())
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    const client = new UniqueItemsClient({ prefixUrl })

    it('createUniqueTag', async () => {
        await asyncForAll(arbitrary(CreateUniqueTagRequest), async (request) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            const mockResponse = { uniqueTags: request.tags }
            nockClient.createUniqueTag().reply(200, mockResponse)

            const result = await client.createUniqueTag({ body: request })
            if (result.success) {
                CreateUniqueTagResponse.parse(result.right)
            } else {
                throw new Error(result.error?.message)
            }
        })
    })

    it('createUniqueTag - json', async () => {
        await asyncForAll(arbitrary(CreateUniqueTagRequest), async (request) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            const mockResponse = { uniqueTags: request.tags }
            nockClient.createUniqueTag().reply(
                200,
                JSON.stringify(mockResponse, (_key, value) => (value instanceof Set ? [...value] : value)),
            )

            const result = await client.createUniqueTag({ body: request })
            if (result.success) {
                CreateUniqueTagResponse.parse(result.right)
            } else {
                throw new Error(result.error?.message)
            }
        })
    })
})
