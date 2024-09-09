/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as BarValidator } from './schemas/bar.schema.js'
import { validate as FooValidator } from './schemas/foo.schema.js'

export interface Bar {
    bar?: string | undefined
}

export const Bar = {
    validate: BarValidator as ValidateFunction<Bar>,
    get schema() {
        return Bar.validate.schema
    },
    get errors() {
        return Bar.validate.errors ?? undefined
    },
    is: (o: unknown): o is Bar => Bar.validate(o) === true,
    parse: (o: unknown): { right: Bar } | { left: DefinedError[] } => {
        if (Bar.is(o)) {
            return { right: o }
        }
        return { left: (Bar.errors ?? []) as DefinedError[] }
    },
} as const

export interface Foo {
    foo?: Bar | undefined
}

export const Foo = {
    validate: FooValidator as ValidateFunction<Foo>,
    get schema() {
        return Foo.validate.schema
    },
    get errors() {
        return Foo.validate.errors ?? undefined
    },
    is: (o: unknown): o is Foo => Foo.validate(o) === true,
    parse: (o: unknown): { right: Foo } | { left: DefinedError[] } => {
        if (Foo.is(o)) {
            return { right: o }
        }
        return { left: (Foo.errors ?? []) as DefinedError[] }
    },
} as const