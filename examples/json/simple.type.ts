/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as SimpleValidator } from './schemas/simple.schema.js'

export const Simple = {
    validate: SimpleValidator as ValidateFunction<Simple>,
    get schema() {
        return Simple.validate.schema
    },
    get errors() {
        return Simple.validate.errors ?? undefined
    },
    is: (o: unknown): o is Simple => Simple.validate(o) === true,
    parse: (o: unknown): { right: Simple } | { left: DefinedError[] } => {
        if (Simple.is(o)) {
            return { right: o }
        }
        return { left: (Simple.errors ?? []) as DefinedError[] }
    },
} as const

export type Simple = number | Simple[]
