/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'

export interface Pet {
    id?: number
    name: string
    category?: Category
    photoUrls: string[]
    tags?: Tag[]
    /**
     * pet status in the store
     */
    status?: 'available' | 'pending' | 'sold'
}

export const Pet = {
    validate: require('./schemas/pet.schema.js') as ValidateFunction<Pet>,
    get schema() {
        return Pet.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'Pet',
    is: (o: unknown): o is Pet => Pet.validate(o) === true,
    assert: (o: unknown) => {
        if (!Pet.validate(o)) {
            throw new AjvValidator.ValidationError(Pet.validate.errors ?? [])
        }
    },
} as const

export type FindPetsByStatusResponse = Pet[]

export const FindPetsByStatusResponse = {
    validate: require('./schemas/find-pets-by-status-response.schema.js') as ValidateFunction<FindPetsByStatusResponse>,
    get schema() {
        return FindPetsByStatusResponse.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'findPetsByStatusResponse',
    is: (o: unknown): o is FindPetsByStatusResponse => FindPetsByStatusResponse.validate(o) === true,
} as const

export type FindPetsByTagsResponse = Pet[]

export const FindPetsByTagsResponse = {
    validate: require('./schemas/find-pets-by-tags-response.schema.js') as ValidateFunction<FindPetsByTagsResponse>,
    get schema() {
        return FindPetsByTagsResponse.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'findPetsByTagsResponse',
    is: (o: unknown): o is FindPetsByTagsResponse => FindPetsByTagsResponse.validate(o) === true,
} as const

export interface ApiResponse {
    code?: number
    type?: string
    message?: string
}

export const ApiResponse = {
    validate: require('./schemas/api-response.schema.js') as ValidateFunction<ApiResponse>,
    get schema() {
        return ApiResponse.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'ApiResponse',
    is: (o: unknown): o is ApiResponse => ApiResponse.validate(o) === true,
} as const

export interface GetInventoryResponse {
    [k: string]: number
}

export const GetInventoryResponse = {
    validate: require('./schemas/get-inventory-response.schema.js') as ValidateFunction<GetInventoryResponse>,
    get schema() {
        return GetInventoryResponse.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'getInventoryResponse',
    is: (o: unknown): o is GetInventoryResponse => GetInventoryResponse.validate(o) === true,
} as const

export interface Order {
    id?: number
    petId?: number
    quantity?: number
    shipDate?: string
    /**
     * Order Status
     */
    status?: 'placed' | 'approved' | 'delivered'
    complete?: boolean
}

export const Order = {
    validate: require('./schemas/order.schema.js') as ValidateFunction<Order>,
    get schema() {
        return Order.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'Order',
    is: (o: unknown): o is Order => Order.validate(o) === true,
    assert: (o: unknown) => {
        if (!Order.validate(o)) {
            throw new AjvValidator.ValidationError(Order.validate.errors ?? [])
        }
    },
} as const

export interface User {
    id?: number
    username?: string
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    phone?: string
    /**
     * User Status
     */
    userStatus?: number
}

export const User = {
    validate: require('./schemas/user.schema.js') as ValidateFunction<User>,
    get schema() {
        return User.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'User',
    is: (o: unknown): o is User => User.validate(o) === true,
    assert: (o: unknown) => {
        if (!User.validate(o)) {
            throw new AjvValidator.ValidationError(User.validate.errors ?? [])
        }
    },
} as const

export type CreateUsersWithListInputRequest = User[]

export const CreateUsersWithListInputRequest = {
    validate:
        require('./schemas/create-users-with-list-input-request.schema.js') as ValidateFunction<CreateUsersWithListInputRequest>,
    get schema() {
        return CreateUsersWithListInputRequest.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'createUsersWithListInputRequest',
    is: (o: unknown): o is CreateUsersWithListInputRequest => CreateUsersWithListInputRequest.validate(o) === true,
    assert: (o: unknown) => {
        if (!CreateUsersWithListInputRequest.validate(o)) {
            throw new AjvValidator.ValidationError(CreateUsersWithListInputRequest.validate.errors ?? [])
        }
    },
} as const

export type LoginUserResponse = string

export const LoginUserResponse = {
    validate: require('./schemas/login-user-response.schema.js') as ValidateFunction<LoginUserResponse>,
    get schema() {
        return LoginUserResponse.validate.schema
    },
    source: `${__dirname}/petstore.client`,
    sourceSymbol: 'loginUserResponse',
    is: (o: unknown): o is LoginUserResponse => LoginUserResponse.validate(o) === true,
} as const

export interface Category {
    id?: number
    name?: string
}

export interface Tag {
    id?: number
    name?: string
}
