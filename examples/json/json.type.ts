/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import type { ValidateFunction } from 'ajv'
import { ValidationError } from 'ajv'

export type Json =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: Json | undefined
      }
    | Json[]

export const Json = {
    validate: (await import('./schemas/json.schema.js')).validate as ValidateFunction<Json>,
    get schema() {
        return Json.validate.schema
    },
    get errors() {
        return Json.validate.errors ?? undefined
    },
    is: (o: unknown): o is Json => Json.validate(o) === true,
} as const

export type JsonAdv = JsonLocal

export const JsonAdv = {
    validate: (await import('./schemas/json-adv.schema.js')).validate as ValidateFunction<JsonAdv>,
    get schema() {
        return JsonAdv.validate.schema
    },
    get errors() {
        return JsonAdv.validate.errors ?? undefined
    },
    is: (o: unknown): o is JsonAdv => JsonAdv.validate(o) === true,
    assert: (o: unknown) => {
        if (!JsonAdv.validate(o)) {
            throw new ValidationError(JsonAdv.errors ?? [])
        }
    },
} as const

type JsonLocal =
    | string
    | null
    | boolean
    | number
    | {
          [k: string]: JsonAdv | undefined
      }
    | JsonAdv[]
