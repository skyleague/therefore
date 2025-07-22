import { expect, it } from 'vitest'
import { compileOutput } from '../../../src/commands/generate/generate.js'

it('output generation - ajv', async () => {
    expect(
        await compileOutput(['examples/restclients/ajv/apimatic/apimatic.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('output generation - zod 3', async () => {
    expect(
        await compileOutput(['examples/restclients/zod-v3/apimatic/apimatic.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('output generation - zod 4', async () => {
    expect(
        await compileOutput(['examples/restclients/zod-v4/apimatic/apimatic.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
