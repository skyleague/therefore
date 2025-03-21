import ky from 'ky'
import type { KyInstance, Options, ResponsePromise } from 'ky'
import type { SafeParseReturnType, ZodError } from 'zod'

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
export class PetStoreKy {
    public client: KyInstance

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
        client = ky,
    }: {
        prefixUrl: string | `${string}/api/v3`
        options?: Options
        auth: {
            petstoreAuth?: string | (() => Promise<string>)
            apiKey?: string | (() => Promise<string>)
        }
        defaultAuth?: string[][] | string[]
        client?: KyInstance
    }) {
        this.client = client.extend({ prefixUrl, throwHttpErrors: false, ...options })
        this.auth = auth
        this.availableAuth = new Set(Object.keys(auth))
        this.defaultAuth = defaultAuth
    }

    /**
     * POST /pet
     *
     * Add a new pet to the store.
     */
    public addPet({
        body,
        auth = [['petstoreAuth']],
    }: { body: Pet; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'422', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '422'>, unknown, 'response:statuscode', Headers>
    > {
        const _body = this.validateRequestBody(Pet, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.buildClient(auth).post('pet', {
                json: _body.right,
            }),
            {
                200: Pet,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                422: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['addPet']>
    }

    /**
     * POST /user
     *
     * Create user.
     *
     * This can only be done by the logged in user.
     */
    public createUser({
        body,
    }: { body: User }): Promise<
        | SuccessResponse<'200', User>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', Headers>
    > {
        const _body = this.validateRequestBody(User, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('user', {
                json: _body.right,
            }),
            {
                200: User,
            },
            'json',
        ) as ReturnType<this['createUser']>
    }

    /**
     * POST /user/createWithList
     *
     * Creates list of users with given input array.
     */
    public createUsersWithListInput({
        body,
    }: { body: CreateUsersWithListInputRequest }): Promise<
        | SuccessResponse<'200', User>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', Headers>
    > {
        const _body = this.validateRequestBody(CreateUsersWithListInputRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('user/createWithList', {
                json: _body.right,
            }),
            {
                200: User,
            },
            'json',
        ) as ReturnType<this['createUsersWithListInput']>
    }

    /**
     * DELETE /store/order/{orderId}
     *
     * Delete purchase order by identifier.
     *
     * For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.
     */
    public deleteOrder({
        path,
    }: { path: { orderId: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.delete(`store/order/${path.orderId}`, {}),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'text',
        ) as ReturnType<this['deleteOrder']>
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
    }: { path: { petId: string }; headers?: { api_key?: string }; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).delete(`pet/${path.petId}`, {
                headers: headers ?? {},
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'text',
        ) as ReturnType<this['deletePet']>
    }

    /**
     * DELETE /user/{username}
     *
     * Delete user resource.
     *
     * This can only be done by the logged in user.
     */
    public deleteUser({
        path,
    }: { path: { username: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.delete(`user/${path.username}`, {}),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'text',
        ) as ReturnType<this['deleteUser']>
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
    }: { query?: { status?: string }; auth?: string[][] | string[] } = {}): Promise<
        | SuccessResponse<'200', FindPetsByStatusResponse200>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByStatus', {
                searchParams: query ?? {},
            }),
            {
                200: FindPetsByStatusResponse200,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['findPetsByStatus']>
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
    }: { query?: { tags?: string }; auth?: string[][] | string[] } = {}): Promise<
        | SuccessResponse<'200', FindPetsByTagsResponse200>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByTags', {
                searchParams: query ?? {},
            }),
            {
                200: FindPetsByTagsResponse200,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['findPetsByTags']>
    }

    /**
     * GET /store/inventory
     *
     * Returns pet inventories by status.
     *
     * Returns a map of status codes to quantities.
     */
    public getInventory({
        auth = [['apiKey']],
    }: { auth?: string[][] | string[] } = {}): Promise<
        | SuccessResponse<'200', GetInventoryResponse200>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get('store/inventory', {}),
            {
                200: GetInventoryResponse200,
            },
            'json',
        ) as ReturnType<this['getInventory']>
    }

    /**
     * GET /store/order/{orderId}
     *
     * Find purchase order by ID.
     *
     * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
     */
    public getOrderById({
        path,
    }: { path: { orderId: string } }): Promise<
        | SuccessResponse<'200', Order>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.get(`store/order/${path.orderId}`, {}),
            {
                200: Order,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['getOrderById']>
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
    }: { path: { petId: string }; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get(`pet/${path.petId}`, {}),
            {
                200: Pet,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['getPetById']>
    }

    /**
     * GET /user/{username}
     *
     * Get user by user name.
     *
     * Get user detail based on username.
     */
    public getUserByName({
        path,
    }: { path: { username: string } }): Promise<
        | SuccessResponse<'200', User>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.get(`user/${path.username}`, {}),
            {
                200: User,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['getUserByName']>
    }

    /**
     * GET /user/login
     *
     * Logs user into the system.
     *
     * Log into the system.
     */
    public loginUser({
        query,
    }: { query?: { username?: string; password?: string } } = {}): Promise<
        | SuccessResponse<'200', LoginUserResponse200>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.get('user/login', {
                searchParams: query ?? {},
            }),
            {
                200: LoginUserResponse200,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['loginUser']>
    }

    /**
     * GET /user/logout
     *
     * Logs out current logged in user session.
     *
     * Log user out of the system.
     */
    public logoutUser(): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.get('user/logout', {}),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'text',
        ) as ReturnType<this['logoutUser']>
    }

    /**
     * POST /store/order
     *
     * Place an order for a pet.
     *
     * Place a new order in the store.
     */
    public placeOrder({
        body,
    }: { body: Order }): Promise<
        | SuccessResponse<'200', Order>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'422', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '422'>, unknown, 'response:statuscode', Headers>
    > {
        const _body = this.validateRequestBody(Order, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('store/order', {
                json: _body.right,
            }),
            {
                200: Order,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                422: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['placeOrder']>
    }

    /**
     * PUT /pet
     *
     * Update an existing pet.
     *
     * Update an existing pet by Id.
     */
    public updatePet({
        body,
        auth = [['petstoreAuth']],
    }: { body: Pet; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<'422', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404' | '422'>, unknown, 'response:statuscode', Headers>
    > {
        const _body = this.validateRequestBody(Pet, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.buildClient(auth).put('pet', {
                json: _body.right,
            }),
            {
                200: Pet,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                422: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['updatePet']>
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
    }: { path: { petId: string }; query?: { name?: string; status?: string }; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}`, {
                searchParams: query ?? {},
            }),
            {
                200: Pet,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['updatePetWithForm']>
    }

    /**
     * PUT /user/{username}
     *
     * Update user resource.
     *
     * This can only be done by the logged in user.
     */
    public updateUser({
        body,
        path,
    }: { body: User; path: { username: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        const _body = this.validateRequestBody(User, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.put(`user/${path.username}`, {
                json: _body.right,
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'text',
        ) as ReturnType<this['updateUser']>
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
    }): Promise<
        | SuccessResponse<'200', ApiResponse>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}/uploadImage`, {
                body: body,
                searchParams: query ?? {},
            }),
            {
                200: ApiResponse,
                400: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
            'json',
        ) as ReturnType<this['uploadFile']>
    }

    public validateRequestBody<Body>(
        parser: { safeParse: (o: unknown) => SafeParseReturnType<unknown, Body> },
        body: unknown,
    ): { right: Body } | FailureResponse<undefined, unknown, 'request:body', undefined> {
        const _body = parser.safeParse(body)
        if (!_body.success) {
            return {
                success: false as const,
                statusCode: undefined,
                status: undefined,
                headers: undefined,
                left: body,
                error: _body.error,
                where: 'request:body',
            } satisfies FailureResponse<undefined, unknown, 'request:body', undefined>
        }
        return { right: _body.data }
    }

    public async awaitResponse<I, S extends Record<PropertyKey, { safeParse: (o: unknown) => SafeParseReturnType<unknown, I> }>>(
        response: ResponsePromise<I>,
        schemas: S,
        responseType?: 'json' | 'text',
    ) {
        const _body = (await (responseType !== undefined ? response[responseType]() : response.text())) as I
        const result = await response
        const status =
            result.status < 200
                ? 'informational'
                : result.status < 300
                  ? 'success'
                  : result.status < 400
                    ? 'redirection'
                    : result.status < 500
                      ? 'client-error'
                      : 'server-error'
        const validator = schemas[result.status] ?? schemas.default
        const body = validator?.safeParse?.(_body)
        if (result.status < 200 || result.status >= 300) {
            return {
                success: false as const,
                statusCode: result.status.toString(),
                status,
                headers: result.headers,
                left: body?.success ? body.data : _body,
                error: body !== undefined && !body.success ? body.error : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || !body.success) {
            return {
                success: body === undefined,
                statusCode: result.status.toString(),
                status,
                headers: result.headers,
                left: _body,
                error: body?.error,
                where: 'response:body',
            }
        }
        return { success: true as const, statusCode: result.status.toString(), status, headers: result.headers, right: body.data }
    }

    protected buildPetstoreAuthClient(client: KyInstance) {
        return client
    }

    protected buildApiKeyClient(client: KyInstance) {
        return client.extend({
            hooks: {
                beforeRequest: [
                    async (options) => {
                        const apiKey = this.auth.apiKey
                        const key = typeof apiKey === 'function' ? await apiKey() : apiKey
                        options.headers.set('api_key', `${key}`)
                    },
                ],
            },
        })
    }

    protected buildClient(auths: string[][] | string[] | undefined = this.defaultAuth, client?: KyInstance): KyInstance {
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

export type Status<Major> = Major extends string
    ? Major extends `1${number}`
        ? 'informational'
        : Major extends `2${number}`
          ? 'success'
          : Major extends `3${number}`
            ? 'redirection'
            : Major extends `4${number}`
              ? 'client-error'
              : 'server-error'
    : undefined
export interface SuccessResponse<StatusCode extends string, T> {
    success: true
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: Headers
    right: T
}
export interface FailureResponse<StatusCode = string, T = unknown, Where = never, HeaderResponse = Headers> {
    success: false
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: HeaderResponse
    error: ZodError<T> | undefined
    left: T
    where: Where
}
export type StatusCode<Major extends number = 1 | 2 | 3 | 4 | 5> = `${Major}${number}`
