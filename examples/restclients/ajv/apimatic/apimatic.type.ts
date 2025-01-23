/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as ConvertApiRequestValidator } from './schemas/convert-api-request.schema.js'
import { validate as ConvertApiResponseValidator } from './schemas/convert-api-response.schema.js'

export interface ConvertApiRequest {
    url?: string | undefined
}

export const ConvertApiRequest = {
    validate: ConvertApiRequestValidator as ValidateFunction<ConvertApiRequest>,
    get schema() {
        return ConvertApiRequest.validate.schema
    },
    get errors() {
        return ConvertApiRequest.validate.errors ?? undefined
    },
    is: (o: unknown): o is ConvertApiRequest => ConvertApiRequest.validate(o) === true,
    parse: (o: unknown): { right: ConvertApiRequest } | { left: DefinedError[] } => {
        if (ConvertApiRequest.is(o)) {
            return { right: o }
        }
        return { left: (ConvertApiRequest.errors ?? []) as DefinedError[] }
    },
} as const

export interface ConvertApiResponse {}

export const ConvertApiResponse = {
    validate: ConvertApiResponseValidator as ValidateFunction<ConvertApiResponse>,
    get schema() {
        return ConvertApiResponse.validate.schema
    },
    get errors() {
        return ConvertApiResponse.validate.errors ?? undefined
    },
    is: (o: unknown): o is ConvertApiResponse => ConvertApiResponse.validate(o) === true,
    parse: (o: unknown): { right: ConvertApiResponse } | { left: DefinedError[] } => {
        if (ConvertApiResponse.is(o)) {
            return { right: o }
        }
        return { left: (ConvertApiResponse.errors ?? []) as DefinedError[] }
    },
} as const
