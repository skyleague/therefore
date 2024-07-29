import { identity } from '@skyleague/axioms'
import type { ConditionalExcept, HasRequiredKeys, Simplify } from '@skyleague/axioms/types'
import type { Got } from 'got'
import type { Interceptor, Scope } from 'nock'

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export type NockArgs<T> = Simplify<
    ConditionalExcept<
        {
            path: T extends { path: infer P } ? P : never
            // not yet supported
            // body?: T extends { body: infer B } ? B : never
            // query?: Record<string, string>
            // auth?: string[] | string[][]
        },
        never
    >
>
export type NockFn<Args extends object> = HasRequiredKeys<Args> extends true
    ? (args: Args) => Interceptor
    : (args?: Args) => Interceptor

export type RestClient = {
    client: Got
}

const httpMethods = ['get', 'post', 'put', 'patch', 'head', 'delete'] as const

export type NockClient<T> = {
    [Key in keyof T]: T[Key] extends (args: infer Args) => Promise<unknown> ? NockFn<NockArgs<Args>> : never
} & { [Symbol.dispose]: () => void; nock: Scope }

export function $nockClient<T extends RestClient>(client: T): NockClient<T> {
    // disable exponential backoff on retries
    client.client = client.client.extend({
        retry: {
            limit: 0,
        },
    })

    const nock = require('nock')
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    const self: any = Object.create(client)

    const serve = nock(new URL(client.client.defaults.options.prefixUrl).href)

    // biome-ignore lint/suspicious/noExplicitAny: we mock the whole thing
    self.validateRequestBody = (() => ({ right: true })).bind(self) as any

    // biome-ignore lint/suspicious/noExplicitAny: we mock the whole thing
    self.awaitResponse = identity.bind(self) as any

    self.buildClient = ((_auth: string[][] | string[] | undefined) =>
        new Proxy(
            {},
            {
                get: (_: unknown, property: string) => {
                    return (...xs: unknown[]) => [property, ...xs]
                },
            },
            // biome-ignore lint/suspicious/noExplicitAny: we mock the whole thing
        )).bind(self) as any

    Object.assign(self, {
        get client() {
            return self.buildClient()
        },
    })

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(client))) {
        if (['validateRequestBody', 'awaitResponse', 'validateRequestBody', 'buildClient'].includes(key)) {
            continue
        }

        const fn = self[key]
        if (typeof self[key] === 'function') {
            self[key] = ((args: unknown) => {
                const [method, path] = fn.bind(self)(args ?? {}) as unknown as [(typeof httpMethods)[number], string]

                return serve[method](`/${path}`)
            }).bind(self)
        }
    }

    self[Symbol.dispose] = () => {
        nock.cleanAll()
    }
    self.nock = serve
    return self
}
