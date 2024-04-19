import { compileOutput } from '../src/commands/generate/generate.js'

import { expect, it } from 'vitest'

it('output generation', async () => {
    expect(
        await compileOutput(['src/types/openapi.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
