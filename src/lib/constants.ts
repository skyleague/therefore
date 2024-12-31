export const constants = {
    defaultTypescriptOutExtension: '.type.ts',
    defaultZodTypescriptOutExtension: '.zod.ts',
    schemaExtension: '.schema.ts',

    defaultValidator: 'ajv' as 'zod' | 'ajv',
    migrateToValidator: undefined as 'zod' | 'ajv' | undefined,
    migrate: false,
}
