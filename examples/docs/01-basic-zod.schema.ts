import { z } from 'zod'

export const User = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(2),
    age: z.number().int().min(0),
    roles: z.array(z.enum(['admin', 'user', 'guest'])),
    metadata: z.record(z.string(), z.unknown()).optional(),
    createdAt: z.string().datetime(),
})

export const Team = z.object({
    id: z.string().uuid(),
    name: z.string(),
    leader: User,
    members: z.array(User),
    tags: z.array(z.string()).default([]),
})
