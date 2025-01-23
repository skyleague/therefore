/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'
import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'
import type { SafeParseReturnType, ZodError } from 'zod'

import { File, OBErrorResponse1 } from './banking.zod.js'

/**
 * Payment Initiation API
 *
 * Swagger for Payment Initiation API Specification
 */
export class Banking {
    public client: Got

    public auth: {
        psuoAuth2Security?: string | (() => Promise<string>)
        tppoAuth2Security?: string | (() => Promise<string>)
    }

    public availableAuth: Set<string>
    public defaultAuth: string[][] | string[] | undefined

    public constructor({
        prefixUrl = 'https://openbanking.org.uk',
        options,
        auth = {},
        defaultAuth,
        client = got,
    }: {
        prefixUrl?: string | 'https://openbanking.org.uk' | `${string}/open-banking/v3.1/pisp`
        options?: Options | OptionsInit
        auth: {
            psuoAuth2Security?: string | (() => Promise<string>)
            tppoAuth2Security?: string | (() => Promise<string>)
        }
        defaultAuth?: string[][] | string[]
        client?: Got
    }) {
        this.client = client.extend(
            ...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined),
        )
        this.auth = auth
        this.availableAuth = new Set(Object.keys(auth))
        this.defaultAuth = defaultAuth
    }

    /**
     * POST /file-payment-consents/{ConsentId}/file
     *
     * Create File Payment Consents
     */
    public createFilePaymentConsentsConsentIdFile({
        body,
        path,
        headers,
        auth = [['tppoAuth2Security']],
    }: {
        body: File
        path: { consentId: string }
        headers: {
            'x-fapi-auth-date'?: string
            'x-fapi-customer-ip-address'?: string
            'x-fapi-interaction-id'?: string
            Authorization: string
            'x-idempotency-key': string
            'x-jws-signature': string
            'x-customer-user-agent'?: string
        }
        auth?: string[][] | string[]
    }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'400', OBErrorResponse1, 'response:statuscode'>
        | FailureResponse<'401', unknown, 'response:statuscode'>
        | FailureResponse<'403', OBErrorResponse1, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<'405', unknown, 'response:statuscode'>
        | FailureResponse<'406', unknown, 'response:statuscode'>
        | FailureResponse<'415', unknown, 'response:statuscode'>
        | FailureResponse<'429', unknown, 'response:statuscode'>
        | FailureResponse<'500', OBErrorResponse1, 'response:statuscode'>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '401' | '403' | '404' | '405' | '406' | '415' | '429' | '500'>,
              unknown,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        const _body = this.validateRequestBody(File, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.buildClient(auth).post(`file-payment-consents/${path.consentId}/file`, {
                json: _body.right,
                headers: headers,
                responseType: 'text',
            }),
            {
                200: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                400: OBErrorResponse1,
                401: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                403: OBErrorResponse1,
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                405: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                406: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                415: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                429: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                500: OBErrorResponse1,
            },
        ) as ReturnType<this['createFilePaymentConsentsConsentIdFile']>
    }

    /**
     * GET /file-payment-consents/{ConsentId}/file
     *
     * Get File Payment Consents
     */
    public getFilePaymentConsentsConsentIdFile({
        path,
        headers,
        auth = [['tppoAuth2Security']],
    }: {
        path: { consentId: string }
        headers: {
            'x-fapi-auth-date'?: string
            'x-fapi-customer-ip-address'?: string
            'x-fapi-interaction-id'?: string
            Authorization: string
            'x-customer-user-agent'?: string
        }
        auth?: string[][] | string[]
    }): Promise<
        | SuccessResponse<'200', File>
        | FailureResponse<'400', OBErrorResponse1, 'response:statuscode'>
        | FailureResponse<'401', unknown, 'response:statuscode'>
        | FailureResponse<'403', OBErrorResponse1, 'response:statuscode'>
        | FailureResponse<'404', unknown, 'response:statuscode'>
        | FailureResponse<'405', unknown, 'response:statuscode'>
        | FailureResponse<'406', unknown, 'response:statuscode'>
        | FailureResponse<'429', unknown, 'response:statuscode'>
        | FailureResponse<'500', OBErrorResponse1, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '401' | '403' | '404' | '405' | '406' | '429' | '500'>,
              unknown,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        return this.awaitResponse(
            this.buildClient(auth).get(`file-payment-consents/${path.consentId}/file`, {
                headers: headers,
                responseType: 'json',
            }),
            {
                200: File,
                400: OBErrorResponse1,
                401: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                403: OBErrorResponse1,
                404: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                405: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                406: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                429: { safeParse: (x: unknown) => ({ success: true, data: x }) },
                500: OBErrorResponse1,
            },
        ) as ReturnType<this['getFilePaymentConsentsConsentIdFile']>
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

    protected buildPsuoAuth2SecurityClient(client: Got) {
        return client
    }

    protected buildTppoAuth2SecurityClient(client: Got) {
        return client
    }

    protected buildClient(auths: string[][] | string[] | undefined = this.defaultAuth, client?: Got): Got {
        const auth = (auths ?? [...this.availableAuth])
            .map((auth) => (Array.isArray(auth) ? auth : [auth]))
            .filter((auth) => auth.every((a) => this.availableAuth.has(a)))
        let chosenClient = client ?? this.client
        for (const chosen of auth[0] ?? []) {
            if (chosen === 'psuoAuth2Security') {
                chosenClient = this.buildPsuoAuth2SecurityClient(chosenClient)
            } else if (chosen === 'tppoAuth2Security') {
                chosenClient = this.buildTppoAuth2SecurityClient(chosenClient)
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
