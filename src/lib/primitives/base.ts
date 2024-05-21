import type { ThereforeNodeDefinition } from '../cst/cst.js'

export const descriptionKeys = ['name', 'description', 'default', 'readonly'] satisfies readonly (keyof SchemaOptions<unknown>)[]

export interface ThereforeMeta {
    name?: string
}

export type SchemaOptions<O, T = unknown> = Partial<ThereforeNodeDefinition<T> & ThereforeMeta> & O
