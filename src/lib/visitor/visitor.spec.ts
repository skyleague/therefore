import { toArbitrary } from './arbitrary/arbitrary'
import { toJsonSchema } from './jsonschema/jsonschema'

import { $array, $null, $object } from '../primitives'
import { $boolean } from '../primitives/boolean'
import { $integer } from '../primitives/integer'
import { $number } from '../primitives/number'
import { $string } from '../primitives/string'
import { $unknown } from '../primitives/unknown'

import { forAll } from '@skyleague/axioms'

test('string', () => {
    const arb = $string()
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('number', () => {
    const arb = $number()
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('integer', () => {
    const arb = $integer({ maximum: 600 })
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('boolean', () => {
    const arb = $boolean()
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('null', () => {
    const arb = $null()
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('unknown', () => {
    const arb = $unknown()
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('object', () => {
    const arb = $object({ foo: $string() }, { indexSignature: $unknown() })
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})

test('array', () => {
    const arb = $array($unknown)
    const val = toJsonSchema(arb, true)
    forAll(toArbitrary(arb), (x) => val.validator(x))
})
