import type { AnySchema, ValidateFunction } from 'ajv'

export type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never
export interface Schema<T> {
    validate: ValidateFunction<T>
    schema: AnySchema
    source: string
    sourceSymbol: string
    is: (o: unknown) => o is T
}
