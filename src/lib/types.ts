import type { AnySchema, ErrorObject } from 'ajv'

export type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never
export interface Schema<T> {
    errors: ErrorObject[] | undefined
    schema: AnySchema
    is: (o: unknown) => o is T
}
