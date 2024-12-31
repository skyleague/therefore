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
    const schema = $string()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    forAll(arbitrary($string()), isString)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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

it('date', () => {
    const schema = $string().date()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($string({ format: 'date' })), (x) => new Date(x).toISOString().split('T')[0] === x)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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

it('datetime', () => {
    const schema = $string().datetime()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        if (compiled.is(x)) {
            return true
        }
        throw new Error(JSON.stringify(compiled.errors))
    })

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "2120-10-18T16:27:55.000Z",
        "2190-07-31T00:32:52.000Z",
        "2019-05-01T09:57:56.000Z",
        "2003-08-07T03:30:29.000-09:41",
        "2101-04-30T06:06:24.000+09:56",
        "2233-04-26T10:38:52.000Z",
        "2061-11-04T23:43:45.000Z",
        "2039-12-17T17:33:48.000+11:19",
        "2095-12-10T18:43:21.000-08:54",
        "2072-02-26T05:13:58.000Z",
      ]
    `)
})

it('number', () => {
    const schema = $number()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($number()), isNumber)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        218084955.5757966,
        -987316204.8333645,
        -123414344.79032564,
        -1991294021.561513,
        1312757734.419653,
        -1984378057.5129266,
        -1806577500.5932693,
        -468159076.21629095,
        -1373641555.943141,
        -1507935663.7794366,
      ]
    `)
})

it('integer', () => {
    const schema = $integer()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($integer()), isNumber)
    forAll(arbitrary($integer()), isInteger)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        218084956,
        -987316205,
        -123414345,
        -1991294022,
        1312757735,
        -1984378058,
        -1806577501,
        -468159076,
        -1373641556,
        -1507935664,
      ]
    `)
})

it('boolean', () => {
    const schema = $boolean()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($boolean()), isBoolean)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
      ]
    `)
})

it('null', () => {
    const schema = $null()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($null()), (x) => x === null)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]
    `)
})

it('array', () => {
    const schema = $array($unknown())
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($array($unknown())), isArray)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        [
          true,
          1312757735,
          -1806577501,
          "",
          -998293442.9723692,
          undefined,
        ],
        [
          {},
        ],
        [
          "󮲰",
          {
            "TK?1": false,
          },
          false,
          {},
          "𶊧",
          {},
          "",
        ],
        [
          null,
          643485404.8784003,
        ],
        [
          "񤰹",
          {
            ")U'": 814790767,
          },
          null,
          "",
          {
            "cvZDX|T": 1403384848,
          },
          -778923280,
          1866760029,
          {},
        ],
        [
          null,
        ],
        [
          "􉚑",
          "󮉐",
          undefined,
          1338156962,
        ],
        [
          {},
          "󹖜",
          undefined,
          undefined,
          [],
          undefined,
        ],
        [
          {},
          null,
          true,
          null,
        ],
        [
          127942225,
          706702613,
          -661441363.1612315,
          [
            1707729668,
          ],
          {
            "&TsF%Z-": 564074427,
          },
        ],
      ]
    `)
})

it('boolean - tuple', () => {
    const schema = $tuple([$boolean()])
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary($tuple([$boolean()])), (x) => x.length === 1 && isBoolean(x[0]))

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        [
          false,
        ],
        [
          true,
        ],
        [
          true,
        ],
        [
          true,
        ],
        [
          false,
        ],
        [
          true,
        ],
        [
          true,
        ],
        [
          true,
        ],
        [
          true,
        ],
        [
          true,
        ],
      ]
    `)
})

it('object - with index', () => {
    const schema = new JSONObjectType({ shape: {}, recordType: $string() })
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })
    forAll(arbitrary(new JSONObjectType({ shape: {}, recordType: $string() })), isObject)

    const ctx = arbitraryContext({ rng: xoroshiro128plus(44n) })
    const arb = arbitrary(schema)
    expect(arb.sample(ctx)).toMatchInlineSnapshot(`
      {
        "#": "P",
        "*\\fr": "X6.sj",
        ",CzE": "ED3",
        "9ic4=<o": "",
        "9mB": "|",
        "LqDK^rK": ":",
        "]'X<Z": "iYS",
        "q": "^kVBIfS@",
        "sbDhV-GR\`": "aj",
      }
    `)
})

it('optional - primitive', () => {
    const schema = $object({ foo: $optional($string()) })
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })

    forAll(
        arbitrary<{ foo?: string | undefined }>($object({ foo: $optional($string()) })),
        (x) => isString(x.foo) || x.foo === undefined,
    )

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(arb.sample(ctx)).toMatchInlineSnapshot(`
      {
        "foo": "L#",
      }
    `)
})

it('format - date', () => {
    const schema = $string({ format: 'date' })
    const compiled = schema.compile()
    forAll(arbitrary(schema), (x) => {
        return compiled.is(x)
    })

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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

it('format - datetime', () => {
    const schema = $string().datetime()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })

    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 20 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "2120-10-18T16:27:55.000Z",
        "2190-07-31T00:32:52.000Z",
        "2019-05-01T09:57:56.000Z",
        "2003-08-07T03:30:29.000-09:41",
        "2101-04-30T06:06:24.000+09:56",
        "2233-04-26T10:38:52.000Z",
        "2061-11-04T23:43:45.000Z",
        "2039-12-17T17:33:48.000+11:19",
        "2095-12-10T18:43:21.000-08:54",
        "2072-02-26T05:13:58.000Z",
        "2113-10-12T14:31:00.000Z",
        "2102-10-26T07:45:40.000-03:56",
        "2148-10-23T17:37:56.000Z",
        "1991-11-13T16:12:13.000Z",
        "2096-07-15T22:49:58.000Z",
        "2155-02-27T10:21:48.000+10:37",
        "2075-12-08T13:32:19.000+12:33",
        "2042-01-17T05:45:24.000-12:19",
        "1974-07-08T19:59:54.000+10:02",
        "2012-12-18T03:41:55.000-02:29",
      ]
    `)
})

