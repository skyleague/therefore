import { arbitraryContext, forAll, integer, xoroshiro128plus } from '@skyleague/axioms'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { $ref } from '../../primitives/ref/ref.js'
import { arbitrary } from './arbitrary.js'

describe('formats', () => {
    it('normal string', () => {
        const str = z.string()
        forAll(arbitrary(str), (s) => {
            str.parse(s)
        })
        const strRef = $ref(str)
        forAll(arbitrary(strRef), (s) => {
            str.parse(s)
        })
    })

    it('email', () => {
        const schema = z.string().email()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('url', () => {
        const schema = z.string().url()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('emoji', () => {
        const schema = z.string().emoji()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('uuid', () => {
        const schema = z.string().uuid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    }, 10000)

    it('nanoid', () => {
        const schema = z.string().nanoid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cuid', () => {
        const schema = z.string().cuid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cuid2', () => {
        const schema = z.string().cuid2()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('ulid', () => {
        const schema = z.string().ulid()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('regex', () => {
        const schema = z.string().regex(/^[a-z]+$/)
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('includes', () => {
        const schema = z.string().includes('test')
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('startsWith', () => {
        const schema = z.string().startsWith('start')
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('endsWith', () => {
        const schema = z.string().endsWith('end')
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('datetime', () => {
        const schema = z.string().datetime({ offset: true })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('ip', () => {
        const schema = z.string().ip()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('cidr', () => {
        const schema = z.string().cidr()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('trim', () => {
        const schema = z.string().trim()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('toLowerCase', () => {
        const schema = z.string().toLowerCase()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('toUpperCase', () => {
        const schema = z.string().toUpperCase()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('datetime', () => {
        const schema = z.string().datetime()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
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
        const schema = z.string().datetime({ offset: true })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
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
        const schema = z.string().datetime({ local: true })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
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
        const schema = z.string().datetime({ precision: 1 })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(z.string().datetime({ precision: 1 }))
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
        const arb2 = arbitrary(z.string().datetime({ precision: 10 }))
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
            const schema = z.string().datetime({ precision })
            forAll(arbitrary(schema), (s) => {
                schema.parse(s)
            })
            const schemaRef = $ref(schema)
            forAll(arbitrary(schemaRef), (s) => {
                schema.parse(s)
            })
        })
    })

    it('date', () => {
        const schema = z.string().date()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
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
        const schema = z.string().time()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
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
        const schema = z.string().time({ precision: 1 })
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })

        const ctx = arbitraryContext({ rng: xoroshiro128plus(1638968569864n) })
        const arb = arbitrary(z.string().time({ precision: 1 }))
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
        const arb2 = arbitrary(z.string().time({ precision: 10 }))
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
            const schema = z.string().time({ precision })
            forAll(arbitrary(schema), (s) => {
                schema.parse(s)
            })
            const schemaRef = $ref(schema)
            forAll(arbitrary(schemaRef), (s) => {
                schema.parse(s)
            })
        })
    })

    it('duration', () => {
        const schema = z.string().duration()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('base64', () => {
        const schema = z.string().base64()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })

    it('base64url', () => {
        const schema = z.string().base64url()
        forAll(arbitrary(schema), (s) => {
            schema.parse(s)
        })
        const schemaRef = $ref(schema)
        forAll(arbitrary(schemaRef), (s) => {
            schema.parse(s)
        })
    })
})
