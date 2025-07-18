import { expect, it } from 'vitest'
import { compileOutput } from '../src/commands/generate/generate.js'

it('output generation', async () => {
    expect(
        await compileOutput(['src/types/openapi.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
