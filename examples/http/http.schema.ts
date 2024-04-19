import { $headers } from '../../src/lib/primitives/http/headers.js'
import { $query } from '../../src/lib/primitives/http/query.js'
import { $number } from '../../src/lib/primitives/number/number.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const headers = $headers({
    authorization: $string,
})

export const query = $query({
    limit: $number,
})

export const dep = $headers({
    authorization: $string,
})
