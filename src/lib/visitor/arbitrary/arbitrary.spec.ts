import { arbitrary } from './arbitrary.js'

import { $array } from '../../primitives/array/array.js'
import { $boolean } from '../../primitives/boolean/boolean.js'
import { $integer } from '../../primitives/integer/integer.js'
import { JSONObjectType } from '../../primitives/jsonschema/jsonschema.js'
import { $null } from '../../primitives/null/null.js'
import { $number } from '../../primitives/number/number.js'
import { $object } from '../../primitives/object/object.js'
import { $optional } from '../../primitives/optional/optional.js'
import { $string } from '../../primitives/string/string.js'
import { $unknown } from '../../primitives/unknown/unknown.js'

import {
    arbitraryContext,
    forAll,
    isArray,
    isBoolean,
    isInteger,
    isNumber,
    isObject,
    isString,
    toISO8601Date,
    xoroshiro128plus,
} from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('string', () => {
    forAll(arbitrary($string()), isString)
})

it('date', () => {
    forAll(arbitrary($string({ format: 'date' })), (x) => toISO8601Date(new Date(x), { format: 'date' }) === x)
})

it('date-time', () => {
    forAll(arbitrary($string({ format: 'date-time' })), (x) => toISO8601Date(new Date(x)) === x)
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
    const arb = arbitrary(new JSONObjectType({ shape: {}, recordType: $string() }))
    forAll(arb, isObject)
    expect(arb.value(arbitraryContext({ rng: xoroshiro128plus(44n) }))).toMatchInlineSnapshot(`
      {
        "children": {
          Symbol(Symbol.iterator): [Function],
        },
        "value": {
          "#": "P",
          "*\\fr": "X6.sj",
          ",CzE": "ED3",
          "9ic4=<o": "",
          "9mB": "|",
          "LqDK^rK": ":",
          "]'X<Z": "iYS",
          "q": "^kVBIfS@",
          "sbDhV-GR\`": "aj",
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
