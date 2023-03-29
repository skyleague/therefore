import {} from '../examples/datumbox/datumbox.type.js'
import { compileOutputFiles } from '../src/commands/generate/generate.js'

test('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/datumbox/datumbox.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})
