import {} from '../examples/datumbox/datumbox.type'
import { compileOutputFiles } from '../src/commands/generate/generate'

test('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/datumbox/datumbox.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})
