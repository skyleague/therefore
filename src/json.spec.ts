import { compileOutputFiles } from './commands/generate/generate.js'

import { expect, it } from 'vitest'

it('json', async () => {
    expect(
        await compileOutputFiles(['examples/json/json.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: false,
        })
    ).toMatchSnapshot()
})

it('simple', async () => {
    expect(
        await compileOutputFiles(['examples/json/simple.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: false,
        })
    ).toMatchSnapshot()
})
