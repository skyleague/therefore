import { PetStore } from '../examples/petstore/petstore.client'
import type { Pet } from '../examples/petstore/petstore.type'

import nock from 'nock'

const prefixUrl = 'http://www.example.com'

describe('updatePet', () => {
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    const client = new PetStore({ prefixUrl, security: { apiKey: 'foo-key' } })

    test('gives valid response', async () => {
        const updatedPet: Pet = { name: 'FooPet', photoUrls: ['example.com'] }
        nock('http://www.example.com:80').put('/pet').reply(200, updatedPet)

        expect(await client.updatePet({ body: updatedPet })).toEqual(updatedPet)
    })
})
