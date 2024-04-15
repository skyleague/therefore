import { $object } from '../../src/lib/primitives/object/object.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const validator = $object({
    foo: $string,
}).validator({ compile: false })
