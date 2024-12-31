/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'

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
} from './petstore.zod.js'

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
export class PetStoreOptions {
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
        client = got,
    }: {
        prefixUrl: string | `${string}/api/v3`
        options?: Options | OptionsInit
        auth: {
            petstoreAuth?: string | (() => Promise<string>)
            apiKey?: string | (() => Promise<string>)
        }
        defaultAuth?: string[][] | string[]
        client?: Got
    }) {
        this.client = client.extend(...[{ prefixUrl }, options].filter((o): o is Options => o !== undefined))
        this.auth = auth
        this.availableAuth = new Set(Object.keys(auth))
        this.defaultAuth = defaultAuth
    }

    /**
     * POST /pet
     *
     * Add a new pet to the store
     */
    public addPet({ body, auth = [['petstoreAuth']] }: { body: Pet; auth?: string[][] | string[] }) {
        this.validateRequestBody(Pet, body)

        return this.awaitResponse(
            this.buildClient(auth).post('pet', {
                json: body,
                responseType: 'json',
            }),
            {
                200: Pet,
                405: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * POST /user
     *
     * Create user
     *
     * This can only be done by the logged in user.
     */
    public createUser({ body }: { body: User }) {
        this.validateRequestBody(User, body)

        return this.awaitResponse(
            this.client.post('user', {
                json: body,
                responseType: 'json',
            }),
            {
                default: User,
            },
        )
    }

    /**
     * POST /user/createWithList
     *
     * Creates list of users with given input array
     */
    public createUsersWithListInput({ body }: { body: CreateUsersWithListInputRequest }) {
        this.validateRequestBody(CreateUsersWithListInputRequest, body)

        return this.awaitResponse(
            this.client.post('user/createWithList', {
                json: body,
                responseType: 'json',
            }),
            {
                200: User,
            },
        )
    }

    /**
     * DELETE /store/order/{orderId}
     *
     * Delete purchase order by ID
     *
     * For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors
     */
    public deleteOrder({ path }: { path: { orderId: string } }) {
        return this.awaitResponse(
            this.client.delete(`store/order/${path.orderId}`, {
                responseType: 'text',
            }),
            {
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * DELETE /pet/{petId}
     *
     * Deletes a pet
     */
    public deletePet({
        path,
        headers,
        auth = [['petstoreAuth']],
    }: { path: { petId: string }; headers?: { api_key?: string }; auth?: string[][] | string[] }) {
        return this.awaitResponse(
            this.buildClient(auth).delete(`pet/${path.petId}`, {
                headers: headers ?? {},
                responseType: 'text',
            }),
            {
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * DELETE /user/{username}
     *
     * Delete user
     *
     * This can only be done by the logged in user.
     */
    public deleteUser({ path }: { path: { username: string } }) {
        return this.awaitResponse(
            this.client.delete(`user/${path.username}`, {
                responseType: 'text',
            }),
            {
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /pet/findByStatus
     *
     * Finds Pets by status
     *
     * Multiple status values can be provided with comma separated strings
     */
    public findPetsByStatus({
        query,
        auth = [['petstoreAuth']],
    }: { query?: { status?: string }; auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByStatus', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByStatusResponse,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /pet/findByTags
     *
     * Finds Pets by tags
     *
     * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
     */
    public findPetsByTags({
        query,
        auth = [['petstoreAuth']],
    }: { query?: { tags?: string }; auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByTags', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByTagsResponse,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /store/inventory
     *
     * Returns pet inventories by status
     *
     * Returns a map of status codes to quantities
     */
    public getInventory({ auth = [['apiKey']] }: { auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get('store/inventory', {
                responseType: 'json',
            }),
            {
                200: GetInventoryResponse,
            },
        )
    }

    /**
     * GET /store/order/{orderId}
     *
     * Find purchase order by ID
     *
     * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
     */
    public getOrderById({ path }: { path: { orderId: string } }) {
        return this.awaitResponse(
            this.client.get(`store/order/${path.orderId}`, {
                responseType: 'json',
            }),
            {
                200: Order,
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /pet/{petId}
     *
     * Find pet by ID
     *
     * Returns a single pet
     */
    public getPetById({
        path,
        auth = [['apiKey'], ['petstoreAuth']],
    }: { path: { petId: string }; auth?: string[][] | string[] }) {
        return this.awaitResponse(
            this.buildClient(auth).get(`pet/${path.petId}`, {
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /user/{username}
     *
     * Get user by user name
     */
    public getUserByName({ path }: { path: { username: string } }) {
        return this.awaitResponse(
            this.client.get(`user/${path.username}`, {
                responseType: 'json',
            }),
            {
                200: User,
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /user/login
     *
     * Logs user into the system
     */
    public loginUser({ query }: { query?: { username?: string; password?: string } } = {}) {
        return this.awaitResponse(
            this.client.get('user/login', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: LoginUserResponse,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /user/logout
     *
     * Logs out current logged in user session
     */
    public logoutUser() {
        return this.awaitResponse(
            this.client.get('user/logout', {
                responseType: 'text',
            }),
            {},
        )
    }

    /**
     * POST /store/order
     *
     * Place an order for a pet
     *
     * Place a new order in the store
     */
    public placeOrder({ body }: { body: Order }) {
        this.validateRequestBody(Order, body)

        return this.awaitResponse(
            this.client.post('store/order', {
                json: body,
                responseType: 'json',
            }),
            {
                200: Order,
                405: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * PUT /pet
     *
     * Update an existing pet
     *
     * Update an existing pet by Id
     */
    public updatePet({ body, auth = [['petstoreAuth']] }: { body: Pet; auth?: string[][] | string[] }) {
        this.validateRequestBody(Pet, body)

        return this.awaitResponse(
            this.buildClient(auth).put('pet', {
                json: body,
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
                405: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * POST /pet/{petId}
     *
     * Updates a pet in the store with form data
     */
    public updatePetWithForm({
        path,
        query,
        auth = [['petstoreAuth']],
    }: { path: { petId: string }; query?: { name?: string; status?: string }; auth?: string[][] | string[] }) {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}`, {
                searchParams: query ?? {},
                responseType: 'text',
            }),
            {
                405: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * PUT /user/{username}
     *
     * Update user
     *
     * This can only be done by the logged in user.
     */
    public updateUser({ body, path }: { body: User; path: { username: string } }) {
        this.validateRequestBody(User, body)

        return this.awaitResponse(
            this.client.put(`user/${path.username}`, {
                json: body,
                responseType: 'text',
            }),
            {},
        )
    }

    /**
     * POST /pet/{petId}/uploadImage
     *
     * uploads an image
     */
    public uploadFile({
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
            },
        )
    }

    public validateRequestBody<Body>(parser: { parse: (o: unknown) => Body }, body: unknown) {
        return parser.parse(body)
    }

    public async awaitResponse<I, S extends Record<PropertyKey, { parse: (o: unknown) => I }>>(
        response: CancelableRequest<Response>,
        schemas: S,
    ) {
        type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string
            ? `${S}` extends `${T}${infer _X}`
                ? S
                : never
            : never
        type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never
        const result = await response
        const schema = schemas[result.statusCode] ?? schemas.default
        const body = schema?.parse?.(result.body) ?? result.body
        return {
            statusCode: result.statusCode,
            headers: result.headers,
            body: body as InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]>,
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
                        options.headers.api_key = key
                    },
                ],
            },
        })
    }

    protected buildClient(auths: string[][] | string[] | undefined = this.defaultAuth, client?: Got): Got {
        const auth = (auths ?? [...this.availableAuth])
            .map((auth) => (Array.isArray(auth) ? auth : [auth]))
            .filter((auth) => auth.every((a) => this.availableAuth.has(a)))
        let chosenClient = client ?? this.client
        for (const chosen of auth[0] ?? []) {
            if (chosen === 'petstoreAuth') {
                chosenClient = this.buildPetstoreAuthClient(chosenClient)
            } else if (chosen === 'apiKey') {
                chosenClient = this.buildApiKeyClient(chosenClient)
            }
        }
        return chosenClient
    }
}
