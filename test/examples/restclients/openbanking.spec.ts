import { compileOutput } from '../../../src/commands/generate/generate.js'

import { expect, it } from 'vitest'

it('output generation', async () => {
    expect(
        await compileOutput(['examples/restclients/openbanking/banking.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
