import { arbitrary } from './arbitrary/arbitrary.js'
import { toJsonSchema } from './jsonschema/jsonschema.js'

import { $array } from '../primitives/array/array.js'
import { $boolean } from '../primitives/boolean/boolean.js'
import { $integer } from '../primitives/integer/integer.js'
import { $null } from '../primitives/null/null.js'
import { $number } from '../primitives/number/number.js'
import { $object } from '../primitives/object/object.js'
import { $string } from '../primitives/string/string.js'
import { $unknown } from '../primitives/unknown/unknown.js'

import { forAll } from '@skyleague/axioms'
import { it } from 'vitest'

it('string', () => {
    const arb = $string()
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('number', () => {
    const arb = $number()
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('integer', () => {
    const arb = $integer({ max: 600 })
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('boolean', () => {
    const arb = $boolean()
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('null', () => {
    const arb = $null()
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('unknown', () => {
    const arb = $unknown()
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('object', () => {
    const arb = $object({ foo: $string() })
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})

it('array', () => {
    const arb = $array($unknown)
    const val = toJsonSchema(arb, { compile: true })
    forAll(arbitrary(arb), (x) => val.validator?.(x))
})
