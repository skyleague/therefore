/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as DepValidator } from './schemas/dep.schema.js'
import { validate as HeadersValidator } from './schemas/headers.schema.js'
import { validate as QueryValidator } from './schemas/query.schema.js'

export const Dep = {
    validate: DepValidator as ValidateFunction<Dep>,
    get schema() {
        return Dep.validate.schema
    },
    get errors() {
        return Dep.validate.errors ?? undefined
    },
    is: (o: unknown): o is Dep => Dep.validate(o) === true,
    parse: (o: unknown): { right: Dep } | { left: DefinedError[] } => {
        if (Dep.is(o)) {
            return { right: o }
        }
        return { left: (Dep.errors ?? []) as DefinedError[] }
    },
} as const

export interface Dep {
    authorization: string
}

export const Headers = {
    validate: HeadersValidator as ValidateFunction<Headers>,
    get schema() {
        return Headers.validate.schema
    },
    get errors() {
        return Headers.validate.errors ?? undefined
    },
    is: (o: unknown): o is Headers => Headers.validate(o) === true,
    parse: (o: unknown): { right: Headers } | { left: DefinedError[] } => {
        if (Headers.is(o)) {
            return { right: o }
        }
        return { left: (Headers.errors ?? []) as DefinedError[] }
    },
} as const

export interface Headers {
    authorization: string
}

export const Query = {
    validate: QueryValidator as ValidateFunction<Query>,
    get schema() {
        return Query.validate.schema
    },
    get errors() {
        return Query.validate.errors ?? undefined
    },
    is: (o: unknown): o is Query => Query.validate(o) === true,
    parse: (o: unknown): { right: Query } | { left: DefinedError[] } => {
        if (Query.is(o)) {
            return { right: o }
        }
        return { left: (Query.errors ?? []) as DefinedError[] }
    },
} as const

export interface Query {
    limit: number
}
