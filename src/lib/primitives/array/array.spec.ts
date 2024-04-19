import type { ArrayType } from './array.js'
import { $array } from './array.js'

import type { Intrinsic } from '../../cst/types.js'
import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'
import { $boolean } from '../boolean/boolean.js'
import type { StringType } from '../string/string.js'
import { $string } from '../string/string.js'

import {
    arbitraryContext,
    collect,
    constant,
    forAll,
    natural,
    repeat,
    take,
    tuple,
    unique,
    xoroshiro128plus,
} from '@skyleague/axioms'
import type { Equal, Expect } from 'type-testing'
import { expect, expectTypeOf, it } from 'vitest'

it('simple', () => {
    expect($array($boolean())).toMatchInlineSnapshot(`
      NodeTrait {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          BooleanType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "1",
            "isCommutative": true,
            "options": {},
            "type": "boolean",
          },
        ],
        "definition": {},
        "element": BooleanType {
          "attributes": {
            "generic": {},
            "typescript": {},
          },
          "definition": {},
          "id": "1",
          "isCommutative": true,
          "options": {},
          "type": "boolean",
        },
        "id": "2",
        "isCommutative": false,
        "options": {},
        "type": "array",
      }
    `)
})

it('simple unexpanded', () => {
    expect($array($boolean)).toMatchInlineSnapshot(`
      NodeTrait {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          BooleanType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "2",
            "isCommutative": true,
            "options": {},
            "type": "boolean",
          },
        ],
        "definition": {},
        "element": BooleanType {
          "attributes": {
            "generic": {},
            "typescript": {},
          },
          "definition": {},
          "id": "2",
          "isCommutative": true,
          "options": {},
          "type": "boolean",
        },
        "id": "1",
        "isCommutative": false,
        "options": {},
        "type": "array",
      }
    `)
})

it('types', () => {
    const schema = $array($string())
    expectTypeOf(schema.infer).toEqualTypeOf<string[]>()
    type _test_intrinsic = Expect<Equal<Intrinsic<typeof schema>, ArrayType<StringType>>>

    expectTypeOf(schema.definition.default).toEqualTypeOf<string[] | undefined>()
    expectTypeOf(schema.definition.jsonschema?.examples).toEqualTypeOf<string[][] | undefined>()
})

it('minItems', () => {
    forAll(
        natural({ max: 100 }).chain((minItems) => {
            return tuple(constant(minItems), arbitrary($array($boolean(), { minItems })))
        }),
        ([minItems, xs]) => {
            expect(xs.length).toBeGreaterThanOrEqual(minItems)
        },
    )
    forAll(
        natural({ max: 100 }).chain((minItems) => {
            return tuple(constant(minItems), arbitrary($array($boolean()).minItems(minItems)))
        }),
        ([minItems, xs]) => {
            expect(xs.length).toBeGreaterThanOrEqual(minItems)
        },
    )
})

it('maxItems', () => {
    forAll(
        natural({ max: 100 }).chain((maxItems) => {
            return tuple(constant(maxItems), arbitrary($array($boolean(), { maxItems })))
        }),
        ([maxItems, xs]) => {
            expect(xs.length).toBeLessThanOrEqual(maxItems)
        },
    )
    forAll(
        natural({ max: 100 }).chain((maxItems) => {
            return tuple(constant(maxItems), arbitrary($array($boolean()).maxItems(maxItems)))
        }),
        ([maxItems, xs]) => {
            expect(xs.length).toBeLessThanOrEqual(maxItems)
        },
    )
})

it('nonempty', () => {
    forAll(arbitrary($array($boolean()).nonempty()), (xs) => {
        expect(xs.length).toBeGreaterThanOrEqual(1)
    })
})

it('set', () => {
    forAll(arbitrary($array($string()).set()), (xs) => {
        expect(xs.length).toEqual(collect(unique(xs)).length)
    })
})

it('random sample', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($array($string()))
    expect(
        collect(
            take(
                repeat(() => arb.sample(ctx)),
                10,
            ),
        ),
    ).toMatchInlineSnapshot(`
      [
        [
          "L#",
          "#'E1.9e+",
          ",aM^sy{ITK",
          "1dg",
          "}x",
          "Ko2",
        ],
        [
          "D.7Q",
          "]k",
          "hCz^<",
          "U",
          "",
          "",
          "RK+}b\`c",
          "ZDX|T8n!>!",
          "v#.THNR|Lw",
          "a)m[x7Fjw",
        ],
        [
          "i#_JsGW",
          "CSN",
          "",
          "#_1@n",
          ",uvdd&TsF%",
          "-D[d6g",
          ")a#\`)wU~v",
        ],
        [
          "",
          "Bb|/H[f-?",
          "#'A]1",
          "4DEu:",
          "[",
          "Et{",
          "c[F2D",
        ],
        [
          "R,/+YM",
          "^",
        ],
        [],
        [
          "8+"Q&",
          "$ab#&r",
          "z}P.t"M",
          "]",
          ",",
          "w",
          "001$S9",
          "!z",
          " "",
        ],
        [
          "|PQmG4{8",
          ".",
          ",L-~s",
          "S=YoNx?WP{",
          "q",
          ":H,CSO@v$",
          "Z1zxsSqu$",
          "7H\\12W ",
          "+:dI(/<",
          "q",
        ],
        [],
        [],
      ]
    `)
})
