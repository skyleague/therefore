import { Project } from '../examples/nasa/astroids/nasa.type'
import { arbitrary } from '../src'
import { compileOutputFiles } from '../src/commands/generate/generate'

import { forAll } from '@skyleague/axioms'

test('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/nasa/nasa.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})

test('arbitrary', async () => {
    forAll(await arbitrary(Project), (p) => Project.is(p))
})
