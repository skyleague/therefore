import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'
import { bar as barAlias } from './ref-alias.schema.js'

export const bar = $object({
    bar: $string().optional(),
    aliased: $ref(barAlias).optional(),
}).validator()

export const foo = $object({
    foo: $ref(bar).optional(),
}).validator()
