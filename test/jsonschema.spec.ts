import { Defaults, SalesPerson } from '../examples/jsonschema/example.type.js'
import { compileOutputFiles } from '../src/commands/generate/generate.js'
import { arbitrary } from '../src/index.js'

import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('intersection', () => {
    forAll(arbitrary(SalesPerson), (x) => SalesPerson.is(x))
})

it('output generation', async () => {
    expect(
        await compileOutputFiles(['examples/jsonschema/example.schema.ts'], {
            outputFileRename: (file: string) => file.replace('.ts', '.type.ts'),
            cwd: process.cwd(),
            compile: true,
        })
    ).toMatchSnapshot()
})

it('defaults', () => {
    forAll(arbitrary(Defaults), (x) => Defaults.is(x))
})

it('defaults empty object', () => {
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
