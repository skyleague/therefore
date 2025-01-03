/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'

export const Comic = z.object({
    alt: z.string().nullable().optional(),
    day: z.string().nullable().optional(),
    img: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    month: z.string().nullable().optional(),
    news: z.string().nullable().optional(),
    num: z.number().nullable().optional(),
    safe_title: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    transcript: z.string().nullable().optional(),
    year: z.string().nullable().optional(),
})

export type Comic = z.infer<typeof Comic>