import { SalesPerson } from '../examples/json-schema/example.type'
import { arbitrary } from '../src'
import { compileOutputFiles } from '../src/commands/generate/generate'

import { forAll } from '@skyleague/axioms'

test('intersection', async () => {
    forAll(await arbitrary(SalesPerson), (x) => SalesPerson.is(x))
})

test('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/json-schema/example.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})
