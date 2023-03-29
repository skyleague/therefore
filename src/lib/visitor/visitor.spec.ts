import { arbitrary } from './arbitrary/arbitrary.js'
import { toJsonSchema } from './jsonschema/jsonschema.js'

import { $boolean } from '../primitives/boolean/index.js'
import { $array, $null, $object } from '../primitives/index.js'
import { $integer } from '../primitives/integer/index.js'
import { $number } from '../primitives/number/index.js'
import { $string } from '../primitives/string/index.js'
import { $unknown } from '../primitives/unknown/index.js'

import { forAll } from '@skyleague/axioms'

test('string', async () => {
    const arb = $string()
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('number', async () => {
    const arb = $number()
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('integer', async () => {
    const arb = $integer({ maximum: 600 })
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('boolean', async () => {
    const arb = $boolean()
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('null', async () => {
    const arb = $null()
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('unknown', async () => {
    const arb = $unknown()
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('object', async () => {
    const arb = $object({ foo: $string() }, { indexSignature: $unknown() })
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('array', async () => {
    const arb = $array($unknown)
    const val = await toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})
