/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import { Ajv } from 'ajv'
import type { DefinedError } from 'ajv'

import CombinedSchema from './schemas/combined.schema.json' with { type: 'json' }

export const Combined = {
    validate: new Ajv({
        strict: true,
        strictSchema: false,
        strictTypes: true,
        strictTuples: false,
        useDefaults: true,
        logger: false,
        loopRequired: 5,
        loopEnum: 5,
        multipleOfPrecision: 4,
        code: { esm: true },
    }).compile<Combined>(CombinedSchema),
    schema: CombinedSchema,
    get errors() {
        return Combined.validate.errors ?? undefined
    },
    is: (o: unknown): o is Combined => Combined.validate(o) === true,
    parse: (o: unknown): { right: Combined } | { left: DefinedError[] } => {
        if (Combined.is(o)) {
            return { right: o }
        }
        return { left: (Combined.errors ?? []) as DefinedError[] }
    },
} as const

export type Combined = Reference1 | Reference2

type Foo2 = string

type Foo = string

type Keys2 = Foo2[]

type Keys = Foo[]

/**
 * Loan repayment executed
 */
export interface Reference1 {
    keys: Keys2
}

/**
 * Loan repayment executed
 */
export interface Reference2 {
    keys: Keys
}
