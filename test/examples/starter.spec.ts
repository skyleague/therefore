import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'
import { Defaults } from '../../examples/jsonschema/example.type.js'
import { Cart } from '../../examples/starter/cart.type.js'
import { CartItem } from '../../examples/starter/item.type.js'
import { compileOutput } from '../../src/commands/generate/generate.js'
import { arbitrary } from '../../src/lib/visitor/arbitrary/arbitrary.js'

it('output generation', async () => {
    expect(
        await compileOutput(
            ['examples/starter/cart.schema.ts', 'examples/starter/defaults.schema.ts', 'examples/starter/item.schema.ts'],
            {
                cwd: process.cwd(),
            },
        ),
    ).toMatchSnapshot()
})

it('Cart', () => {
    forAll(arbitrary(Cart), (x) => Cart.is(x))
})

it('Defaults', () => {
    forAll(arbitrary(Defaults), (x) => Defaults.is(x))
})

it('CartItem', () => {
    forAll(arbitrary(CartItem), (x) => CartItem.is(x))
})
