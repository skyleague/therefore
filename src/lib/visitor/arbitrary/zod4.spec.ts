import { arbitraryContext, forAll, integer, xoroshiro128plus } from '@skyleague/axioms'
import { describe, expect, it } from 'vitest'
import { z } from 'zod/v4'
import { $ref } from '../../primitives/ref/ref.js'
import type { StringType } from '../../primitives/string/string.js'
import { arbitrary } from './arbitrary.js'

describe('formats', () => {
    it('normal string', () => {
        const str = z.string()
        forAll(arbitrary(str), (s) => {
            str.parse(s)
        })

        const strRef: StringType = $ref(str)
        forAll(arbitrary(strRef), (s) => {
            str.parse(s)
        })
    })

    it('email', () => {
        const schema = z.email()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('url', () => {
        const schema = z.url()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('emoji', () => {
        const schema = z.emoji()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('uuid', () => {
        const schema = z.uuid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    }, 10000)

    it('guid', () => {
        const schema = z.guid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    }, 10000)

    it('nanoid', () => {
        const schema = z.nanoid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cuid', () => {
        const schema = z.cuid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cuid2', () => {
        const schema = z.cuid2()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('ulid', () => {
        const schema = z.ulid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('regex', () => {
        const schema = z.string().regex(/^[a-z]+$/)
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('includes', () => {
        const schema = z.string().includes('test')
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('startsWith', () => {
        const schema = z.string().startsWith('start')
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('endsWith', () => {
        const schema = z.string().endsWith('end')
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('datetime', () => {
        const schema = z.iso.datetime({ offset: true })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('ipv4', () => {
        const schema = z.ipv4()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('ipv6', () => {
        const schema = z.ipv6()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cidrv4', () => {
        const schema = z.cidrv4()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cidrv6', () => {
        const schema = z.cidrv6()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('trim', () => {
        const schema = z.string().trim()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('toLowerCase', () => {
        const schema = z.string().toLowerCase()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('toUpperCase', () => {
        const schema = z.string().toUpperCase()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('datetime', () => {
        const schema = z.iso.datetime()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            "2120-10-18T16:27:55.000Z",
            "2190-07-31T00:32:52.000Z",
            "2019-05-01T09:57:56.000Z",
            "2003-08-07T03:30:29.000Z",
            "2101-04-30T06:06:24.000Z",
            "2233-04-26T10:38:52.000Z",
            "2061-11-04T23:43:45.000Z",
            "2039-12-17T17:33:48.000Z",
            "2095-12-10T18:43:21.000Z",
            "2072-02-26T05:13:58.000Z",
          ]
        `)
    })

    it('datetime - offset', () => {
        const schema = z.iso.datetime({ offset: true })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
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

    it('datetime - local', () => {
        const schema = z.iso.datetime({ local: true })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            "2120-10-18T16:27:55.000Z",
            "1980-05-25T14:21:03.000Z",
            "2043-04-04T16:04:05.000",
            "2158-09-22T14:21:46.000Z",
            "2233-04-26T10:38:52.000Z",
            "2021-03-03T19:13:58.000Z",
            "2223-09-18T14:19:39.000Z",
            "2219-03-09T16:35:07.000Z",
            "2113-10-12T14:31:00.000Z",
            "2179-10-26T21:14:31.000Z",
          ]
        `)
    })

    it('datetime - precision', () => {
        const schema = z.iso.datetime({ precision: 1 })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(z.iso.datetime({ precision: 1 }))
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            "2120-10-18T16:27:55.4Z",
            "1991-09-25T08:09:16.1Z",
            "2003-08-07T03:30:29.1Z",
            "2210-05-14T12:47:21.9Z",
            "2061-11-04T23:43:45.7Z",
            "2223-09-18T14:19:39.4Z",
            "2072-02-26T05:13:58.1Z",
            "2147-12-01T07:29:25.4Z",
            "2148-10-23T17:37:56.0Z",
            "2158-11-01T19:49:15.4Z",
          ]
        `)
        const arb2 = arbitrary(z.iso.datetime({ precision: 10 }))
        expect(Array.from({ length: 10 }, () => arb2.sample(ctx))).toMatchInlineSnapshot(`
          [
            "2155-02-27T10:21:48.9635952803Z",
            "1979-05-30T12:48:31.5445949860Z",
            "2038-04-20T09:04:33.7976706484Z",
            "2118-03-15T04:19:26.0506138918Z",
            "1988-05-01T17:00:42.8406136727Z",
            "1980-11-25T05:47:36.0959970837Z",
            "2140-04-05T02:36:11.1340036142Z",
            "2046-12-05T00:07:57.6238947641Z",
            "2116-11-14T16:44:12.1164160842Z",
            "1989-02-06T13:31:08.0660086995Z",
          ]
        `)
    })

    it('datetime - precision variable', () => {
        forAll(integer({ min: 0, max: 10 }), (precision) => {
            const schema = z.iso.datetime({ precision })
            forAll(arbitrary(schema), (s) => {
                schema.parse(s)
            })
            const schemaRef: StringType = $ref(schema)
            forAll(arbitrary(schemaRef), (s) => {
                schema.parse(s)
            })
        })
    })

    it('date', () => {
        const schema = z.iso.date()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
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

    it('time', () => {
        const schema = z.iso.time()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            "16:27:55.000",
            "00:32:52.000",
            "09:57:56.000",
            "03:30:29.000",
            "06:06:24.000",
            "10:38:52.000",
            "23:43:45.000",
            "17:33:48.000",
            "18:43:21.000",
            "05:13:58.000",
          ]
        `)
    })

    it('time - precision', () => {
        const schema = z.iso.time({ precision: 1 })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(z.iso.time({ precision: 1 }))
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            "16:27:55.4",
            "08:09:16.1",
            "03:30:29.1",
            "12:47:21.9",
            "23:43:45.7",
            "14:19:39.4",
            "05:13:58.1",
            "07:29:25.4",
            "17:37:56.0",
            "19:49:15.4",
          ]
        `)
        const arb2 = arbitrary(z.iso.time({ precision: 10 }))
        expect(Array.from({ length: 10 }, () => arb2.sample(ctx))).toMatchInlineSnapshot(`
          [
            "10:21:48.9635952803",
            "12:48:31.5445949860",
            "09:04:33.7976706484",
            "04:19:26.0506138918",
            "17:00:42.8406136727",
            "05:47:36.0959970837",
            "02:36:11.1340036142",
            "00:07:57.6238947641",
            "16:44:12.1164160842",
            "13:31:08.0660086995",
          ]
        `)
    })

    it('time - precision variable', () => {
        forAll(integer({ min: 0, max: 10 }), (precision) => {
            const schema = z.iso.time({ precision })
            forAll(arbitrary(schema), (s) => {
                schema.parse(s)
            })
            const schemaRef: StringType = $ref(schema)
            forAll(arbitrary(schemaRef), (s) => {
                schema.parse(s)
            })
        })
    })

    it('duration', () => {
        const schema = z.iso.duration()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('base64', () => {
        const schema = z.base64()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('base64url', () => {
        const schema = z.base64url()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: StringType = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })
})

describe('sets', () => {
    it('basic set', () => {
        const schema = z.set(z.string())
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: never = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            Set {
              "L#",
              "#'E1.9e+",
              ",aM^sy{ITK",
              "1dg",
              "}x",
              "Ko2",
            },
            Set {
              "D.7Q",
              "]k",
              "hCz^<",
              "U",
              "",
              "RK+}b\`c",
              "ZDX|T8n!>!",
              "v#.THNR|Lw",
              "a)m[x7Fjw",
              "]i#_JsG",
            },
            Set {
              "CSN",
              "",
              "#_1@n",
              ",uvdd&TsF%",
              "-D[d6g",
              ")a#\`)wU~v",
            },
            Set {
              "",
              "Bb|/H[f-?",
              "#'A]1",
              "4DEu:",
              "[",
              "Et{",
              "c[F2D",
            },
            Set {
              "R,/+YM",
              "^",
            },
            Set {},
            Set {
              "8+"Q&",
              "$ab#&r",
              "z}P.t"M",
              "]",
              ",",
              "w",
              "001$S9",
              "!z",
              " "",
            },
            Set {
              "|PQmG4{8",
              ".",
              ",L-~s",
              "S=YoNx?WP{",
              "q",
              ":H,CSO@v$",
              "Z1zxsSqu$",
              "7H\\12W ",
              "+:dI(/<",
              "",
            },
            Set {},
            Set {
              "AUx\\\`53",
              "w>YD3d+w",
              "",
              "EeHO8x",
            },
          ]
        `)
    })

    it('min', () => {
        const schema = z.set(z.number()).min(2)
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: never = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            Set {
              -987316204.8333645,
              -123414344.79032564,
              -1991294021.561513,
              1312757734.419653,
              -1984378057.5129266,
              -1806577500.5932693,
              -468159076.21629095,
              -1373641555.943141,
              -1507935663.7794366,
            },
            Set {
              1013760582.548079,
              -1620441933.1598659,
              2070318677.3446665,
              -1565533011.175784,
              813063012.5310383,
            },
            Set {
              668940130.0931497,
              1623133978.0225477,
              1890748741.9269,
              1983177254.438252,
              -269736558.78650045,
              245579087.83319187,
              -173710798.9892583,
              -706694403.2852044,
            },
            Set {
              958710102.4790163,
              1066516724.4440823,
              -1050002173.6265736,
              2071771911.388248,
            },
            Set {
              -718783498.5660744,
              -171808135.8375697,
              1434115809.2425957,
              -1292184913.1745815,
              1761481668.0007043,
              -544979035.656126,
              -489540956.1762719,
              -1470553104.2914085,
              -1083004231.3472633,
              108001456.70452404,
              -1197138287.2403808,
              643485404.8784003,
              1248739583.821772,
              -63981123.49378252,
            },
            Set {
              -556388852.7639756,
              1931838474.8187099,
              657548097.6579847,
              -853270773.1088915,
              -1736943443.7672043,
              288113004.3674216,
              -1804458561.9595547,
              -1855744631.5996609,
              814790767.1630516,
              148306379.282372,
              -162437751.9466219,
            },
            Set {
              2082788080.8313985,
              873104903.2261963,
              757092431.4471917,
            },
            Set {
              1783843051.0749173,
              511601440.66549826,
              -485650673.3291068,
              400714534.43508816,
              2015259342.1590161,
              225465824.22199202,
              -1017295651.7632303,
              1403384847.8381042,
              -2070941418.4332771,
              -778923280.2561278,
              -2076623848.786347,
            },
            Set {
              1772595984.6787534,
              -1999885649.50419,
              -1473510760.7297368,
              208516660.31804085,
              -316874582.455606,
              -49408233.40874815,
              157488335.38457298,
              2043432610.6591673,
              -147398956.68561077,
              1790169149.8653378,
              1612897181.5513606,
              826532191.595715,
              -1719456809.7754884,
              1338156961.456626,
            },
            Set {
              1836416613.8154063,
              -1076044864.0926485,
              -406153704.51364994,
              1243013409.1874938,
              1789845750.177021,
              901172883.5287242,
              619359793.6044474,
              1196332930.057732,
              -1974849040.9160028,
              730639828.7849927,
            },
          ]
        `)
    })

    it('max', () => {
        const schema = z.set(z.number()).max(3)
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: never = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            Set {
              -987316204.8333645,
              -123414344.79032564,
            },
            Set {},
            Set {
              -1984378057.5129266,
              -1806577500.5932693,
              -468159076.21629095,
            },
            Set {},
            Set {},
            Set {
              1013760582.548079,
            },
            Set {},
            Set {
              -1565533011.175784,
              813063012.5310383,
              -87348706.34546137,
            },
            Set {
              1623133978.0225477,
              1890748741.9269,
            },
            Set {
              -269736558.78650045,
              245579087.83319187,
              -173710798.9892583,
            },
          ]
        `)
    })

    it('size', () => {
        const schema = z.set(z.number()).size(2)
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: never = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            Set {
              -987316204.8333645,
              -123414344.79032564,
            },
            Set {
              1312757734.419653,
              -1984378057.5129266,
            },
            Set {
              -468159076.21629095,
              -1373641555.943141,
            },
            Set {
              -998293442.9723692,
              1013760582.548079,
            },
            Set {
              2070318677.3446665,
              -1565533011.175784,
            },
            Set {
              -87348706.34546137,
              668940130.0931497,
            },
            Set {
              1890748741.9269,
              1983177254.438252,
            },
            Set {
              245579087.83319187,
              -173710798.9892583,
            },
            Set {
              -1344762791.4300165,
              958710102.4790163,
            },
            Set {
              -1050002173.6265736,
              2071771911.388248,
            },
          ]
        `)
    })

    it('complex element', () => {
        const schema = z.set(z.object({ id: z.number(), name: z.string() }))
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: never = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            Set {
              {
                "id": -987316204.8333645,
                "name": "#l#'E",
              },
              {
                "id": -1373641555.943141,
                "name": "9",
              },
              {
                "id": 1013760582.548079,
                "name": "}",
              },
              {
                "id": -1565533011.175784,
                "name": "M^sy{IT",
              },
              {
                "id": -173710798.9892583,
                "name": "1dg",
              },
              {
                "id": -1050002173.6265736,
                "name": "x?Ko2vCD.7",
              },
            },
            Set {
              {
                "id": -1197138287.2403808,
                "name": "kNhCz^<",
              },
              {
                "id": -1736943443.7672043,
                "name": "'&aRK+",
              },
              {
                "id": 2082788080.8313985,
                "name": "\`cvZDX|",
              },
              {
                "id": 225465824.22199202,
                "name": "n!",
              },
              {
                "id": -778923280.2561278,
                "name": "",
              },
            },
            Set {
              {
                "id": 1772595984.6787534,
                "name": "",
              },
              {
                "id": -1473510760.7297368,
                "name": "HNR|Lw",
              },
              {
                "id": 1612897181.5513606,
                "name": ")m[x7Fj",
              },
              {
                "id": 1789845750.177021,
                "name": "]i#_JsG",
              },
              {
                "id": 367591765.47046185,
                "name": "CSN",
              },
              {
                "id": -2076532314.9177723,
                "name": "#_1@n",
              },
              {
                "id": 1857212568.8128772,
                "name": "u",
              },
              {
                "id": 1747920687.5133138,
                "name": "d&TsF%Z",
              },
              {
                "id": -1555859368.257568,
                "name": "[d6g",
              },
              {
                "id": 1460794263.5207324,
                "name": "a",
              },
            },
            Set {},
            Set {
              {
                "id": -1730467960.9301157,
                "name": "U~vd&mBb|/",
              },
              {
                "id": -329235582.1595564,
                "name": "f-?N#'",
              },
              {
                "id": -629042190.0540109,
                "name": "1M4DEu:",
              },
              {
                "id": -1573288205.8733597,
                "name": ";Et{Mc",
              },
              {
                "id": 564199740.9455872,
                "name": "2D7T",
              },
              {
                "id": 156495610.0297556,
                "name": "/",
              },
              {
                "id": -1637058935.3595414,
                "name": "M)^"rM",
              },
            },
            Set {
              {
                "id": -1647135979.9150243,
                "name": "",
              },
              {
                "id": 104233609.43998957,
                "name": "",
              },
            },
            Set {
              {
                "id": -1923966409.1305323,
                "name": "b#&raz}",
              },
              {
                "id": 49886494.71715784,
                "name": "t",
              },
              {
                "id": -2023340440.0599198,
                "name": "/]*,+",
              },
              {
                "id": 1790220552.1711726,
                "name": "001$S9",
              },
              {
                "id": -1342466782.9713006,
                "name": "",
              },
              {
                "id": 1921681185.660479,
                "name": " "",
              },
            },
            Set {
              {
                "id": 1136479527.6545281,
                "name": "PQmG4{8,.R",
              },
              {
                "id": -1566072390.7223964,
                "name": "-~s|S",
              },
              {
                "id": -817765546.9064288,
                "name": "oNx?WP",
              },
              {
                "id": 1999090627.9621153,
                "name": "q",
              },
              {
                "id": 1611170904.127273,
                "name": "H,C",
              },
              {
                "id": 191658644.70875168,
                "name": "@v$qZ",
              },
              {
                "id": -1375171649.2292619,
                "name": "xsSqu$a7H\\",
              },
              {
                "id": -1348401889.6536403,
                "name": "W ",
              },
              {
                "id": 771088789.4575377,
                "name": ":",
              },
              {
                "id": 957696727.8322158,
                "name": "(/<+",
              },
            },
            Set {
              {
                "id": -2027385576.1840696,
                "name": "",
              },
              {
                "id": -456612484.8197813,
                "name": "AUx\\\`53",
              },
              {
                "id": 1070710506.0100718,
                "name": ">YD3d+w#VE",
              },
              {
                "id": 980216050.091824,
                "name": "O8x;",
              },
              {
                "id": 2144213631.5816169,
                "name": "yM=o%k",
              },
              {
                "id": -1884015374.63066,
                "name": "/.]0",
              },
              {
                "id": 793367279.1719842,
                "name": "<8uw,^/>-",
              },
              {
                "id": 2101068270.8443651,
                "name": "J7b$g&e9",
              },
              {
                "id": -110583744.73535347,
                "name": "kwz8 C",
              },
            },
            Set {
              {
                "id": 769087190.2795157,
                "name": "3T'",
              },
              {
                "id": -672390145.7174225,
                "name": "vMBj$",
              },
              {
                "id": -1792699766.9753141,
                "name": "0Rw0-CN[bN",
              },
              {
                "id": -1153090133.0316849,
                "name": ":L",
              },
              {
                "id": -693167524.7748699,
                "name": "P^Q0wpE.",
              },
              {
                "id": 2024933488.1880827,
                "name": "*Pz?e",
              },
            },
          ]
        `)
    })

    it('nonempty', () => {
        const schema = z.set(z.string()).nonempty()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef: never = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(schema)
        expect(Array.from({ length: 10 }, () => arb.sample(ctx))).toMatchInlineSnapshot(`
          [
            Set {
              "L#",
              "#'E1.9e+",
              ",aM^sy{ITK",
              "1dg",
              "}x",
              "Ko2",
              "CD.7Q5]kNh",
            },
            Set {
              "^<)U'&aRK+",
              "b\`cvZDX|T8",
              "!>!xv#.TH",
              "R|Lws",
              ")m[x7Fj",
            },
            Set {
              "]i#_JsG",
              "<CSN!R",
              "",
              "1@nx,uv",
              "d&TsF%Z",
              "D",
              "d6go)a",
              ")wU~vd&",
              "Bb|/H[f-?",
              "#'A]1",
              "4DEu:",
              "[",
            },
            Set {
              "t{Mc",
              "F2D7TR",
              "/",
              "Y",
            },
            Set {
              "^",
              "",
              "M8+"Q&Z$a",
              "#&raz}P",
              "t",
              "/]*,+",
            },
            Set {
              "001$S9",
              "!z",
              " "",
              "h|PQmG4{8,",
              "R",
              "L",
              "~",
              "|S=YoNx?W",
              "{/qs:",
              ",CSO",
              "v$q",
              "1zxsSq",
            },
            Set {
              "",
              "7H\\12W ",
              "+:dI(/<",
              "q",
              "dAUx",
              "\`53gw>",
              "D3d+w#",
              "EeHO8x",
              "~Vy",
              "=o%k%",
              "/.]0",
            },
            Set {
              "<8uw,^/>-",
              "lJ7b$g&e9M",
              "kwz8 C",
              "\`<3T'@",
              "vMBj$",
              "",
              "0Rw0-CN[bN",
              "5:",
              "@iP^Q",
            },
            Set {
              "pE.|K*Pz?e",
              "})",
              ") mmW{D&",
            },
            Set {
              "Sz%XR",
              "XTu.-",
              "",
            },
          ]
        `)
    })
})
