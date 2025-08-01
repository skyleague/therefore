/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
// biome-ignore-all lint: this file is generated
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as ApiResponseValidator } from './schemas/api-response.schema.js'
import { validate as CreateUsersWithListInputRequestValidator } from './schemas/create-users-with-list-input-request.schema.js'
import { validate as FindPetsByStatusResponse200Validator } from './schemas/find-pets-by-status-response200.schema.js'
import { validate as FindPetsByTagsResponse200Validator } from './schemas/find-pets-by-tags-response200.schema.js'
import { validate as GetInventoryResponse200Validator } from './schemas/get-inventory-response200.schema.js'
import { validate as LoginUserResponse200Validator } from './schemas/login-user-response200.schema.js'
import { validate as OrderValidator } from './schemas/order.schema.js'
import { validate as PetValidator } from './schemas/pet.schema.js'
import { validate as UserValidator } from './schemas/user.schema.js'

export interface User {
    email?: string | undefined
    firstName?: string | undefined
    id?: number | undefined
    lastName?: string | undefined
    password?: string | undefined
    phone?: string | undefined
    username?: string | undefined
    /**
     * User Status
     */
    userStatus?: number | undefined
}

export const User = {
    validate: UserValidator as ValidateFunction<User>,
    get schema() {
        return User.validate.schema
    },
    get errors() {
        return User.validate.errors ?? undefined
    },
    is: (o: unknown): o is User => User.validate(o) === true,
    parse: (o: unknown): { right: User } | { left: DefinedError[] } => {
        if (User.is(o)) {
            return { right: o }
        }
        return { left: (User.errors ?? []) as DefinedError[] }
    },
} as const

export interface Pet {
    category?: Category | undefined
    id?: number | undefined
    name: string
    photoUrls: string[]
    /**
     * pet status in the store
     */
    status?: 'available' | 'pending' | 'sold' | undefined
    tags?: Tag[] | undefined
}

export const Pet = {
    validate: PetValidator as ValidateFunction<Pet>,
    get schema() {
        return Pet.validate.schema
    },
    get errors() {
        return Pet.validate.errors ?? undefined
    },
    is: (o: unknown): o is Pet => Pet.validate(o) === true,
    parse: (o: unknown): { right: Pet } | { left: DefinedError[] } => {
        if (Pet.is(o)) {
            return { right: o }
        }
        return { left: (Pet.errors ?? []) as DefinedError[] }
    },
} as const

export interface ApiResponse {
    code?: number | undefined
    message?: string | undefined
    type?: string | undefined
}

