import { z } from 'zod'

export const record = z.record(z.string())
export const recordKeys = z.record(z.enum(['a', 'b', 'c']), z.string())
