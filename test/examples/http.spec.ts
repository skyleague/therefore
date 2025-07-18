import { forAll, integer, isNumber, record, string, tuple, unknown } from '@skyleague/axioms'
import { expect, it } from 'vitest'
import { Headers, Query } from '../../examples/http/http.type.js'
import { compileOutput } from '../../src/commands/generate/generate.js'

it('http', async () => {
    expect(
        await compileOutput(['examples/http/http.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('headers', () => {
    forAll(tuple(record(unknown()), string()), ([d, x]) => {
        const h = { ...d, authorization: x }
        return Headers.is(h)
    })
})

it('query', () => {
    forAll(tuple(record(unknown()), integer()), ([d, x]) => {
        const q = { ...d, limit: x.toString() }
        return Query.is(q) && isNumber(q.limit)
    })
})

it('schema', () => {
    expect(Query.schema).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalProperties": true,
        "properties": {
          "limit": {
            "type": "number",
          },
        },
        "required": [
          "limit",
        ],
        "title": "Query",
        "type": "object",
      }
    `)
})
