/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as CreateConnectTokenRequestValidator } from './schemas/create-connect-token-request.schema.js'
import { validate as CreateConnectTokenResponseValidator } from './schemas/create-connect-token-response.schema.js'

export const CreateConnectTokenRequest = {
    validate: CreateConnectTokenRequestValidator as ValidateFunction<CreateConnectTokenRequest>,
    get schema() {
        return CreateConnectTokenRequest.validate.schema
    },
    get errors() {
        return CreateConnectTokenRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is CreateConnectTokenRequest => CreateConnectTokenRequest.validate(o) === true,
    parse: (o: unknown): { right: CreateConnectTokenRequest } | { left: DefinedError[] } => {
        if (CreateConnectTokenRequest.is(o)) {
            return { right: o }
        }
        return { left: (CreateConnectTokenRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface CreateConnectTokenRequest {
    client_id: string
    client_secret: string
    grant_type: 'client_credentials'
    scope: string
}

export const CreateConnectTokenResponse = {
    validate: CreateConnectTokenResponseValidator as ValidateFunction<CreateConnectTokenResponse>,
    get schema() {
        return CreateConnectTokenResponse.validate.schema
    },
    get errors() {
        return CreateConnectTokenResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is CreateConnectTokenResponse => CreateConnectTokenResponse.validate(o) === true,
    parse: (o: unknown): { right: CreateConnectTokenResponse } | { left: DefinedError[] } => {
        if (CreateConnectTokenResponse.is(o)) {
            return { right: o }
        }
        return { left: (CreateConnectTokenResponse.errors ?? []) as DefinedError[] }
    },
} as const

export interface CreateConnectTokenResponse {
    access_token: string
    expires_in: number
    scope?: string | undefined
    token_type?: 'Bearer' | undefined
}
