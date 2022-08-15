/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'

export interface Comic {
    alt?: string
    day?: string
    img?: string
    link?: string
    month?: string
    news?: string
    num?: number
    safe_title?: string
    title?: string
    transcript?: string
    year?: string
}

export const Comic = {
    validate: require('./schemas/comic.schema.js') as ValidateFunction<Comic>,
    get schema() {
        return Comic.validate.schema
    },
    source: `${__dirname}xkcd.schema`,
    sourceSymbol: 'comic',
    is: (o: unknown): o is Comic => Comic.validate(o) === true,
    assert: (o: unknown) => {
        if (!Comic.validate(o)) {
            throw new AjvValidator.ValidationError(Comic.validate.errors ?? [])
        }
    },
} as const
