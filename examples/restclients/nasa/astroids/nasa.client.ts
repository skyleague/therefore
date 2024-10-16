/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'

import type { DefinedError } from 'ajv'
import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'

import { GetApiByResponse200, Project } from './nasa.type.js'

/**
 * TechPort
 *
 * TechPort RESTful API
 */
export class Astroids {
    public client: Got

    public constructor({
        prefixUrl,
        options,
        client = got,
    }: {
        prefixUrl: string | 'http://techport.nasa.gov/api' | 'https://techport.nasa.gov/api'
        options?: Options | OptionsInit
        client?: Got
    }) {
        this.client = client.extend(
            ...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined),
        )
    }

    /**
     * GET /api
     *
     * Returns the swagger specification for the API.
     */
    public getApi(): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get('api', {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['getApi']>
    }

    /**
     * GET /api/projects{.format}
     *
     * Returns a list of available technology project IDs.
     */
    public getApiBy({
        path,
        query,
    }: { path: { format: string }; query: { updatedSince: string; format: string } }): Promise<
        | SuccessResponse<'200', GetApiByResponse200>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/projects${path.format}`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: GetApiByResponse200,
            },
        ) as ReturnType<this['getApiBy']>
    }

    /**
     * GET /api/projects/{id}{.format}
     *
     * Returns information about a specific technology project.
     */
    public getApiProjectByFormat({
        path,
        query,
    }: { path: { id: string; format: string }; query: { format: string } }): Promise<
        | SuccessResponse<'200', Project>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/projects/${path.id}${path.format}`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: Project,
            },
        ) as ReturnType<this['getApiProjectByFormat']>
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
