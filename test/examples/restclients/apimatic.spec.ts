import { compileOutput } from '../../../src/commands/generate/generate.js'

import { expect, it } from 'vitest'

it('output generation - ajv', async () => {
    expect(
        await compileOutput(['examples/restclients/ajv/apimatic/apimatic.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('output generation - zod', async () => {
    expect(
        await compileOutput(['examples/restclients/zod/apimatic/apimatic.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
