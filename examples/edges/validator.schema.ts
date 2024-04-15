import { $object } from '../../src/lib/primitives/object/object.js'
import { $string } from '../../src/lib/primitives/string/string.js'
import { $validator } from '../../src/lib/primitives/validator/validator.js'

export const validator = $validator(
    $object({
        foo: $string,
    }),
)
