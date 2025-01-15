/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DefinedError, ValidateFunction } from 'ajv'

import { validate as CategoryValidator } from './schemas/category.schema.js'
import { validate as PetArrayValidator } from './schemas/pet-array.schema.js'
import { validate as PetValidator } from './schemas/pet.schema.js'
import { validate as StatusValidator } from './schemas/status.schema.js'
import { validate as TagValidator } from './schemas/tag.schema.js'

export type Status = 'available' | 'pending' | 'sold'

export const Status = {
    validate: StatusValidator as ValidateFunction<Status>,
    get schema() {
        return Status.validate.schema
    },
    get errors() {
        return Status.validate.errors ?? undefined
    },
    is: (o: unknown): o is Status => Status.validate(o) === true,
    parse: (o: unknown): { right: Status } | { left: DefinedError[] } => {
        if (Status.is(o)) {
            return { right: o }
        }
        return { left: (Status.errors ?? []) as DefinedError[] }
    },
} as const

export interface Tag {
    id?: number | undefined
    name?: string | undefined
}

export const Tag = {
    validate: TagValidator as ValidateFunction<Tag>,
    get schema() {
        return Tag.validate.schema
    },
    get errors() {
        return Tag.validate.errors ?? undefined
    },
    is: (o: unknown): o is Tag => Tag.validate(o) === true,
    parse: (o: unknown): { right: Tag } | { left: DefinedError[] } => {
        if (Tag.is(o)) {
            return { right: o }
        }
        return { left: (Tag.errors ?? []) as DefinedError[] }
    },
} as const

export interface Category {
    id: number
    name: string
}

export const Category = {
    validate: CategoryValidator as ValidateFunction<Category>,
    get schema() {
        return Category.validate.schema
    },
    get errors() {
        return Category.validate.errors ?? undefined
    },
    is: (o: unknown): o is Category => Category.validate(o) === true,
    parse: (o: unknown): { right: Category } | { left: DefinedError[] } => {
        if (Category.is(o)) {
            return { right: o }
        }
        return { left: (Category.errors ?? []) as DefinedError[] }
    },
} as const

/**
 * Pet object from the store
 */
export interface Pet {
    id?: number | undefined
    category?: Category | undefined
    name: string
    photoUrls: string[]
    tags?: Tag[] | undefined
    status?: Status | undefined
}

export const Pet = {
    validate: PetValidator as ValidateFunction<Pet>,
    get schema() {
        return Pet.validate.schema
    },
    get errors() {
        return Pet.validate.errors ?? undefined
    },
    is: (o: unknown): o is Pet => Pet.validate(o) === true,
    parse: (o: unknown): { right: Pet } | { left: DefinedError[] } => {
        if (Pet.is(o)) {
            return { right: o }
        }
        return { left: (Pet.errors ?? []) as DefinedError[] }
    },
} as const

/**
 * A list of Pet objects
 */
export type PetArray = Pet[]

export const PetArray = {
    validate: PetArrayValidator as ValidateFunction<PetArray>,
    get schema() {
        return PetArray.validate.schema
    },
    get errors() {
        return PetArray.validate.errors ?? undefined
    },
    is: (o: unknown): o is PetArray => PetArray.validate(o) === true,
    parse: (o: unknown): { right: PetArray } | { left: DefinedError[] } => {
        if (PetArray.is(o)) {
            return { right: o }
        }
        return { left: (PetArray.errors ?? []) as DefinedError[] }
    },
} as const
