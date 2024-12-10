import { $string } from './string.js'

import { arbitrary } from '../../visitor/arbitrary/arbitrary.js'

import { arbitraryContext, constant, forAll, natural, tuple, xoroshiro128plus } from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('function', () => {
    expect($string).toMatchInlineSnapshot('[Function]')
})

it('pattern', () => {
    expect(
        $string({
            regex: /foo/,
        }),
    ).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_options": {
          "regex": /foo/,
        },
        "_type": "string",
      }
    `)
})

it('format', () => {
    expect(
        $string({
            format: 'date',
        }),
    ).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_options": {
          "format": "date",
        },
        "_type": "string",
      }
    `)
})

it('all', () => {
    expect(
        $string({
            minLength: 2,
            maxLength: 2,
            regex: /foo/,
        }),
    ).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_options": {
          "maxLength": 2,
          "minLength": 2,
          "regex": /foo/,
        },
        "_type": "string",
      }
    `)
})

it('minLength', () => {
    forAll(
        natural({ max: 100 }).chain((minLength) => {
            return tuple(constant(minLength), arbitrary($string({ minLength })))
        }),
        ([minLength, xs]) => {
            expect(xs.length).toBeGreaterThanOrEqual(minLength)
        },
    )
    forAll(
        natural({ max: 100 }).chain((minLength) => {
            return tuple(constant(minLength), arbitrary($string().minLength(minLength)))
        }),
        ([minLength, xs]) => {
            expect(xs.length).toBeGreaterThanOrEqual(minLength)
        },
    )
})

it('maxLength', () => {
    forAll(
        natural({ max: 100 }).chain((maxLength) => {
            return tuple(constant(maxLength), arbitrary($string({ maxLength })))
        }),
        ([maxLength, xs]) => {
            expect(xs.length).toBeLessThanOrEqual(maxLength)
        },
    )
    forAll(
        natural({ max: 100 }).chain((maxLength) => {
            return tuple(constant(maxLength), arbitrary($string().maxLength(maxLength)))
        }),
        ([maxLength, xs]) => {
            expect(xs.length).toBeLessThanOrEqual(maxLength)
        },
    )
})

it('random sample', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string())
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "9L#l#'",
        "1.9e",
        "}",
        "a",
        "^sy{I",
        "K?1dg8",
        "x?Ko2vCD.7",
        "5]kNh",
        "z^<)",
        "'&aRK+",
      ]
    `)
})

it('random sample - date', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string().date())
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "2120-10-18",
        "2043-12-16",
        "2099-01-10",
        "1979-12-16",
        "2190-07-31",
        "1980-05-25",
        "1991-09-25",
        "2077-01-18",
        "2019-05-01",
        "2010-10-08",
      ]
    `)
})

it('random sample - datetime', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string().datetime())
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "2120-10-18T16:27:55.000Z",
        "2043-12-16T06:04:41.000Z",
        "2099-01-10T12:51:38.000Z",
        "1979-12-16T13:45:18.000Z",
        "2190-07-31T00:32:52.000Z",
        "1980-05-25T14:21:03.000Z",
        "1991-09-25T08:09:16.000Z",
        "2077-01-18T19:43:49.000Z",
        "2019-05-01T09:57:56.000Z",
        "2010-10-08T15:17:06.000Z",
      ]
    `)
})

it('random sample - hostname', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string().hostname())
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "jb3bcog.f1e9.ery689quq.g00j9",
        "l4h7nof.iiy3r2n.8lduccztq.e0z07wov9uj3.la",
        "6f.tst-r7.5d4x8jp37.z2byq6pvk.tratbx",
        "m8e7700cu6o.we",
        "wi15dzbyd.7-70c4nz.fpw0emrbcmxg",
        "ho7kew.k69r0w.gniute",
        "erdya6rj.asc",
        "bzbc5z9-s.fbrgyeee7wg.gbt.ga8i",
        "a29st3ph9jef.eqe959t",
        "vs8mvs9g56k.pnt.m6b4wg8",
      ]
    `)
})
