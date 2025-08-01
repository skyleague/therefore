/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
// biome-ignore-all lint: this file is generated
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'
import { got } from 'got'
import type { ZodError, ZodSafeParseResult } from 'zod/v4'

import { Company, EntityType, Foobar } from './issue.zod.js'

/**
 * test
 */
export class Issue {
    public client: Got

    public constructor({
        prefixUrl,
        options,
        client = got,
    }: {
        prefixUrl: string
        options?: Options | OptionsInit
        client?: Got
    }) {
        this.client = client.extend(
            ...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined),
        )
    }

    /**
     * GET /api/company/{id}
     */
    public companyGet({
        path,
    }: {
        path: { id: string }
    }): Promise<
        | SuccessResponse<'200', Company>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/company/${path.id}`, {
                responseType: 'json',
            }),
            {
                200: Company,
            },
        ) as ReturnType<this['companyGet']>
    }
    public async awaitResponse<I, S extends Record<PropertyKey, { safeParse: (o: unknown) => ZodSafeParseResult<I> }>>(
        response: CancelableRequest<NoInfer<Response<I>>>,
        schemas: S,
    ) {
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
        const body = validator?.safeParse?.(result.body)
        if (result.statusCode < 200 || result.statusCode >= 300) {
            return {
                success: false as const,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: body?.success ? body.data : result.body,
                error: body !== undefined && !body.success ? body.error : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || !body.success) {
            return {
                success: body === undefined,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: result.body,
                error: body?.error,
                where: 'response:body',
            }
        }
        return {
            success: true as const,
            statusCode: result.statusCode.toString(),
            status,
            headers: result.headers,
            right: body.data,
        }
    }
}

/**
 * Test
 */
export class Issue2 {
    public client: Got

    public constructor({
        prefixUrl,
        options,
        client = got,
    }: {
        prefixUrl: string
        options?: Options | OptionsInit
        client?: Got
    }) {
        this.client = client.extend(
            ...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined),
        )
    }

    /**
     * POST /search
     */
    public createSearch({
        body,
    }: {
        body: Foobar
    }): Promise<
        | SuccessResponse<'204', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(Foobar, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('search', {
                json: _body.right,
                responseType: 'text',
            }),
            {
                204: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['createSearch']>
    }

    public validateRequestBody<Body>(
        parser: { safeParse: (o: unknown) => ZodSafeParseResult<Body> },
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
    public async awaitResponse<I, S extends Record<PropertyKey, { safeParse: (o: unknown) => ZodSafeParseResult<I> }>>(
        response: CancelableRequest<NoInfer<Response<I>>>,
        schemas: S,
    ) {
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
        const body = validator?.safeParse?.(result.body)
        if (result.statusCode < 200 || result.statusCode >= 300) {
            return {
                success: false as const,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: body?.success ? body.data : result.body,
                error: body !== undefined && !body.success ? body.error : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || !body.success) {
            return {
                success: body === undefined,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: result.body,
                error: body?.error,
                where: 'response:body',
            }
        }
        return {
            success: true as const,
            statusCode: result.statusCode.toString(),
            status,
            headers: result.headers,
            right: body.data,
        }
    }
}

/**
 * API Specification
 *
 * REST APIs
 */
export class Issue3 {
    public client: Got

    public constructor({
        prefixUrl,
        options,
        client = got,
    }: {
        prefixUrl: string | `${string}//api.example.com/`
        options?: Options | OptionsInit
        client?: Got
    }) {
        this.client = client.extend(
            ...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined),
        )
    }

    /**
     * POST /api/v2/executeRequest
     *
     * executeRequest
     */
    public executeRequestUsingPost({
        body,
    }: {
        body: EntityType
    }): Promise<
        | SuccessResponse<'200', EntityType>
        | SuccessResponse<'201', unknown>
        | FailureResponse<'401', unknown, 'response:statuscode'>
        | FailureResponse<'403', unknown, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '401' | '403' | '404'>,
              unknown,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        const _body = this.validateRequestBody(EntityType, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post('api/v2/executeRequest', {
                json: _body.right,
                responseType: 'json',
            }),
            {
                200: EntityType,
                201: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                401: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                403: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
            },
        ) as ReturnType<this['executeRequestUsingPost']>
    }

    public validateRequestBody<Body>(
        parser: { safeParse: (o: unknown) => ZodSafeParseResult<Body> },
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
    public async awaitResponse<I, S extends Record<PropertyKey, { safeParse: (o: unknown) => ZodSafeParseResult<I> }>>(
        response: CancelableRequest<NoInfer<Response<I>>>,
        schemas: S,
    ) {
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
        const body = validator?.safeParse?.(result.body)
        if (result.statusCode < 200 || result.statusCode >= 300) {
            return {
                success: false as const,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: body?.success ? body.data : result.body,
                error: body !== undefined && !body.success ? body.error : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || !body.success) {
            return {
                success: body === undefined,
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: result.body,
                error: body?.error,
                where: 'response:body',
            }
        }
        return {
            success: true as const,
            statusCode: result.statusCode.toString(),
            status,
            headers: result.headers,
            right: body.data,
        }
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
    headers: IncomingHttpHeaders
    right: T
}
export interface FailureResponse<StatusCode = string, T = unknown, Where = never, Headers = IncomingHttpHeaders> {
    success: false
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: Headers
    error: ZodError<T> | undefined
    left: T
    where: Where
}
export type StatusCode<Major extends number = 1 | 2 | 3 | 4 | 5> = `${Major}${number}`
