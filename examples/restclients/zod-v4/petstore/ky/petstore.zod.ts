/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
// biome-ignore-all lint: this file is generated
/* eslint-disable */

import { z } from 'zod/v4'

export const Tag = z.object({
    id: z.number().int().optional(),
    name: z.string().optional(),
})

export type Tag = z.infer<typeof Tag>

export const Category = z.object({
    id: z.number().int().optional(),
    name: z.string().optional(),
})

export type Category = z.infer<typeof Category>

export const User = z.object({
    email: z.string().optional(),
    firstName: z.string().optional(),
    id: z.number().int().optional(),
    lastName: z.string().optional(),
    password: z.string().optional(),
    phone: z.string().optional(),
    username: z.string().optional(),
    userStatus: z.number().int().describe('User Status').optional(),
})

export type User = z.infer<typeof User>

export const Pet = z.object({
    category: Category.optional(),
    id: z.number().int().optional(),
    name: z.string(),
    photoUrls: z.string().array(),
    status: z.enum(['available', 'pending', 'sold']).describe('pet status in the store').optional(),
    tags: Tag.array().optional(),
})

export type Pet = z.infer<typeof Pet>

export const ApiResponse = z.object({
    code: z.number().int().optional(),
    message: z.string().optional(),
    type: z.string().optional(),
})

export type ApiResponse = z.infer<typeof ApiResponse>

export const CreateUsersWithListInputRequest = User.array()

export type CreateUsersWithListInputRequest = z.infer<typeof CreateUsersWithListInputRequest>

export const FindPetsByStatusResponse200 = Pet.array()

export type FindPetsByStatusResponse200 = z.infer<typeof FindPetsByStatusResponse200>

export const FindPetsByTagsResponse200 = Pet.array()

export type FindPetsByTagsResponse200 = z.infer<typeof FindPetsByTagsResponse200>

export const GetInventoryResponse200 = z.record(z.string(), z.number().int())

export type GetInventoryResponse200 = z.infer<typeof GetInventoryResponse200>

export const LoginUserResponse200 = z.string()

export type LoginUserResponse200 = z.infer<typeof LoginUserResponse200>

export const Order = z.object({
    complete: z.boolean().optional(),
    id: z.number().int().optional(),
    petId: z.number().int().optional(),
    quantity: z.number().int().optional(),
    shipDate: z.iso.datetime({ offset: true }).optional(),
    status: z.enum(['placed', 'approved', 'delivered']).describe('Order Status').optional(),
})

export type Order = z.infer<typeof Order>
