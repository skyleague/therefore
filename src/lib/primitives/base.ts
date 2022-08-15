import type { SimplifyOnce, UndefinedFields } from '@skyleague/axioms'
import type { InstanceOptions } from 'ajv'

export type TypeDiscriminator =
    | 'array'
    | 'boolean'
    | 'custom'
    | 'dict'
    | 'enum'
    | 'enumValue'
    | 'integer'
    | 'null'
    | 'number'
    | 'object'
    | 'ref'
    | 'string'
    | 'tuple'
    | 'union'
    | 'unknown'

export interface MetaDescription<T = unknown> {
    /**
     * Can be used to decorate a user interface with information about the data produced by this user interface. The title
     * preferable should be short, whereas the description provides a more detailed explanation.
     *
     * Reference: https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.9.1
     */
    title?: string

    /**
     * Identifies a schema resource with a canonical URI.
     * Note that this URI is an identifier and not necessarily a network locator.
     * In the case of a network-addressable URL, a schema need not be downloadable from its canonical URI.
     *
     * If present, the value for this keyword MUST be a string, and MUST represent a valid URI-reference.
     * This URI-reference SHOULD be normalized, and MUST resolve to an absolute-URI (without a fragment).
     * Therefore, "id" MUST NOT contain a non-empty fragment, and SHOULD NOT contain an empty fragment.
     *
     * Reference: https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2.2
     */
    id?: string

    /**
     * Can be used to decorate a user interface with information about the data produced by this user interface. The description
     * will provide explanation about the purpose of the instance described by this schema.
     *
     * Reference: https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.9.1
     */
    description?: string
    summary?: string

    /**
     * Mark the property as optional (either defined, or not present).
     *
     * @example
     *
     *      $string({optional: true})
     *
     * @see {@link $optional} for a helper function.
     */

    optional?: boolean

    /**
     * Mark the property as nullable (either defined or null, but present).
     *
     * @example
     *
     *      $string({nullable: true})
     *
     * @see {@link $nullable} for a helper function.
     */
    nullable?: boolean

    /**
     * Gives a few examples of allowed values.
     */
    examples?: T[]

    /**
     * Specifies the default value that is used when no value is found during validation (dependend on validation options).
     */
    default?: T

    /**
     * The property is marked explicitly as `readonly`, and any changes to the value should be avoided.
     *
     * @example
     *
     *      $string({readonly: true})
     */
    readonly?: boolean

    /**
     *  This indicates that applications SHOULD refrain from usage of the declared property. It MAY mean the property is going to be removed in the future.
     */
    deprecated?: boolean
}

export const descriptionKeys: readonly (keyof SchemaOptions<unknown>)[] = [
    'name',
    'title',
    'id',
    'description',
    'optional',
    'nullable',
    'examples',
    'default',
    'readonly',
    'ajvOptions',
    'generateValidator',
] as const

export type ThereforeMeta = {
    name?: string

    /**
     * The ajv options to validate this object with
     */
    ajvOptions?: InstanceOptions

    generateValidator?: boolean
}
export type SchemaMeta<T = unknown> = MetaDescription<T> & ThereforeMeta
export type SchemaOptions<O, T = unknown> = UndefinedFields<SimplifyOnce<MetaDescription<T> & O> & ThereforeMeta>
