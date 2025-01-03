export const constants = {
    defaultTypescriptOutExtension: '.type.ts',
    defaultZodTypescriptOutExtension: '.zod.ts',
    schemaExtension: '.schema.ts',

    defaultValidator: 'ajv' as 'zod' | 'ajv',
    migrateToValidator: undefined as 'zod' | 'ajv' | undefined,
    generateInterop: false,
    migrate: false,
}
