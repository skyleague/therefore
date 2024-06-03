/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as ValidatorValidator } from './schemas/validator.schema.js'

export interface Validator {
    foo: string
}

export const Validator = {
    validate: ValidatorValidator as ValidateFunction<Validator>,
    get schema() {
        return Validator.validate.schema
    },
    get errors() {
        return Validator.validate.errors ?? undefined
    },
    is: (o: unknown): o is Validator => Validator.validate(o) === true,
    parse: (o: unknown): { right: Validator } | { left: DefinedError[] } => {
        if (Validator.is(o)) {
            return { right: o }
        }
        return { left: (Validator.errors ?? []) as DefinedError[] }
    },
} as const