/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import type { ValidateFunction } from 'ajv'
import { ValidationError } from 'ajv'

export interface Comic {
    alt?: string | null
    day?: string | null
    img?: string | null
    link?: string | null
    month?: string | null
    news?: string | null
    num?: number | null
    safe_title?: string | null
    title?: string | null
    transcript?: string | null
    year?: string | null
}

export const Comic = {
    validate: (await import('./schemas/comic.schema.js')).validate as ValidateFunction<Comic>,
    get schema() {
        return Comic.validate.schema
    },
    get errors() {
        return Comic.validate.errors ?? undefined
    },
    is: (o: unknown): o is Comic => Comic.validate(o) === true,
    assert: (o: unknown) => {
        if (!Comic.validate(o)) {
            throw new ValidationError(Comic.errors ?? [])
        }
    },
} as const
