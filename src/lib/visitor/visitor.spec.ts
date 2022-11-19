import { arbitrary } from './arbitrary/arbitrary'
import { toJsonSchema } from './jsonschema/jsonschema'

import { $array, $null, $object } from '../primitives'
import { $boolean } from '../primitives/boolean'
import { $integer } from '../primitives/integer'
import { $number } from '../primitives/number'
import { $string } from '../primitives/string'
import { $unknown } from '../primitives/unknown'

import { forAll } from '@skyleague/axioms'

test('string', async () => {
    const arb = $string()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('number', async () => {
    const arb = $number()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('integer', async () => {
    const arb = $integer({ maximum: 600 })
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('boolean', async () => {
    const arb = $boolean()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('null', async () => {
    const arb = $null()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('unknown', async () => {
    const arb = $unknown()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('object', async () => {
    const arb = $object({ foo: $string() }, { indexSignature: $unknown() })
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

test('array', async () => {
    const arb = $array($unknown)
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})
