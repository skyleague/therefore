import { Edges } from '../examples/edges/edges.client.js'

import { eitherToError } from '@skyleague/axioms'
import nock from 'nock'

describe('updatePet', () => {
    beforeEach(() => nock.disableNetConnect())
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    test('binary responses', async () => {
        nock('http://localhost:80').get('/image').reply(200, 'foobar')

        const client = new Edges({ prefixUrl: 'http://localhost' })
        const image: string = eitherToError(await client.getImage())

        expect(image).toMatchInlineSnapshot(`"foobar"`)
    })

    test('yaml responses', async () => {
        nock('http://localhost:80').get('/employees').reply(200, 'foo: "bar"')

        const client = new Edges({ prefixUrl: 'http://localhost' })
        const employees: string = eitherToError(await client.getEmployees())

        expect(employees).toMatchInlineSnapshot(`"foo: "bar""`)
    })
})
