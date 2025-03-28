/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'
import type { ZodType } from 'zod'

export const OtherModel = z.object({
    name: z.string().optional(),
})

export type OtherModel = z.infer<typeof OtherModel>

export type BusinessRelationModel = {
    other?: z.infer<typeof OtherModel> | undefined
    relations?: z.infer<typeof BusinessRelationModel>[] | undefined
}
export const BusinessRelationModel: ZodType<BusinessRelationModel> = z.object({
    other: OtherModel.optional(),
    relations: z
        .lazy(() => BusinessRelationModel)
        .array()
        .optional(),
})

export const GetBusinessesResponse = BusinessRelationModel.array()

export type GetBusinessesResponse = z.infer<typeof GetBusinessesResponse>
