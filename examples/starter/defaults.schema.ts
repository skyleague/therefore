import { $boolean, $object } from '../../src/index.js'

export const defaults = $object({
    foo: $boolean().default(false),
}).validator()
