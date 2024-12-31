import { z } from 'zod'

export const ModelWithString = z.object({ prop: z.string() })

export const ModelWithArray = z.object({
    prop: z.array(ModelWithString),
})

export const MultipartRequestRequest = z.object({
    data: ModelWithString,
})
