/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'

export type Simple = number | Simple[]

export const Simple = {
    validate: require('./schemas/simple.schema.js') as ValidateFunction<Simple>,
    get schema() {
        return Simple.validate.schema
    },
    source: `${__dirname}/simple.schema`,
    sourceSymbol: 'simple',
    is: (o: unknown): o is Simple => Simple.validate(o) === true,
    assert: (o: unknown) => {
        if (!Simple.validate(o)) {
            throw new AjvValidator.ValidationError(Simple.validate.errors ?? [])
        }
    },
} as const
