/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'

export const ConvertApiRequest = z.object({
    url: z.string().optional(),
})

export type ConvertApiRequest = z.infer<typeof ConvertApiRequest>

export const ConvertApiResponse = z.object({})

export type ConvertApiResponse = z.infer<typeof ConvertApiResponse>
