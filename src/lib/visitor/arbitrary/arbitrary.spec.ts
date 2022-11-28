import { arbitrary } from './arbitrary'

import { $array, $boolean, $integer, $null, $object } from '../../primitives'
import { $number } from '../../primitives/number'
import { $optional } from '../../primitives/optional'
import { $string } from '../../primitives/string'
import { $unknown } from '../../primitives/unknown'

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

test('string', () => {
    forAll(arbitrary($string()), isString)
})

test('date', () => {
    forAll(arbitrary<string>($string({ format: 'date' })), (x) => toISO8601Date(new Date(x), { format: 'date' }) === x)
})

test('date-time', () => {
    forAll(arbitrary<string>($string({ format: 'date-time' })), (x) => toISO8601Date(new Date(x)) === x)
})

test('number', () => {
    forAll(arbitrary($number()), isNumber)
})

test('integer', () => {
    forAll(arbitrary($integer()), isNumber)
    forAll(arbitrary($integer()), isInteger)
})

test('boolean', () => {
    forAll(arbitrary($boolean()), isBoolean)
})

test('null', () => {
    forAll(arbitrary($null()), (x) => x === null)
})

test('array', () => {
    forAll(arbitrary($array($unknown)), isArray)
})

test('object - with index', () => {
    const arb = arbitrary($object({}, { indexSignature: $string() }))
    forAll(arb, isObject)
    expect(arb.value({ rng: xoroshiro128plus(42n) })).toMatchInlineSnapshot(`
        {
          "children": {
            Symbol(Symbol.iterator): [Function],
          },
          "value": {
            "")qvP3BgY": "k:7Fr@",
            "#ol7": ",k'{/$G",
            "(;\\mM": "/h",
            "-Bx": "FNS\`u^-#",
            ";4An)Z{": "9a4qi!Zl5",
            "Hc/" EK%": "rrBE",
            "T w{nBD": "4IsT&)",
            "h4ym": "\` ",
            "lBQs59@LE": "\\ojh",
          },
        }
    `)
})

test('optional - primitive', () => {
    forAll(arbitrary<{ foo?: string }>($object({ foo: $optional($string()) })), (x) => isString(x.foo) || x.foo === undefined)
})

test('union with enum and supertype', () => {
    forAll(arbitrary<{ foo?: string }>($object({ foo: $optional($string()) })), (x) => isString(x.foo) || x.foo === undefined)
})
