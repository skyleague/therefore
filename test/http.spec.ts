import { Headers, Query } from '../examples/http/http.type.js'

import { dict, forAll, integer, isNumber, string, tuple, unknown } from '@skyleague/axioms'
import { it, expect } from 'vitest'

it('headers', () => {
    forAll(tuple(dict(unknown()), string()), ([d, x]) => {
        const h = { ...d, authorization: x }
        Headers.assert(h)
    })
})

it('query', () => {
    forAll(tuple(dict(unknown()), integer()), ([d, x]) => {
        const q = { ...d, limit: x.toString() }
        Query.assert(q)
        return isNumber(q.limit)
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
