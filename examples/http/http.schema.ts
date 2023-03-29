import { $headers, $number, $query, $string } from '../../src/index.js'

export const headers = $headers({
    authorization: $string,
})

export const query = $query({
    limit: $number,
})
