/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as JsonAdvValidator } from './schemas/json-adv.schema.js'
import { validate as JsonValidator } from './schemas/json.schema.js'

export const Json = {
    validate: JsonValidator as ValidateFunction<Json>,
    get schema() {
        return Json.validate.schema
    },
    get errors() {
        return Json.validate.errors ?? undefined
    },
    is: (o: unknown): o is Json => Json.validate(o) === true,
    parse: (o: unknown): { right: Json } | { left: DefinedError[] } => {
        if (Json.is(o)) {
            return { right: o }
        }
        return { left: (Json.errors ?? []) as DefinedError[] }
    },
} as const

export type Json =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: Json | undefined
      }
    | Json[]

export const JsonAdv = {
    validate: JsonAdvValidator as ValidateFunction<JsonAdv>,
    get schema() {
        return JsonAdv.validate.schema
    },
    get errors() {
        return JsonAdv.validate.errors ?? undefined
    },
    is: (o: unknown): o is JsonAdv => JsonAdv.validate(o) === true,
    parse: (o: unknown): { right: JsonAdv } | { left: DefinedError[] } => {
        if (JsonAdv.is(o)) {
            return { right: o }
        }
        return { left: (JsonAdv.errors ?? []) as DefinedError[] }
    },
} as const

export type JsonAdv = JsonLocal

type JsonLocal =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: JsonAdv | undefined
      }
    | JsonAdv[]
