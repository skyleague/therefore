/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import AjvValidator from 'ajv'
import type { ValidateFunction } from 'ajv'

export interface Defaults {
    /**
     * @default 'foobar'
     */
    str?: string
    /**
     * @default 42
     */
    int?: number
}

export const Defaults = {
    validate: (await import('./schemas/defaults.schema.js')).validate10 as unknown as ValidateFunction<Defaults>,
    get schema() {
        return Defaults.validate.schema
    },
    get errors() {
        return Defaults.validate.errors ?? undefined
    },
    is: (o: unknown): o is Defaults => Defaults.validate(o) === true,
    assert: (o: unknown) => {
        if (!Defaults.validate(o)) {
            throw new AjvValidator.ValidationError(Defaults.errors ?? [])
        }
    },
} as const

export interface Person {
    /**
     * The person's first name.
     */
    firstName: string
    lastName: string
    age: number
}

export const Person = {
    validate: (await import('./schemas/person.schema.js')).validate10 as unknown as ValidateFunction<Person>,
    get schema() {
        return Person.validate.schema
    },
    get errors() {
        return Person.validate.errors ?? undefined
    },
    is: (o: unknown): o is Person => Person.validate(o) === true,
    assert: (o: unknown) => {
        if (!Person.validate(o)) {
            throw new AjvValidator.ValidationError(Person.errors ?? [])
        }
    },
} as const

export type SalesPerson = {
    sales: number
} & {
    /**
     * The person's first name.
     */
    firstName: string
    lastName: string
    age: number
}

export const SalesPerson = {
    validate: (await import('./schemas/sales-person.schema.js')).validate10 as unknown as ValidateFunction<SalesPerson>,
    get schema() {
        return SalesPerson.validate.schema
    },
    get errors() {
        return SalesPerson.validate.errors ?? undefined
    },
    is: (o: unknown): o is SalesPerson => SalesPerson.validate(o) === true,
    assert: (o: unknown) => {
        if (!SalesPerson.validate(o)) {
            throw new AjvValidator.ValidationError(SalesPerson.errors ?? [])
        }
    },
} as const

export interface SelfReference {
    foo?: string
    bar?: SelfReference
}

export const SelfReference = {
    validate: (await import('./schemas/self-reference.schema.js')).validate10 as unknown as ValidateFunction<SelfReference>,
    get schema() {
        return SelfReference.validate.schema
    },
    get errors() {
        return SelfReference.validate.errors ?? undefined
    },
    is: (o: unknown): o is SelfReference => SelfReference.validate(o) === true,
    assert: (o: unknown) => {
        if (!SelfReference.validate(o)) {
            throw new AjvValidator.ValidationError(SelfReference.errors ?? [])
        }
    },
} as const