import { z } from 'zod'
import { $ref } from '../../src/lib/primitives/ref/ref.js'

export const userSchema = z.object({
    id: z.number(),
    username: z.string().min(3),
    email: z.string().email(),
})

export const validatedUser = (await $ref(userSchema)).validator()
