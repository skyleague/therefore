/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import { ValidationError } from 'ajv'
import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as ApiResponseValidator } from './schemas/api-response.schema.js'
import { validate as CreateUsersWithListInputRequestValidator } from './schemas/create-users-with-list-input-request.schema.js'
import { validate as FindPetsByStatusResponseValidator } from './schemas/find-pets-by-status-response.schema.js'
import { validate as FindPetsByTagsResponseValidator } from './schemas/find-pets-by-tags-response.schema.js'
import { validate as GetInventoryResponseValidator } from './schemas/get-inventory-response.schema.js'
import { validate as LoginUserResponseValidator } from './schemas/login-user-response.schema.js'
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
    assert: (o: unknown) => {
        if (!User.validate(o)) {
            throw new ValidationError(User.errors ?? [])
        }
    },
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
    assert: (o: unknown) => {
        if (!Pet.validate(o)) {
            throw new ValidationError(Pet.errors ?? [])
        }
    },
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
    assert: (o: unknown) => {
        if (!ApiResponse.validate(o)) {
            throw new ValidationError(ApiResponse.errors ?? [])
        }
    },
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
    assert: (o: unknown) => {
        if (!CreateUsersWithListInputRequest.validate(o)) {
            throw new ValidationError(CreateUsersWithListInputRequest.errors ?? [])
        }
    },
    parse: (o: unknown): { right: CreateUsersWithListInputRequest } | { left: DefinedError[] } => {
        if (CreateUsersWithListInputRequest.is(o)) {
            return { right: o }
        }
        return { left: (CreateUsersWithListInputRequest.errors ?? []) as DefinedError[] }
    },
} as const

export type FindPetsByStatusResponse = Pet[]

export const FindPetsByStatusResponse = {
    validate: FindPetsByStatusResponseValidator as ValidateFunction<FindPetsByStatusResponse>,
    get schema() {
        return FindPetsByStatusResponse.validate.schema
    },
    get errors() {
        return FindPetsByStatusResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is FindPetsByStatusResponse => FindPetsByStatusResponse.validate(o) === true,
    assert: (o: unknown) => {
        if (!FindPetsByStatusResponse.validate(o)) {
            throw new ValidationError(FindPetsByStatusResponse.errors ?? [])
        }
    },
    parse: (o: unknown): { right: FindPetsByStatusResponse } | { left: DefinedError[] } => {
        if (FindPetsByStatusResponse.is(o)) {
            return { right: o }
        }
        return { left: (FindPetsByStatusResponse.errors ?? []) as DefinedError[] }
    },
} as const

export type FindPetsByTagsResponse = Pet[]

export const FindPetsByTagsResponse = {
    validate: FindPetsByTagsResponseValidator as ValidateFunction<FindPetsByTagsResponse>,
    get schema() {
        return FindPetsByTagsResponse.validate.schema
    },
    get errors() {
        return FindPetsByTagsResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is FindPetsByTagsResponse => FindPetsByTagsResponse.validate(o) === true,
    assert: (o: unknown) => {
        if (!FindPetsByTagsResponse.validate(o)) {
            throw new ValidationError(FindPetsByTagsResponse.errors ?? [])
        }
    },
    parse: (o: unknown): { right: FindPetsByTagsResponse } | { left: DefinedError[] } => {
        if (FindPetsByTagsResponse.is(o)) {
            return { right: o }
        }
        return { left: (FindPetsByTagsResponse.errors ?? []) as DefinedError[] }
    },
} as const

export interface GetInventoryResponse {
    [k: string]: number | undefined
}

export const GetInventoryResponse = {
    validate: GetInventoryResponseValidator as ValidateFunction<GetInventoryResponse>,
    get schema() {
        return GetInventoryResponse.validate.schema
    },
    get errors() {
        return GetInventoryResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is GetInventoryResponse => GetInventoryResponse.validate(o) === true,
    assert: (o: unknown) => {
        if (!GetInventoryResponse.validate(o)) {
            throw new ValidationError(GetInventoryResponse.errors ?? [])
        }
    },
    parse: (o: unknown): { right: GetInventoryResponse } | { left: DefinedError[] } => {
        if (GetInventoryResponse.is(o)) {
            return { right: o }
        }
        return { left: (GetInventoryResponse.errors ?? []) as DefinedError[] }
    },
} as const

export type LoginUserResponse = string

export const LoginUserResponse = {
    validate: LoginUserResponseValidator as ValidateFunction<LoginUserResponse>,
    get schema() {
        return LoginUserResponse.validate.schema
    },
    get errors() {
        return LoginUserResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is LoginUserResponse => LoginUserResponse.validate(o) === true,
    assert: (o: unknown) => {
        if (!LoginUserResponse.validate(o)) {
            throw new ValidationError(LoginUserResponse.errors ?? [])
        }
    },
    parse: (o: unknown): { right: LoginUserResponse } | { left: DefinedError[] } => {
        if (LoginUserResponse.is(o)) {
            return { right: o }
        }
        return { left: (LoginUserResponse.errors ?? []) as DefinedError[] }
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
    assert: (o: unknown) => {
        if (!Order.validate(o)) {
            throw new ValidationError(Order.errors ?? [])
        }
    },
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
