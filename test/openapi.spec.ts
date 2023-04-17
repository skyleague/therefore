import { compileOutputFiles } from '../src/commands/generate/generate.js'

import { expect, it } from 'vitest'

it('output generation', async () => {
    expect(
        await compileOutputFiles(['src/lib/primitives/restclient/openapi.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})
