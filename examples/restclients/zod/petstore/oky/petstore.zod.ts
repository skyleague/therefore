/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'

export const Tag = z.object({
    id: z.number().int().optional(),
    name: z.string().optional(),
})

export const Category = z.object({
    id: z.number().int().optional(),
    name: z.string().optional(),
})

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

export const Pet = z.object({
    category: Category.optional(),
    id: z.number().int().optional(),
    name: z.string(),
    photoUrls: z.string().array(),
    status: z.enum(['available', 'pending', 'sold']).describe('pet status in the store').optional(),
    tags: Tag.array().optional(),
})

export const ApiResponse = z.object({
    code: z.number().int().optional(),
    message: z.string().optional(),
    type: z.string().optional(),
})

export const CreateUsersWithListInputRequest = User.array()

export const FindPetsByStatusResponse = Pet.array()

export const FindPetsByTagsResponse = Pet.array()

export const GetInventoryResponse = z.record(z.number().int().optional())

export const LoginUserResponse = z.string()

export const Order = z.object({
    complete: z.boolean().optional(),
    id: z.number().int().optional(),
    petId: z.number().int().optional(),
    quantity: z.number().int().optional(),
    shipDate: z.string().datetime({ offset: true }).optional(),
    status: z.enum(['placed', 'approved', 'delivered']).describe('Order Status').optional(),
})

export type ApiResponse = z.infer<typeof ApiResponse>

export type CreateUsersWithListInputRequest = z.infer<typeof CreateUsersWithListInputRequest>

export type FindPetsByStatusResponse = z.infer<typeof FindPetsByStatusResponse>

export type FindPetsByTagsResponse = z.infer<typeof FindPetsByTagsResponse>

export type GetInventoryResponse = z.infer<typeof GetInventoryResponse>

export type LoginUserResponse = z.infer<typeof LoginUserResponse>

export type Order = z.infer<typeof Order>

export type Pet = z.infer<typeof Pet>

export type User = z.infer<typeof User>
