import { Theme, Typedoc } from '../examples/typedoc/typedoc.type.js'
import { compileOutputFiles } from '../src/commands/generate/generate.js'
import { arbitrary } from '../src/index.js'

import { forAll } from '@skyleague/axioms'

test('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/typedoc/typedoc.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})

test('arbitrary typedoc', () => {
    forAll(arbitrary(Typedoc), (p) => Typedoc.assert(p))
})

test('arbitrary theme', () => {
    forAll(arbitrary(Theme), (t) => Theme.assert(t))
})
