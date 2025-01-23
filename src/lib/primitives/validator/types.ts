import type { SetOptional } from '@skyleague/axioms/types'
import type { Options } from 'ajv'

export const defaultAjvValidatorOptions: AjvValidatorOptions = {
    type: 'ajv',
    assert: false,
    compile: true,
    parse: true,
    coerce: false,
    formats: true,
}

export interface AjvValidatorOptions {
    type: 'ajv'

    /**
     * Toggles whether an assert function should be generated.
     *
     * @defaultvalue false
     */
    assert: boolean

    /**
     * Toggles whether a parse function should be generated.
     *
     * @defaultvalue true
     */
    parse: boolean

    /**
     * Whether the validator should be compiled.
     *
     * @defaultValue undefined
     */
    compile: boolean

    /**
     * Whether to coerce the input to the schema.
     * @defaultValue true
     */
    coerce: boolean

    /**
     * Whether to check format types with https://ajv.js.org/packages/ajv-formats.html
     * @defaultValue true
     */
    formats: boolean

    /**
     * The ajv options to use.
     */
    ajv?: Options

    output?: {
        jsonschema?: string
    }
}

interface DeprecatedAjvValidatorOptions {
    /**
     * @deprecated use output.jsonschema instead
     */
    schemaFilename?: string
}

export type AjvValidatorInputOptions = SetOptional<
    AjvValidatorOptions,
    'assert' | 'parse' | 'compile' | 'coerce' | 'formats' | 'ajv' | 'type'
> &
    DeprecatedAjvValidatorOptions

export const defaultZodValidatorOptions: ZodValidatorOptions = {
    type: 'zod',
    types: true,
}

export interface ZodValidatorOptions {
    type: 'zod'

    /**
     * Whether to generate types for the validator.
     *
     * @defaultvalue true
     */
    types?: boolean

    output?: {
        jsonschema?: string
    }
}

export type ZodValidatorInputOptions = ZodValidatorOptions

export type ValidatorOptions = AjvValidatorOptions | ZodValidatorOptions
export type ValidatorInputOptions = AjvValidatorInputOptions | ZodValidatorInputOptions
