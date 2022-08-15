import { compileOutputFiles } from '../src/commands/generate/generate'

describe('schema', () => {
    test('typedoc', async () => {
        expect(
            await compileOutputFiles(['examples/typedoc/typedoc.schema.ts'], {
                outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
                cwd: process.cwd(),
                compile: false,
            })
        ).toMatchSnapshot()
    })
})
