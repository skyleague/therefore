import { $boolean, $object, $validator } from '../../src'

export const defaults = $validator(
    $object({
        foo: $boolean({ default: false }),
    })
)
