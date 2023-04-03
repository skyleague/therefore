import { $boolean, $object, $validator } from '../../src/index.js'

export const defaults = $validator(
    $object({
        foo: $boolean({ default: false }),
    })
)
