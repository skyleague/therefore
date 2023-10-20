import { arbitrary } from './arbitrary/arbitrary.js'
import { toJsonSchema } from './jsonschema/jsonschema.js'

import { $boolean } from '../primitives/boolean/index.js'
import { $array, $null, $object } from '../primitives/index.js'
import { $integer } from '../primitives/integer/index.js'
import { $number } from '../primitives/number/index.js'
import { $string } from '../primitives/string/index.js'
import { $unknown } from '../primitives/unknown/index.js'

import { forAll } from '@skyleague/axioms'
import { it } from 'vitest'

it('string', async () => {
    const arb = $string()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('number', async () => {
    const arb = $number()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('integer', async () => {
    const arb = $integer({ maximum: 600 })
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('boolean', async () => {
    const arb = $boolean()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('null', async () => {
    const arb = $null()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('unknown', async () => {
    const arb = $unknown()
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('object', async () => {
    const arb = $object({ foo: $string() }, { indexSignature: $unknown() })
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})

it('array', async () => {
    const arb = $array($unknown)
    const val = toJsonSchema(arb, true)
    forAll(await Promise.resolve(arbitrary(arb)), (x) => val.validator(x))
})
