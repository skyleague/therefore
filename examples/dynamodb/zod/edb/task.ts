import { z } from 'zod'

export const Office = z.object({
    officeName: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    zip: z.string(),
    address: z.string(),
})

export const Employee = z.object({
    // @todo defaults
    employee: z.string().uuid().default('user_1'),
    firstName: z.string(),
    lastName: z.string(),
    officeName: z.string(),
    title: z.string(),
    team: z.enum(['development', 'marketing', 'finance', 'product', 'cool cats and kittens']),
    salary: z.string(),
    manager: z.string().optional(),
    dateHired: z.string().date(),
    birthday: z.string().date(),
})

export const Task = z.object({
    task: z.string(),
    project: z.string(),
    employee: z.string(),
    description: z.string().optional(),
    status: z.enum(['open', 'in-progress', 'closed']).default('open'),
    points: z.number(),
    comments: z.any().optional(),
})