export const ApiResponse = {
    validate: ApiResponseValidator as ValidateFunction<ApiResponse>,
    get schema() {
        return ApiResponse.validate.schema
    },
    get errors() {
        return ApiResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is ApiResponse => ApiResponse.validate(o) === true,
    parse: (o: unknown): { right: ApiResponse } | { left: DefinedError[] } => {
        if (ApiResponse.is(o)) {
            return { right: o }
        }
        return { left: (ApiResponse.errors ?? []) as DefinedError[] }
    },
} as const

export interface Category {
    id?: number | undefined
    name?: string | undefined
}

export type CreateUsersWithListInputRequest = User[]

export const CreateUsersWithListInputRequest = {
    validate: CreateUsersWithListInputRequestValidator as ValidateFunction<CreateUsersWithListInputRequest>,
    get schema() {
        return CreateUsersWithListInputRequest.validate.schema
    },
    get errors() {
        return CreateUsersWithListInputRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is CreateUsersWithListInputRequest => CreateUsersWithListInputRequest.validate(o) === true,
    parse: (o: unknown): { right: CreateUsersWithListInputRequest } | { left: DefinedError[] } => {
        if (CreateUsersWithListInputRequest.is(o)) {
            return { right: o }
        }
        return { left: (CreateUsersWithListInputRequest.errors ?? []) as DefinedError[] }
    },
} as const

export type FindPetsByStatusResponse200 = Pet[]

export const FindPetsByStatusResponse200 = {
    validate: FindPetsByStatusResponse200Validator as ValidateFunction<FindPetsByStatusResponse200>,
    get schema() {
        return FindPetsByStatusResponse200.validate.schema
    },
    get errors() {
        return FindPetsByStatusResponse200.validate.errors ?? undefined
    },
    is: (o: unknown): o is FindPetsByStatusResponse200 => FindPetsByStatusResponse200.validate(o) === true,
    parse: (o: unknown): { right: FindPetsByStatusResponse200 } | { left: DefinedError[] } => {
        if (FindPetsByStatusResponse200.is(o)) {
            return { right: o }
        }
        return { left: (FindPetsByStatusResponse200.errors ?? []) as DefinedError[] }
    },
} as const

export type FindPetsByTagsResponse200 = Pet[]

export const FindPetsByTagsResponse200 = {
    validate: FindPetsByTagsResponse200Validator as ValidateFunction<FindPetsByTagsResponse200>,
    get schema() {
        return FindPetsByTagsResponse200.validate.schema
    },
    get errors() {
        return FindPetsByTagsResponse200.validate.errors ?? undefined
    },
    is: (o: unknown): o is FindPetsByTagsResponse200 => FindPetsByTagsResponse200.validate(o) === true,
    parse: (o: unknown): { right: FindPetsByTagsResponse200 } | { left: DefinedError[] } => {
        if (FindPetsByTagsResponse200.is(o)) {
            return { right: o }
        }
        return { left: (FindPetsByTagsResponse200.errors ?? []) as DefinedError[] }
    },
} as const

export interface GetInventoryResponse200 {
    [k: string]: number | undefined
}

export const GetInventoryResponse200 = {
    validate: GetInventoryResponse200Validator as ValidateFunction<GetInventoryResponse200>,
    get schema() {
        return GetInventoryResponse200.validate.schema
    },
    get errors() {
        return GetInventoryResponse200.validate.errors ?? undefined
    },
    is: (o: unknown): o is GetInventoryResponse200 => GetInventoryResponse200.validate(o) === true,
    parse: (o: unknown): { right: GetInventoryResponse200 } | { left: DefinedError[] } => {
        if (GetInventoryResponse200.is(o)) {
            return { right: o }
        }
        return { left: (GetInventoryResponse200.errors ?? []) as DefinedError[] }
    },
} as const

export type LoginUserResponse200 = string

export const LoginUserResponse200 = {
    validate: LoginUserResponse200Validator as ValidateFunction<LoginUserResponse200>,
    get schema() {
        return LoginUserResponse200.validate.schema
    },
    get errors() {
        return LoginUserResponse200.validate.errors ?? undefined
    },
    is: (o: unknown): o is LoginUserResponse200 => LoginUserResponse200.validate(o) === true,
    parse: (o: unknown): { right: LoginUserResponse200 } | { left: DefinedError[] } => {
        if (LoginUserResponse200.is(o)) {
            return { right: o }
        }
        return { left: (LoginUserResponse200.errors ?? []) as DefinedError[] }
    },
} as const

export interface Order {
    complete?: boolean | undefined
    id?: number | undefined
    petId?: number | undefined
    quantity?: number | undefined
    shipDate?: string | undefined
    /**
     * Order Status
     */
    status?: 'placed' | 'approved' | 'delivered' | undefined
}

export const Order = {
    validate: OrderValidator as ValidateFunction<Order>,
    get schema() {
        return Order.validate.schema
    },
    get errors() {
        return Order.validate.errors ?? undefined
    },
    is: (o: unknown): o is Order => Order.validate(o) === true,
    parse: (o: unknown): { right: Order } | { left: DefinedError[] } => {
        if (Order.is(o)) {
            return { right: o }
        }
        return { left: (Order.errors ?? []) as DefinedError[] }
    },
} as const

export interface Tag {
    id?: number | undefined
    name?: string | undefined
}
