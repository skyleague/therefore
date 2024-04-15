import { Edges } from '../../examples/edges/client.client.js'
import { compileOutput } from '../../src/commands/generate/generate.js'

import { eitherToError } from '@skyleague/axioms'
import nock from 'nock'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('client', () => {
    beforeEach(() => nock.disableNetConnect())
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    it('client', async () => {
        expect(
            await compileOutput(['examples/edges/client.schema.ts'], {
                cwd: process.cwd(),
            }),
        ).toMatchSnapshot()
    })

    it('binary responses', async () => {
        nock('http://localhost:80').get('/image').reply(200, 'foobar')

        const client = new Edges({ prefixUrl: 'http://localhost' })
        const image: unknown = eitherToError(await client.getImage())

        expect(image).toMatchInlineSnapshot(`"foobar"`)
    })

    it('yaml responses', async () => {
        nock('http://localhost:80').get('/employees').reply(200, 'foo: "bar"')

        const client = new Edges({ prefixUrl: 'http://localhost' })
        const employees: unknown = eitherToError(await client.getEmployees())

        expect(employees).toMatchInlineSnapshot(`"foo: "bar""`)
    })
})

it('locals', async () => {
    expect(
        await compileOutput(['examples/edges/locals.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('optional', async () => {
    expect(
        await compileOutput(['examples/edges/optional.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('validator', async () => {
    expect(
        await compileOutput(['examples/edges/validator.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
