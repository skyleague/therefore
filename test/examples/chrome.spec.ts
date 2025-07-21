import { expect, it } from 'vitest'
import { compileOutput } from '../../src/commands/generate/generate.js'

it('chrome', async () => {
    expect(
        await compileOutput(['examples/chrome/extension.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
