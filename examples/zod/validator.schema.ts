import { z } from 'zod'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { Pet, Tag } from '../restclients/zod/petstore/petstore.zod.js'

export const objectSchemaDefault = $ref(
    z.object({
        name: z.string(),
        age: z.number(),
    }),
).validator()

export const objectSchemaAjv = $ref(
    z.object({
        name: z.string(),
        age: z.number(),
    }),
).validator({
    type: 'ajv',
})

export const name = z.object({
    first: z.string(),
    last: z.string(),
})

export const objectSchemaZod = $ref(
    z.object({
        name: name,
        age: z.number(),
    }),
).validator({
    type: 'zod',
})

export const hair = z.object({
    color: z.string(),
    length: z.number(),
})

export const user = z.object({
    name: z.string(),
    age: z.number(),
    pet: Pet.optional(),
    hair: hair.optional(),
    tag: Tag,
})

export const objectSchemaReferenceZod = $ref(user).validator({
    type: 'zod',
})

export const externalReference = $ref(Pet).validator({
    type: 'zod',
})

export const hairReference = $ref(hair).validator({
    type: 'zod',
})
