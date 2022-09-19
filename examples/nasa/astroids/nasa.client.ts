/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import got from 'got'
import type { CancelableRequest, Got, Options, Response } from 'got'
import type { ValidateFunction, ErrorObject } from 'ajv'
import { IncomingHttpHeaders } from 'http'
import { GetApiByResponse200, Project } from './nasa.type'

export class Astroids {
    public client: Got

    public constructor({
        prefixUrl,
        options,
    }: {
        prefixUrl: string | 'http://techport.nasa.gov/api' | 'https://techport.nasa.gov/api'
        options?: Options
    }) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    /**
     * Returns the swagger specification for the API.
     */
    public async getApi() {
        return this.awaitResponse(this.client.get(`api`, {}), {
            200: { is: (x: unknown): x is string => true },
        })
    }

    /**
     * Returns information about a specific technology project.
     */
    public async getApiProjectByFormat({ path, query }: { path: { id: string; format: string }; query: { format: string } }) {
        return this.awaitResponse(
            this.client.get(`api/projects/${path.id}${path.format}`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: Project,
            }
        )
    }

    /**
     * Returns a list of available technology project IDs.
     */
    public async getApiBy({ path, query }: { path: { format: string }; query: { updatedSince: string; format: string } }) {
        return this.awaitResponse(
            this.client.get(`api/projects${path.format}`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: GetApiByResponse200,
            }
        )
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
}
