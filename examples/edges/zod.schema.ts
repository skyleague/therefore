import { z } from 'zod'

export const record = z.record(z.string())
export const recordKeys = z.record(z.enum(['a', 'b', 'c']), z.string())

export const foo = z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
})
export const omitMultiple = foo.omit({
    b: true,
    c: true,
})