it('format - time', () => {
    const schema = $string().time()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "16:27:55.000Z",
        "00:32:52.000Z",
        "09:57:56.000Z",
        "03:30:29.000-09:41",
        "06:06:24.000+09:56",
        "10:38:52.000Z",
        "23:43:45.000Z",
        "17:33:48.000+11:19",
        "18:43:21.000-08:54",
        "05:13:58.000Z",
      ]
    `)
})

it('format - hostname', () => {
    const schema = $string().hostname()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "jb3bcog.f1e9.ery689quq.essgy",
        "l4h7nof.iiy3r2n.8lduccztq.e0z07wov9uj3.ha",
        "6f.tst-r7.5d4x8jp37.z2byq6pvk.nmanaq",
        "m8e7700cu6o.pd",
        "wi15dzbyd.7-70c4nz.ekpsdimabiqe",
        "ho7kew.k69r0w.ejgnnd",
        "erdya6rj.anb",
        "bzbc5z9-s.fbrgyeee7wg.gbt.eaxg",
        "a29st3ph9jef.dldywyn",
        "vs8mvs9g56k.pnt.iwbvpex",
      ]
    `)
})

it('format - email', () => {
    const schema = $string().email()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "ksb6bdp@je-fzry689p.liessgyx",
        "s7h_@ftiy2.19ylduc.rn",
        "e.212_@vuj4ala87bfupr.976zd4x7.o70x2byq6pvk.nmanaq",
        "n6+@60cu6pcwfow.fsvcraqcw",
        "gqy3fntbdozh@n7kexko.80xphoju.ddcplcq",
        "8@etc.bzbc5z9-sf6.le",
        "efe_xggh@ja9ia.xt",
        "uv6qi-kfgvfs@5ulw5s8mvs9g55.kdjnm",
        "_b8yh@557bzjpxg.vze.0dfke5bc.zu8xyih.xhpjfrdxao",
        "3ruk+@url5b3cogfygz5.j7eyflf-3qizb.bsglptxxga",
      ]
    `)
})

it('format - uuid', () => {
    const schema = $string().uuid()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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
    const schema = $string().uri()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "https://q3.bo.dgs/y",
        "http://59qurmg01j-7.l4h7nof.iiy3r2n.qhcobbrnldyr/wnv8tj3ala",
        "https://bup.r-r76zd.38jp370x.2y.vkohjn:1082/",
        "https://m8e7700cu6o.pd:41375/04",
        "http://bd7u-70c3.n-gpx1fmr.bm.elfjjwhdp/",
        "https://rxphojute.fwr.da6rjebtc.wy.abvrxymdw/",
        "http://de7.vgg.bjga9ia.xt/3oh8j",
        "http://tre.wynhpumxiomy/kpentsm6b",
        "https://g86t57bzjpxg.gazek0qd.fe5bc.rioxpq/",
        "https://loh0e8bu.opsj8k-v8r.lb3cogfygz5.k77e.didyulgrb/",
      ]
    `)
})

it('format - ipv4', () => {
    const schema = $string().ipv4()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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
    const schema = $string().ipv6()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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
    const schema = $string().base64()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
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
    const schema = $string().ulid()
    const compiled = schema.compile()
    forAll(arbitrary(schema), (s) => {
        return compiled.is(s)
    })
    const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
    const arb = arbitrary(schema)
    expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
      [
        "4CZYV5Q4V78MKC04SAF2JDHDSN",
        "099X1VMW20SRZHFSKB16WCPDKW",
        "0MA78A6T0ZCGC7B6Y85RFY9B0E",
        "163TX50E3P8HZM0F87QHPC4HMC",
        "0ZD82B5NRKZDK8WNAR4AQXSB6J",
        "5GESDP91ZJFB5JM7D7MZFKERGQ",
        "70QW7HM1E5Y2S8JHFDYRTE49KG",
        "3FXGJS2DN7HTHKTKYNEPJP4C82",
        "2NW2SFSDQW5ZC8RP4HQ4JC2NKT",
        "5ZJ70F8WDF85N3T0JZZDYBP1V3",
      ]
    `)
})
