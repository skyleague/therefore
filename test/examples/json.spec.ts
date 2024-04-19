import { compileOutput } from '../../src/commands/generate/generate.js'

import { expect, it } from 'vitest'

it('json', async () => {
    expect(
        await compileOutput(['examples/json/json.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('simple', async () => {
    expect(
        await compileOutput(['examples/json/simple.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})
