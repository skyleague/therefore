/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import type { ValidateFunction } from 'ajv'
import { ValidationError } from 'ajv'

export interface Defaults {
    /**
     * @default false
     */
    foo: boolean
}

export const Defaults = {
    validate: (await import('./schemas/defaults.schema.js')).validate as ValidateFunction<Defaults>,
    get schema() {
        return Defaults.validate.schema
    },
    get errors() {
        return Defaults.validate.errors ?? undefined
    },
    is: (o: unknown): o is Defaults => Defaults.validate(o) === true,
    assert: (o: unknown) => {
        if (!Defaults.validate(o)) {
            throw new ValidationError(Defaults.errors ?? [])
        }
    },
} as const
