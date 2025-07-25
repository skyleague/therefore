/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
// biome-ignore-all lint: this file is generated
/* eslint-disable */

import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'
import { got } from 'got'

import {
    ApiResponse,
    CreateUsersWithListInputRequest,
    FindPetsByStatusResponse200,
    FindPetsByTagsResponse200,
    GetInventoryResponse200,
    LoginUserResponse200,
    Order,
    Pet,
    User,
} from './petstore.zod.js'

/**
 * Swagger Petstore - OpenAPI 3.0
 *
 * This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
 * Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
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
     * Add a new pet to the store.
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
                400: { parse: (x: unknown): string => x as string },
                422: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * POST /user
     *
     * Create user.
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
                200: User,
            },
        )
    }

    /**
     * POST /user/createWithList
     *
     * Creates list of users with given input array.
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
     * Delete purchase order by identifier.
     *
     * For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.
     */
    public deleteOrder({ path }: { path: { orderId: string } }) {
        return this.awaitResponse(
            this.client.delete(`store/order/${path.orderId}`, {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown): string => x as string },
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * DELETE /pet/{petId}
     *
     * Deletes a pet.
     *
     * Delete a pet.
     */
    public deletePet({
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
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown): string => x as string },
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * DELETE /user/{username}
     *
     * Delete user resource.
     *
     * This can only be done by the logged in user.
     */
    public deleteUser({ path }: { path: { username: string } }) {
        return this.awaitResponse(
            this.client.delete(`user/${path.username}`, {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown): string => x as string },
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /pet/findByStatus
     *
     * Finds Pets by status.
     *
     * Multiple status values can be provided with comma separated strings.
     */
    public findPetsByStatus({
        query,
        auth = [['petstoreAuth']],
    }: {
        query?: { status?: string }
        auth?: string[][] | string[]
    } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByStatus', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByStatusResponse200,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /pet/findByTags
     *
     * Finds Pets by tags.
     *
     * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
     */
    public findPetsByTags({
        query,
        auth = [['petstoreAuth']],
    }: {
        query?: { tags?: string }
        auth?: string[][] | string[]
    } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByTags', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByTagsResponse200,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /store/inventory
     *
     * Returns pet inventories by status.
     *
     * Returns a map of status codes to quantities.
     */
    public getInventory({ auth = [['apiKey']] }: { auth?: string[][] | string[] } = {}) {
        return this.awaitResponse(
            this.buildClient(auth).get('store/inventory', {
                responseType: 'json',
            }),
            {
                200: GetInventoryResponse200,
            },
        )
    }

    /**
     * GET /store/order/{orderId}
     *
     * Find purchase order by ID.
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
     * Find pet by ID.
     *
     * Returns a single pet.
     */
    public getPetById({
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
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /user/{username}
     *
     * Get user by user name.
     *
     * Get user detail based on username.
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
     * Logs user into the system.
     *
     * Log into the system.
     */
    public loginUser({ query }: { query?: { username?: string; password?: string } } = {}) {
        return this.awaitResponse(
            this.client.get('user/login', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: LoginUserResponse200,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * GET /user/logout
     *
     * Logs out current logged in user session.
     *
     * Log user out of the system.
     */
    public logoutUser() {
        return this.awaitResponse(
            this.client.get('user/logout', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * POST /store/order
     *
     * Place an order for a pet.
     *
     * Place a new order in the store.
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
                400: { parse: (x: unknown): string => x as string },
                422: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * PUT /pet
     *
     * Update an existing pet.
     *
     * Update an existing pet by Id.
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
                422: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * POST /pet/{petId}
     *
     * Updates a pet in the store with form data.
     *
     * Updates a pet resource based on the form data.
     */
    public updatePetWithForm({
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
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * PUT /user/{username}
     *
     * Update user resource.
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
            {
                200: { parse: (x: unknown): string => x as string },
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
            },
        )
    }

    /**
     * POST /pet/{petId}/uploadImage
     *
     * Uploads an image.
     *
     * Upload image of the pet.
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
                400: { parse: (x: unknown): string => x as string },
                404: { parse: (x: unknown): string => x as string },
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
