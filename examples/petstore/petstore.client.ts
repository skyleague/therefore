/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import got from 'got'
import type { CancelableRequest, Got, Options, Response } from 'got'
import type { ValidateFunction, ErrorObject } from 'ajv'
import { IncomingHttpHeaders } from 'http'
import {
    ApiResponse,
    CreateUsersWithListInputRequest,
    FindPetsByStatusResponse,
    FindPetsByTagsResponse,
    GetInventoryResponse,
    LoginUserResponse,
    Order,
    Pet,
    User,
} from './petstore.type'

/**
 * Swagger Petstore - OpenAPI 3.0
 *
 * This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
 * Swagger at [http://swagger.io](http://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
 * You can now help us improve the API whether it's by making changes to the definition itself or to the code.
 * That way, with time, we can improve the API in general, and expose some of the new features in OAS3.
 *
 * Some useful links:
 * - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
 * - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)
 */
export class PetStore {
    public client: Got

    public auth: {
        petstoreAuth?: string | (() => Promise<string>)
        apiKey?: string | (() => Promise<string>)
    }

    public availableAuth: Set<string>
    public defaultAuth: string[][] | string[] | undefined

    public constructor({
        prefixUrl,
        options,
        auth = {},
        defaultAuth,
    }: {
        prefixUrl: string | `${string}/api/v3`
        options?: Options
        auth: {
            petstoreAuth?: string | (() => Promise<string>)
            apiKey?: string | (() => Promise<string>)
        }
        defaultAuth?: string[][] | string[]
    }) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
        this.auth = auth
        this.availableAuth = new Set(Object.keys(auth))
        this.defaultAuth = defaultAuth
    }

    /**
     * Update an existing pet
     *
     * Update an existing pet by Id
     */
    public async updatePet({ body, auth = [['petstoreAuth']] }: { body: Pet; auth?: string[][] | string[] }) {
        this.validateRequestBody(Pet, body)

        return this.awaitResponse(
            this.buildClient(auth).put(`pet`, {
                json: body,
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { is: (x: unknown): x is unknown => true },
                404: { is: (x: unknown): x is unknown => true },
                405: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Add a new pet to the store
     */
    public async addPet({ body, auth = [['petstoreAuth']] }: { body: Pet; auth?: string[][] | string[] }) {
        this.validateRequestBody(Pet, body)

        return this.awaitResponse(
            this.buildClient(auth).post(`pet`, {
                json: body,
                responseType: 'json',
            }),
            {
                200: Pet,
                405: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Finds Pets by status
     *
     * Multiple status values can be provided with comma separated strings
     */
    public async findPetsByStatus({
        query,
        auth = [['petstoreAuth']],
    }: { query?: { status?: string }; auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get(`pet/findByStatus`, {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByStatusResponse,
                400: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Finds Pets by tags
     *
     * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
     */
    public async findPetsByTags({
        query,
        auth = [['petstoreAuth']],
    }: { query?: { tags?: string }; auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get(`pet/findByTags`, {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByTagsResponse,
                400: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Find pet by ID
     *
     * Returns a single pet
     */
    public async getPetById({
        path,
        auth = [['apiKey'], ['petstoreAuth']],
    }: {
        path: { petId: string }
        auth?: string[][] | string[]
    }) {
        return this.awaitResponse(
            this.buildClient(auth).get(`pet/${path.petId}`, {
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { is: (x: unknown): x is unknown => true },
                404: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Updates a pet in the store with form data
     */
    public async updatePetWithForm({
        path,
        query,
        auth = [['petstoreAuth']],
    }: {
        path: { petId: string }
        query?: { name?: string; status?: string }
        auth?: string[][] | string[]
    }) {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}`, {
                searchParams: query ?? {},
            }),
            {
                405: { is: (x: unknown): x is string => true },
            }
        )
    }

    /**
     * Deletes a pet
     */
    public async deletePet({
        path,
        headers,
        auth = [['petstoreAuth']],
    }: {
        path: { petId: string }
        headers?: { api_key?: string }
        auth?: string[][] | string[]
    }) {
        return this.awaitResponse(
            this.buildClient(auth).delete(`pet/${path.petId}`, {
                headers: headers ?? {},
            }),
            {
                400: { is: (x: unknown): x is string => true },
            }
        )
    }

    /**
     * uploads an image
     */
    public async uploadFile({
        body,
        path,
        query,
        auth = [['petstoreAuth']],
    }: {
        body: string | Buffer
        path: { petId: string }
        query?: { additionalMetadata?: string }
        auth?: string[][] | string[]
    }) {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}/uploadImage`, {
                body: body,
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: ApiResponse,
            }
        )
    }

    /**
     * Returns pet inventories by status
     *
     * Returns a map of status codes to quantities
     */
    public async getInventory({ auth = [['apiKey']] }: { auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get(`store/inventory`, {
                responseType: 'json',
            }),
            {
                200: GetInventoryResponse,
            }
        )
    }

    /**
     * Place an order for a pet
     *
     * Place a new order in the store
     */
    public async placeOrder({ body }: { body: Order }) {
        this.validateRequestBody(Order, body)

        return this.awaitResponse(
            this.client.post(`store/order`, {
                json: body,
                responseType: 'json',
            }),
            {
                200: Order,
                405: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Find purchase order by ID
     *
     * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
     */
    public async getOrderById({ path }: { path: { orderId: string } }) {
        return this.awaitResponse(
            this.client.get(`store/order/${path.orderId}`, {
                responseType: 'json',
            }),
            {
                200: Order,
                400: { is: (x: unknown): x is unknown => true },
                404: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Delete purchase order by ID
     *
     * For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors
     */
    public async deleteOrder({ path }: { path: { orderId: string } }) {
        return this.awaitResponse(this.client.delete(`store/order/${path.orderId}`, {}), {
            400: { is: (x: unknown): x is string => true },
            404: { is: (x: unknown): x is string => true },
        })
    }

    /**
     * Create user
     *
     * This can only be done by the logged in user.
     */
    public async createUser({ body }: { body: User }) {
        this.validateRequestBody(User, body)

        return this.awaitResponse(
            this.client.post(`user`, {
                json: body,
                responseType: 'json',
            }),
            {
                default: User,
            }
        )
    }

    /**
     * Creates list of users with given input array
     */
    public async createUsersWithListInput({ body }: { body: CreateUsersWithListInputRequest }) {
        this.validateRequestBody(CreateUsersWithListInputRequest, body)

        return this.awaitResponse(
            this.client.post(`user/createWithList`, {
                json: body,
                responseType: 'json',
            }),
            {
                200: User,
            }
        )
    }

    /**
     * Logs user into the system
     */
    public async loginUser({ query }: { query?: { username?: string; password?: string } } = {}) {
        return this.awaitResponse(
            this.client.get(`user/login`, {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: LoginUserResponse,
                400: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Logs out current logged in user session
     */
    public async logoutUser() {
        return this.awaitResponse(this.client.get(`user/logout`, {}), {
            default: { is: (x: unknown): x is string => true },
        })
    }

    /**
     * Get user by user name
     */
    public async getUserByName({ path }: { path: { username: string } }) {
        return this.awaitResponse(
            this.client.get(`user/${path.username}`, {
                responseType: 'json',
            }),
            {
                200: User,
                400: { is: (x: unknown): x is unknown => true },
                404: { is: (x: unknown): x is unknown => true },
            }
        )
    }

    /**
     * Update user
     *
     * This can only be done by the logged in user.
     */
    public async updateUser({ body, path }: { body: User; path: { username: string } }) {
        this.validateRequestBody(User, body)

        return this.awaitResponse(
            this.client.put(`user/${path.username}`, {
                json: body,
            }),
            {
                default: { is: (x: unknown): x is string => true },
            }
        )
    }

    /**
     * Delete user
     *
     * This can only be done by the logged in user.
     */
    public async deleteUser({ path }: { path: { username: string } }) {
        return this.awaitResponse(this.client.delete(`user/${path.username}`, {}), {
            400: { is: (x: unknown): x is string => true },
            404: { is: (x: unknown): x is string => true },
        })
    }

    public validateRequestBody<T>(schema: { is: (o: unknown) => o is T; assert: (o: unknown) => void }, body: T) {
        schema.assert(body)
        return body
    }

    public async awaitResponse<
        T,
        S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; validate?: ValidateFunction<T> }>
    >(response: CancelableRequest<Response<unknown>>, schemas: S) {
        type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string
            ? `${S}` extends `${T}${infer _X}`
                ? S
                : never
            : never
        type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never
        const result = await response
        const validator = schemas[result.statusCode] ?? schemas.default
        if (validator?.is(result.body) === false || result.statusCode < 200 || result.statusCode >= 300) {
            return {
                statusCode: result.statusCode,
                headers: result.headers,
                left: result.body,
                validationErrors: validator?.validate?.errors ?? undefined,
            } as {
                statusCode: number
                headers: IncomingHttpHeaders
                left: InferSchemaType<S[keyof S]>
                validationErrors?: ErrorObject[]
            }
        }
        return { statusCode: result.statusCode, headers: result.headers, right: result.body } as {
            statusCode: number
            headers: IncomingHttpHeaders
            right: InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]>
        }
    }

    protected buildPetstoreAuthClient(client: Got) {
        return client
    }

    protected buildApiKeyClient(client: Got) {
        return client.extend({
            hooks: {
                beforeRequest: [
                    async (options) => {
                        const apiKey = this.auth.apiKey
                        const key = typeof apiKey === 'function' ? await apiKey() : apiKey
                        options.headers['api_key'] = key
                    },
                ],
            },
        })
    }

    protected buildClient(auths: string[][] | string[] | undefined = this.defaultAuth, client: Got = this.client): Got {
        const auth = (auths ?? [...this.availableAuth])
            .map((auth) => (Array.isArray(auth) ? auth : [auth]))
            .filter((auth) => auth.every((a) => this.availableAuth.has(a)))
        for (const chosen of auth[0] ?? []) {
            if (chosen === 'petstoreAuth') {
                client = this.buildPetstoreAuthClient(client)
            } else if (chosen === 'apiKey') {
                client = this.buildApiKeyClient(client)
            }
        }
        return client
    }
}
