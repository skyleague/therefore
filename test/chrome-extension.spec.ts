import { compileOutputFiles } from '../src/commands/generate/generate.js'

import { expect, describe, it } from 'vitest'

describe('schema', () => {
    it('typedoc', async () => {
        expect(
            await compileOutputFiles(['examples/chrome/extension.schema.ts'], {
                outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
                cwd: process.cwd(),
                compile: false,
            })
        ).toMatchSnapshot()
    })
})
