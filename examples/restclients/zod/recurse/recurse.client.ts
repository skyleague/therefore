import ky from 'ky'
import type { KyInstance, Options, ResponsePromise } from 'ky'
import type { SafeParseReturnType, ZodError } from 'zod'

import { BusinessRelationModel, GetBusinessesResponse } from './recurse.zod.js'

/**
 * Recursive Model Example
 */
export class Client {
    public client: KyInstance

    public constructor({
        prefixUrl,
        options,
        client = ky,
    }: {
        prefixUrl: string
        options?: Options
        client?: KyInstance
    }) {
        this.client = client.extend({ prefixUrl, throwHttpErrors: false, ...options })
    }

    /**
     * GET /business
     */
    public getBusiness(): Promise<
        | SuccessResponse<'200', BusinessRelationModel>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.get('business', {}),
            {
                200: BusinessRelationModel,
            },
            'json',
        ) as ReturnType<this['getBusiness']>
    }

    /**
     * GET /businesses
     */
    public getBusinesses(): Promise<
        | SuccessResponse<'200', GetBusinessesResponse>
        | FailureResponse<StatusCode<2>, string, 'response:body', Headers>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', Headers>
    > {
        return this.awaitResponse(
            this.client.get('businesses', {}),
            {
                200: GetBusinessesResponse,
            },
            'json',
        ) as ReturnType<this['getBusinesses']>
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
