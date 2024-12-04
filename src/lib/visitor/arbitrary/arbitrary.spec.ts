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
    xoroshiro128plus,
} from '@skyleague/axioms'
import { expect, it } from 'vitest'
import { $tuple } from '../../primitives/tuple/tuple.js'

it('string', () => {
    forAll(arbitrary($string()), isString)
})

it('date', () => {
    forAll(arbitrary($string({ format: 'date' })), (x) => new Date(x).toISOString().split('T')[0] === x)
})

it('date-time', () => {
    forAll(arbitrary($string({ format: 'date-time' })), (x) => new Date(x).toISOString() === x)
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

it('boolean - tuple', () => {
    forAll(arbitrary($tuple([$boolean()])), (x) => x.length === 1 && isBoolean(x[0]))
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
    forAll(
        arbitrary<{ foo?: string | undefined }>($object({ foo: $optional($string()) })),
        (x) => isString(x.foo) || x.foo === undefined,
    )
})

it('union with enum and supertype', () => {
    forAll(
        arbitrary<{ foo?: string | undefined }>($object({ foo: $optional($string()) })),
        (x) => isString(x.foo) || x.foo === undefined,
    )
})

it('format - date', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'date' }))
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

it('format - date-time', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'date-time' }))
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

it('format - time', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'time' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "16:27:55.000Z",
        "06:04:41.000Z",
        "12:51:38.000Z",
        "13:45:18.000Z",
        "00:32:52.000Z",
        "14:21:03.000Z",
        "08:09:16.000Z",
        "19:43:49.000Z",
        "09:57:56.000Z",
        "15:17:06.000Z",
      ]
    `)
})

it('format - hostname', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'hostname' }))
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

it('format - email', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'email' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "zb+c.v.io%.~h.z9^{|x4ys.%&n.{ry/k\`uuin2l@22n9yld.uc.yre-0zz.wnv8tj3ala76",
        "3x@tr76zd4x8jp2.7x2byq6pv.ntrat",
        "js-{g__%@c6pcwfow.015d.yy.7u9",
        "d-t#}iw7&.s0.e.9jzlu._ph7p._|z$8.kun42.ig.zf9b^0ng.2.7@ybc5z9-sf.brgxdee7vgg",
        "3.ka|n.b@1st3ph9jefte.q-5.9lw5s8l.v9g56kp.nts",
        "c=7j|{^3=_c.nx8kk5a!g.%xfi.g=be.$t4{8@i18l.vh0e8b.u0psj7.9u8rl",
        "+.v.i9.!=q._\`h9.rh.+yn#c&d%oz7+.|oau6!ql3es1.0t*ce|j2\`jh.07#0m.pzs@stg85of9q.d9m0i-d.0a3.39ocgsu8.vt",
        "3_iheudh.l.p0n^#f01_8b.u}o6g!k+0bwj.=.6cg7|xi4{$0@t34434s.fi3nlbzo4c.rlhhz",
        "0}fxib_syb.89.l.'sszw2.s0/.1x.518.^wv'/mj.\`6lhtv/@gzc6ow8ge.stf00rwk2.rn1z45hjstpn",
        "3!u&r-4.r{_6.!enz|9_a.eo_{dd%x.{-9.cqx9.-w@24lu2.gnvilov",
      ]
    `)
})

it('format - uuid', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'uuid' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "935b684b-40f3-486f-9e2e-c404fd1e0e45",
        "d0eb1c7b-6308-478d-b582-4eb37858bf37",
        "95214947-77ee-42ff-8ecb-3c33338d58e6",
        "2ef07e18-d03a-4db9-9260-bd8efdd03e69",
        "194384df-f60a-408f-8af2-5cdf925b0933",
        "58014d8f-0e59-40c9-a8db-616022fb7e14",
        "3753b1dc-ea7e-43ad-8680-902d1069693a",
        "44e87e44-3702-45c9-9af0-74456013deb8",
        "a7de3320-11f3-4140-8e03-8893f0769da9",
        "e2c8d598-e4f8-4c57-a541-335a222110b4",
      ]
    `)
})

it('format - uri', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'uri' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "https://q3.bo.fj0y",
        "http://59qurmg01j-7.l4h7nof.iiy3r2n.xkduccytqe9zwnv8tj3ala",
        "https://bup.r-r76zd.38jp370x.2y.5pvknt:1082",
        "https://m8e7700cu6o.we:4137504",
        "http://bd7u-70c3.n-gpx1fmr.bm.grhno6kew",
        "https://rxphojute.fwr.da6rjebtc.wy.bc5y89sf6",
        "http://de7.vgg.bjga9ia.813oh8j",
        "http://tre.59tlv4r7lvs8kpentsm6b",
        "https://g86t57bzjpxg.gazek0qd.fe5bc.zmu7wy",
        "https://loh0e8bu.opsj8k-v8r.lb3cogfygz5.k77e.flf92qizb",
      ]
    `)
})

it('format - ipv4', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'ipv4' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "140.69.120.9",
        "206.9.20.100",
        "46.38.68.188",
        "31.251.34.176",
        "122.167.224.240",
        "246.111.142.117",
        "85.47.185.191",
        "65.251.237.85",
        "117.213.50.232",
        "95.98.40.63",
      ]
    `)
})

it('format - ipv6', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'ipv6' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "70c0:6224:1f2b:aeff:8752:b4fe:7d3e:6238",
        "c7c5:a419:1b87:fbab:969f:4d05:ee02:678f",
        "eb1c:e36c:bac0:7e69:6870:0a25:e2ee:b18e",
        "926a:3bd1:0a1e:feb1:5bf2:9b25:015a:7366",
        "2946:f7ba:3638:2219:1a0d:4108:90bb:1daf",
        "2e07:a121:9222:8420:300f:f88c:3f42:8272",
        "f849:7e59:f2de:6258:5e0d:2fee:de0a:6a23",
        "a14b:1241:016b:9eaa:3be5:63b1:096b:84e4",
        "f75d:c062:a2ad:4ee2:252f:73b0:1b47:cef4",
        "9a43:158e:5c01:28e2:679b:3347:c8a8:ed62",
      ]
    `)
})

it('format - base64', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'base64' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "ReCzCF==",
        "LJRv",
        "",
        "",
        "489b",
        "dVLuvQ==",
        "7Vd1M6XYKP==",
        "pyfx",
        "8pTG",
        "FEsidH==",
      ]
    `)
})

it('format - ulid', () => {
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary($string({ format: 'ulid' }))
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "EM763FXE3HIUTMAEZKPCSNRNZV",
        "0JJ5B3U4CAZY7RPZTLBG4MWNT4",
        "0UKHIKG2A7MQMHLG6IFYP6JLAO",
        "BGD25FAODWIR7UAPIHXRWMERUM",
        "07NICLFVYT7NTI4VKYEKX5ZLGS",
        "FQOZNWJB7SPLFSUHNHU7PTOYQX",
        "HAX4HRUBOF6CZISRPN6Y2OEJTQ",
        "DP5QSZCNVHR2RT2T6VOWSWEMIC",
        "CV4CZPZNX4F7MIYWERXESMCVT2",
        "F7SH0PI4NPIFVD2AS77N6LWB3D",
      ]
    `)
})
