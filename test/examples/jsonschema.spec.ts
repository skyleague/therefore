import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'
import { Defaults, Keyword, Person, SalesPerson, SelfReference } from '../../examples/jsonschema/example.type.js'
import { compileOutput } from '../../src/commands/generate/generate.js'
import { arbitrary } from '../../src/lib/visitor/arbitrary/arbitrary.js'

it('output generation', async () => {
    expect(
        await compileOutput(['examples/jsonschema/example.schema.ts'], {
            cwd: process.cwd(),
        }),
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

it('Keyword', () => {
    forAll(arbitrary(Keyword), (x) => Keyword.is(x))
})

it('Person', () => {
    forAll(arbitrary(Person), (x) => Person.is(x))
})

it('SalesPerson', () => {
    forAll(arbitrary(SalesPerson), (x) => SalesPerson.is(x))
})

it('SelfReference', () => {
    forAll(arbitrary(SelfReference), (x) => SelfReference.is(x))
})
