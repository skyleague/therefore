import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const bar = $object({
    bar: $string().optional(),
}).validator()

export const foo = $object({
    foo: $ref(bar).optional(),
}).validator()
