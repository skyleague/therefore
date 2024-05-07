import { z } from 'zod'
import { $ref } from '../../src/lib/primitives/ref/ref.js'

export const email = z.string().email()

export const userSchema = z.object({
    id: z.number(),
    username: z.string().min(3),
    email: email,
    attributes: z.record(z.string()),
})

export const validatedUser = $ref(userSchema).validator()

export const users = validatedUser.array()

export const attributes = $ref(userSchema).shape.attributes
