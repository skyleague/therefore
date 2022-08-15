import { toArbitrary } from './arbitrary'

import { $array, $boolean, $integer, $null, $object } from '../../primitives'
import { $number } from '../../primitives/number'
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
    forAll(toArbitrary($string()), isString)
})

test('date', () => {
    forAll(toArbitrary<string>($string({ format: 'date' })), (x) => toISO8601Date(new Date(x), { format: 'date' }) === x)
})

test('date-time', () => {
    forAll(toArbitrary<string>($string({ format: 'date-time' })), (x) => toISO8601Date(new Date(x)) === x)
})

test('number', () => {
    forAll(toArbitrary($number()), isNumber)
})

test('integer', () => {
    forAll(toArbitrary($integer()), isNumber)
    forAll(toArbitrary($integer()), isInteger)
})

test('boolean', () => {
    forAll(toArbitrary($boolean()), isBoolean)
})

test('null', () => {
    forAll(toArbitrary($null()), (x) => x === null)
})

test('array', () => {
    forAll(toArbitrary($array($unknown)), isArray)
})

test('object - with index', () => {
    const arb = toArbitrary($object({}, { indexSignature: $string() }))
    forAll(arb, isObject)
    expect(arb.value({ rng: xoroshiro128plus(42n) })).toMatchInlineSnapshot(`
        Object {
          "children": Object {
            Symbol(Symbol.iterator): [Function],
          },
          "value": Object {
            "\\")qvP3BgY": "k:7Fr@",
            "#ol7": ",k'{/$G",
            "(;\\\\mM": "/h",
            "-Bx": "FNS\`u^-#",
            ";4An)Z{": "9a4qi!Zl5",
            "Hc/\\" EK%": "rrBE",
            "T w{nBD": "4IsT&)",
            "h4ym": "\` ",
            "lBQs59@LE": "\\\\ojh",
          },
        }
    `)
})
