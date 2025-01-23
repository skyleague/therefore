import { z } from 'zod'
import { $ref } from '../../src/lib/primitives/ref/ref.js'

export const profileZod = z.object({
    enableTestVariable: z.boolean().default(false),
})

$ref(profileZod).validator({
    output: {
        jsonschema: './schemas/profile-zod.schema.json',
    },
})
