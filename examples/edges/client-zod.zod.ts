/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
// biome-ignore-all lint: this file is generated
/* eslint-disable */

import { z } from 'zod/v4'

export const CreateUniqueTagRequest = z.object({
    tags: z.string().array(),
})

export type CreateUniqueTagRequest = z.infer<typeof CreateUniqueTagRequest>

export const CreateUniqueTagResponse = z.object({
    uniqueTags: z.string().array().optional(),
})

export type CreateUniqueTagResponse = z.infer<typeof CreateUniqueTagResponse>
