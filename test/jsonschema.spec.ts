import { Defaults, SalesPerson } from '../examples/jsonschema/example.type'
import { arbitrary } from '../src'
import { compileOutputFiles } from '../src/commands/generate/generate'

import { forAll } from '@skyleague/axioms'

test('intersection', () => {
    forAll(arbitrary(SalesPerson), (x) => SalesPerson.is(x))
})

test('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/jsonschema/example.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})

test('defaults', () => {
    forAll(arbitrary(Defaults), (x) => Defaults.is(x))
})

test('defaults empty object', () => {
    const defaults = {}
    const isValid = Defaults.is(defaults)
    expect(isValid).toBeTruthy()
    expect(defaults).toMatchInlineSnapshot(`
        {
          "int": 42,
          "str": "foobar",
        }
    `)
})
