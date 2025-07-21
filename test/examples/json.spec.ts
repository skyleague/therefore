import { expect, it } from 'vitest'
import { compileOutput } from '../../src/commands/generate/generate.js'

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
