import { arbitrary } from './arbitrary.js'

import { $array, $boolean, $integer, $null, $object } from '../../primitives/index.js'
import { $number } from '../../primitives/number/index.js'
import { $optional } from '../../primitives/optional/index.js'
import { $string } from '../../primitives/string/index.js'
import { $unknown } from '../../primitives/unknown/index.js'

import {
    forAll,
    isInteger,
    isNumber,
    isString,
    isBoolean,
    isArray,
    toISO8601Date,
    isObject,
    xoroshiro128plus,
} from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('string', () => {
    forAll(arbitrary($string()), isString)
})

it('date', () => {
    forAll(arbitrary<string>($string({ format: 'date' })), (x) => toISO8601Date(new Date(x), { format: 'date' }) === x)
})

it('date-time', () => {
    forAll(arbitrary<string>($string({ format: 'date-time' })), (x) => toISO8601Date(new Date(x)) === x)
})

it('number', () => {
    forAll(arbitrary($number()), isNumber)
})

it('integer', () => {
    forAll(arbitrary($integer()), isNumber)
    forAll(arbitrary($integer()), isInteger)
})

it('boolean', () => {
    forAll(arbitrary($boolean()), isBoolean)
})

it('null', () => {
    forAll(arbitrary($null()), (x) => x === null)
})

it('array', () => {
    forAll(arbitrary($array($unknown)), isArray)
})

it('object - with index', () => {
    const arb = arbitrary($object({}, { indexSignature: $string() }))
    forAll(arb, isObject)
    expect(arb.value({ rng: xoroshiro128plus(44n) })).toMatchInlineSnapshot(`
      {
        "children": {
          Symbol(Symbol.iterator): [Function],
        },
        "value": {
          """: "ED3",
          "*[e": "hXR",
          ",CyD": "^jVAIeR?",
          "9hb4=;": ":",
          "\\'X<Y": "\\LpDK]qJ",
          "_A9lB": "6\`i*{0P",
          "p": "",
          "rraCgV-F": "X6-r",
        },
      }
    `)
})

it('optional - primitive', () => {
    forAll(arbitrary<{ foo?: string }>($object({ foo: $optional($string()) })), (x) => isString(x.foo) || x.foo === undefined)
})

it('union with enum and supertype', () => {
    forAll(arbitrary<{ foo?: string }>($object({ foo: $optional($string()) })), (x) => isString(x.foo) || x.foo === undefined)
})
