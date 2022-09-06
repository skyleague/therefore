import { Headers, Query } from '../examples/http/http.type'

import { dict, forAll, integer, isNumber, string, tuple, unknown } from '@skyleague/axioms'

test('headers', () => {
    forAll(tuple(dict(unknown()), string()), ([d, x]) => {
        const h = { ...d, authorization: x }
        Headers.assert(h)
    })
})

test('query', () => {
    forAll(tuple(dict(unknown()), integer()), ([d, x]) => {
        const q = { ...d, limit: x.toString() }
        Query.assert(q)
        return isNumber(q.limit)
    })
})
