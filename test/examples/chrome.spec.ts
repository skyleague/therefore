import { compileOutput } from '../../src/commands/generate/generate.js'

import { expect, it } from 'vitest'

it('chrome', async () => {
    expect(
        await compileOutput(['examples/chrome/extension.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
