/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'

import type { DefinedError } from 'ajv'
import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'

import { GetEmployeesResponse200, GetEmployeesResponseDefault } from './client.type.js'

/**
 * openapi
 */
export class DefaultTestClient {
    public client: Got

    public constructor({
        prefixUrl,
        options,
    }: {
        prefixUrl: string
        options?: Options | OptionsInit
    }) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    public getEmployees(): Promise<
        | SuccessResponse<'201' | '202' | '203' | '204' | '205' | '206' | '207' | '208' | '226', GetEmployeesResponseDefault>
        | SuccessResponse<'200', GetEmployeesResponse200>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('employees', {
                responseType: 'json',
            }),
            {
                200: GetEmployeesResponse200,
                default: GetEmployeesResponseDefault,
            },
        ) as ReturnType<this['getEmployees']>
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
}

/**
 * openapi
 */
export class DoubleSuccessClient {
    public client: Got

    public constructor({
        prefixUrl,
        options,
    }: {
        prefixUrl: string
        options?: Options | OptionsInit
    }) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    public getEmployees(): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('employees', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getEmployees']>
    }

    public getImage(): Promise<
        | SuccessResponse<'200', unknown>
        | SuccessResponse<'202', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('image', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
                202: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getImage']>
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
}

/**
 * openapi
 */
export class Edges {
    public client: Got

    public constructor({
        prefixUrl,
        options,
    }: {
        prefixUrl: string
        options?: Options | OptionsInit
    }) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    public getEmployees(): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('employees', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getEmployees']>
    }

    public getImage(): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('image', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getImage']>
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

/**
 * swagger
 */
export class SwaggerEdges {
    public client: Got

    public constructor({
        prefixUrl,
        options,
    }: {
        prefixUrl: string
        options?: Options | OptionsInit
    }) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    public getJsonResponse(): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('json-response', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getJsonResponse']>
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
}
