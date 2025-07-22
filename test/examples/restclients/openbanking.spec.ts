import { expect, it } from 'vitest'
import { compileOutput } from '../../../src/commands/generate/generate.js'

it('output generation - ajv', async () => {
    expect(
        await compileOutput(['examples/restclients/ajv/openbanking/banking.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('output generation - zod 3', async () => {
    expect(
        await compileOutput(['examples/restclients/zod-v3/openbanking/banking.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('output generation - zod 4', async () => {
    expect(
        await compileOutput(['examples/restclients/zod-v4/openbanking/banking.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
