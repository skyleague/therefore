/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'

import type { DefinedError } from 'ajv'
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
} from './petstore.type.js'

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
        options?: Options | OptionsInit
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
     * Add a new pet to the store
     */
    public addPet({
        body,
        auth = [['petstoreAuth']],
    }: { body: Pet; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'405', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '405'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(Pet, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.buildClient(auth).post('pet', {
                json: _body.right as Pet,
                responseType: 'json',
            }),
            {
                200: Pet,
                405: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['addPet']>
    }

    /**
     * Create user
     *
     * This can only be done by the logged in user.
     */
    public createUser({
        body,
    }: { body: User }): Promise<
        | SuccessResponse<StatusCode<2>, User>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(User, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('user', {
                json: _body.right as User,
                responseType: 'json',
            }),
            {
                default: User,
            },
        ) as ReturnType<this['createUser']>
    }

    /**
     * Creates list of users with given input array
     */
    public createUsersWithListInput({
        body,
    }: { body: CreateUsersWithListInputRequest }): Promise<
        | SuccessResponse<'200', User>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(CreateUsersWithListInputRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('user/createWithList', {
                json: _body.right as CreateUsersWithListInputRequest,
                responseType: 'json',
            }),
            {
                200: User,
            },
        ) as ReturnType<this['createUsersWithListInput']>
    }

    /**
     * Delete purchase order by ID
     *
     * For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors
     */
    public deleteOrder({
        path,
    }: { path: { orderId: string } }): Promise<
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.delete(`store/order/${path.orderId}`, {
                responseType: 'text',
            }),
            {
                400: { parse: (x: unknown) => ({ right: x }) },
                404: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['deleteOrder']>
    }

    /**
     * Deletes a pet
     */
    public deletePet({
        path,
        headers,
        auth = [['petstoreAuth']],
    }: { path: { petId: string }; headers?: { api_key?: string }; auth?: string[][] | string[] }): Promise<
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).delete(`pet/${path.petId}`, {
                headers: headers ?? {},
                responseType: 'text',
            }),
            {
                400: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['deletePet']>
    }

    /**
     * Delete user
     *
     * This can only be done by the logged in user.
     */
    public deleteUser({
        path,
    }: { path: { username: string } }): Promise<
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.delete(`user/${path.username}`, {
                responseType: 'text',
            }),
            {
                400: { parse: (x: unknown) => ({ right: x }) },
                404: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['deleteUser']>
    }

    /**
     * Finds Pets by status
     *
     * Multiple status values can be provided with comma separated strings
     */
    public findPetsByStatus({
        query,
        auth = [['petstoreAuth']],
    }: { query?: { status?: string }; auth?: string[][] | string[] } = {}): Promise<
        | SuccessResponse<'200', FindPetsByStatusResponse>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByStatus', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByStatusResponse,
                400: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['findPetsByStatus']>
    }

    /**
     * Finds Pets by tags
     *
     * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
     */
    public findPetsByTags({
        query,
        auth = [['petstoreAuth']],
    }: { query?: { tags?: string }; auth?: string[][] | string[] } = {}): Promise<
        | SuccessResponse<'200', FindPetsByTagsResponse>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get('pet/findByTags', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: FindPetsByTagsResponse,
                400: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['findPetsByTags']>
    }

    /**
     * Returns pet inventories by status
     *
     * Returns a map of status codes to quantities
     */
    public getInventory({
        auth = [['apiKey']],
    }: { auth?: string[][] | string[] } = {}): Promise<
        | SuccessResponse<'200', GetInventoryResponse>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get('store/inventory', {
                responseType: 'json',
            }),
            {
                200: GetInventoryResponse,
            },
        ) as ReturnType<this['getInventory']>
    }

    /**
     * Find purchase order by ID
     *
     * For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
     */
    public getOrderById({
        path,
    }: { path: { orderId: string } }): Promise<
        | SuccessResponse<'200', Order>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`store/order/${path.orderId}`, {
                responseType: 'json',
            }),
            {
                200: Order,
                400: { parse: (x: unknown) => ({ right: x }) },
                404: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getOrderById']>
    }

    /**
     * Find pet by ID
     *
     * Returns a single pet
     */
    public getPetById({
        path,
        auth = [['apiKey'], ['petstoreAuth']],
    }: { path: { petId: string }; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).get(`pet/${path.petId}`, {
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { parse: (x: unknown) => ({ right: x }) },
                404: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getPetById']>
    }

    /**
     * Get user by user name
     */
    public getUserByName({
        path,
    }: { path: { username: string } }): Promise<
        | SuccessResponse<'200', User>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`user/${path.username}`, {
                responseType: 'json',
            }),
            {
                200: User,
                400: { parse: (x: unknown) => ({ right: x }) },
                404: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getUserByName']>
    }

    /**
     * Logs user into the system
     */
    public loginUser({
        query,
    }: { query?: { username?: string; password?: string } } = {}): Promise<
        | SuccessResponse<'200', LoginUserResponse>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('user/login', {
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: LoginUserResponse,
                400: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['loginUser']>
    }

    /**
     * Logs out current logged in user session
     */
    public logoutUser(): Promise<
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('user/logout', {
                responseType: 'text',
            }),
            {},
        ) as ReturnType<this['logoutUser']>
    }

    /**
     * Place an order for a pet
     *
     * Place a new order in the store
     */
    public placeOrder({
        body,
    }: { body: Order }): Promise<
        | SuccessResponse<'200', Order>
        | FailureResponse<'405', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '405'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(Order, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('store/order', {
                json: _body.right as Order,
                responseType: 'json',
            }),
            {
                200: Order,
                405: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['placeOrder']>
    }

    /**
     * Update an existing pet
     *
     * Update an existing pet by Id
     */
    public updatePet({
        body,
        auth = [['petstoreAuth']],
    }: { body: Pet; auth?: string[][] | string[] }): Promise<
        | SuccessResponse<'200', Pet>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<'405', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '404' | '405'>,
              unknown,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        const _body = this.validateRequestBody(Pet, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.buildClient(auth).put('pet', {
                json: _body.right as Pet,
                responseType: 'json',
            }),
            {
                200: Pet,
                400: { parse: (x: unknown) => ({ right: x }) },
                404: { parse: (x: unknown) => ({ right: x }) },
                405: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['updatePet']>
    }

    /**
     * Updates a pet in the store with form data
     */
    public updatePetWithForm({
        path,
        query,
        auth = [['petstoreAuth']],
    }: { path: { petId: string }; query?: { name?: string; status?: string }; auth?: string[][] | string[] }): Promise<
        | FailureResponse<'405', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '405'>, unknown, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}`, {
                searchParams: query ?? {},
                responseType: 'text',
            }),
            {
                405: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['updatePetWithForm']>
    }

    /**
     * Update user
     *
     * This can only be done by the logged in user.
     */
    public updateUser({
        body,
        path,
    }: { body: User; path: { username: string } }): Promise<
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(User, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.put(`user/${path.username}`, {
                json: _body.right as User,
                responseType: 'text',
            }),
            {},
        ) as ReturnType<this['updateUser']>
    }

    /**
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
    }): Promise<
        | SuccessResponse<'200', ApiResponse>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.buildClient(auth).post(`pet/${path.petId}/uploadImage`, {
                body: body,
                searchParams: query ?? {},
                responseType: 'json',
            }),
            {
                200: ApiResponse,
            },
        ) as ReturnType<this['uploadFile']>
    }

    public validateRequestBody<Parser extends { parse: (o: unknown) => { left: DefinedError[] } | { right: Body } }, Body>(
        parser: Parser,
        body: unknown,
    ) {
        const _body = parser.parse(body)
        if ('left' in _body) {
            return {
                statusCode: undefined,
                status: undefined,
                headers: undefined,
                left: body,
                validationErrors: _body.left,
                where: 'request:body',
            } satisfies FailureResponse<undefined, unknown, 'request:body', undefined>
        }
        return _body
    }

    public async awaitResponse<
        I,
        S extends Record<PropertyKey, { parse: (o: I) => { left: DefinedError[] } | { right: unknown } } | undefined>,
    >(response: CancelableRequest<Response<I>>, schemas: S) {
        const result = await response
        const status =
            result.statusCode < 200
                ? 'informational'
                : result.statusCode < 300
                  ? 'success'
                  : result.statusCode < 400
                    ? 'redirection'
                    : result.statusCode < 500
                      ? 'client-error'
                      : 'server-error'
        const validator = schemas[result.statusCode] ?? schemas.default
        const body = validator?.parse?.(result.body)
        if (result.statusCode < 200 || result.statusCode >= 300) {
            return {
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: body !== undefined && 'right' in body ? body.right : result.body,
                validationErrors: body !== undefined && 'left' in body ? body.left : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || 'left' in body) {
            return {
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: result.body,
                validationErrors: body?.left,
                where: 'response:body',
            }
        }
        return { statusCode: result.statusCode.toString(), status, headers: result.headers, right: result.body }
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
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: IncomingHttpHeaders
    right: T
}
export interface FailureResponse<StatusCode = string, T = unknown, Where = never, Headers = IncomingHttpHeaders> {
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: Headers
    validationErrors: DefinedError[] | undefined
    left: T
    where: Where
}
export type StatusCode<Major extends number = 1 | 2 | 3 | 4 | 5> = `${Major}${number}`
