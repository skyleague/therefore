/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as DefaultsValidator } from './schemas/defaults.schema.js'

export interface Defaults {
    /**
     * @default false
     */
    foo: boolean
}

export const Defaults = {
    validate: DefaultsValidator as ValidateFunction<Defaults>,
    get schema() {
        return Defaults.validate.schema
    },
    get errors() {
        return Defaults.validate.errors ?? undefined
    },
    is: (o: unknown): o is Defaults => Defaults.validate(o) === true,
    parse: (o: unknown): { right: Defaults } | { left: DefinedError[] } => {
        if (Defaults.is(o)) {
            return { right: o }
        }
        return { left: (Defaults.errors ?? []) as DefinedError[] }
    },
} as const
