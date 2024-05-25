import { $boolean } from '../../src/lib/primitives/boolean/boolean.js'
import { $object } from '../../src/lib/primitives/object/object.js'

export const profile = $object({
    enableTestVariable: $boolean({ default: false }),
}).validator({
    schemaFilename: './schemas/profile.schema.json',
})
