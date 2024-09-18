/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'

import { Comic } from './nullable.type.js'

/**
 * XKCD
 *
 * Webcomic of romance, sarcasm, math, and language.
 */
export class XKCDNullable {
    public client: Got

    public constructor({
        prefixUrl = 'http://xkcd.com/',
        options,
        client = got,
    }: {
        prefixUrl?: string | 'http://xkcd.com/'
        options?: Options | OptionsInit
        client?: Got
    } = {}) {
        this.client = client.extend(...[{ prefixUrl }, options].filter((o): o is Options => o !== undefined))
    }

    /**
     * Fetch current comic and metadata.
     */
    public getInfo0Json() {
        return this.awaitResponse(
            this.client.get('info.0.json', {
                responseType: 'json',
            }),
            {
                200: Comic,
            },
        )
    }

    /**
     * Fetch comics and metadata  by comic id.
     */
    public getInfo0JsonByComicId({ path }: { path: { comicId: string } }) {
        return this.awaitResponse(
            this.client.get(`${path.comicId}/info.0.json`, {
                responseType: 'json',
            }),
            {
                200: Comic,
            },
        )
    }

    public async awaitResponse<
        T,
        S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; assert?: (o: unknown) => void }>,
    >(response: CancelableRequest<Response>, schemas: S) {
        type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string
            ? `${S}` extends `${T}${infer _X}`
                ? S
                : never
            : never
        type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never
        const result = await response
        const schema = schemas[result.statusCode] ?? schemas.default
        schema?.assert?.(result.body)
        return {
            statusCode: result.statusCode,
            headers: result.headers,
            body: result.body as InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]>,
        }
    }
}
