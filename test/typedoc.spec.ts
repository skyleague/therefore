import { Theme, Typedoc } from '../examples/typedoc/typedoc.type'
import { toArbitrary } from '../src'
import { compileOutputFiles } from '../src/commands/generate/generate'

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

test('arbitrary typedoc', async () => {
    forAll(await toArbitrary(Typedoc), (p) => Typedoc.assert(p))
})

test('arbitrary theme', async () => {
    forAll(await toArbitrary(Theme), (t) => Theme.assert(t))
})