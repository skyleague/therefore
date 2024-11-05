/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as ProfileValidator } from './schemas/profile.schema.js'

export interface Profile {
    /**
     * @default false
     */
    enableTestVariable: boolean
}

export const Profile = {
    validate: ProfileValidator as ValidateFunction<Profile>,
    get schema() {
        return Profile.validate.schema
    },
    get errors() {
        return Profile.validate.errors ?? undefined
    },
    is: (o: unknown): o is Profile => Profile.validate(o) === true,
    parse: (o: unknown): { right: Profile } | { left: DefinedError[] } => {
        if (Profile.is(o)) {
            return { right: o }
        }
        return { left: (Profile.errors ?? []) as DefinedError[] }
    },
} as const