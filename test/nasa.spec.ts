import { Project } from '../examples/nasa/astroids/nasa.type.js'
import { compileOutputFiles } from '../src/commands/generate/generate.js'
import { arbitrary } from '../src/index.js'

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

test('arbitrary', () => {
    forAll(arbitrary(Project), (p) => Project.is(p))
})
