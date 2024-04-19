export type JsonSchema7TypeName = 'array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string'

export type SchemaVersion = 'http://json-schema.org/draft-07/schema#'

export interface JsonHyperSchema {
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-8.2
    $id?: string | undefined
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-8.3
    $ref?: string | undefined
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-7
    $schema?: SchemaVersion | undefined
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-9
    $comment?: string | undefined
    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-9
    definitions?: Record<string, JsonSchema | undefined> | undefined
    $defs?: Record<string, JsonSchema | undefined> | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1
export interface JsonAnyInstance {
    type?: JsonSchema7TypeName | JsonSchema7TypeName[] | undefined
    enum?: unknown[] | undefined
    const?: unknown | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.2
export interface JsonNumericInstance {
    multipleOf?: number | undefined
    maximum?: number | undefined
    exclusiveMaximum?: number | undefined
    minimum?: number | undefined
    exclusiveMinimum?: number | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.3
export interface JsonStringInstance {
    maxLength?: number | undefined
    minLength?: number | undefined
    pattern?: string | undefined

    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-7
    format?:
        | undefined
        | 'date-time'
        | 'date'
        | 'email'
        | 'hostname'
        | 'idn-email'
        | 'idn-hostname'
        | 'ipv4'
        | 'ipv6'
        | 'iri-reference'
        | 'iri'
        | 'json-pointer'
        | 'regex'
        | 'relative-json-pointer'
        | 'time'
        | 'uri-reference'
        | 'uri-template'
        | 'uri'

    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-8
    contentMediaType?: string | undefined
    contentEncoding?: string | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.4
export interface JsonArrayInstance {
    items?: JsonSchema | JsonSchema[] | undefined
    additionalItems?: JsonSchema | false | undefined
    maxItems?: number | undefined
    minItems?: number | undefined
    uniqueItems?: boolean | undefined
    /** @deprecated */
    contains?: JsonSchema | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.5
export interface JsonObjectInstance {
    /** @deprecated */
    maxProperties?: number | undefined
    /** @deprecated */
    minProperties?: number | undefined
    required?: string[] | undefined
    properties?: Record<string, JsonSchema> | undefined
    patternProperties?: Record<string, JsonSchema> | undefined
    additionalProperties?: JsonSchema | boolean | undefined
    dependencies?: Record<string, JsonSchema | readonly string[]> | undefined
    /** @deprecated */
    propertyNames?: JsonSchema | undefined

    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.6
    /** @deprecated */
    if?: JsonSchema | undefined
    /** @deprecated */
    then?: JsonSchema | undefined
    /** @deprecated */
    else?: JsonSchema | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.7
export interface JsonBooleanLogic {
    allOf?: JsonSchema[] | undefined
    anyOf?: JsonSchema[] | undefined
    oneOf?: JsonSchema[] | undefined
    /** @deprecated */
    not?: JsonSchema | undefined
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-10
export interface JsonAnnotations<T = unknown> {
    title?: string | undefined
    description?: string | undefined
    default?: unknown | undefined
    /** 2019-09 draft */
    deprecated?: boolean | undefined
    /** @deprecated */
    readonly?: boolean | undefined
    /** @deprecated */
    writeonly?: boolean | undefined
    examples?: T[] | undefined
    /** @experimental */
    nullable?: boolean | undefined
}

export interface JsonDefs {
    $defs?: Record<string, JsonSchema | undefined> | undefined
}

export interface ThereforeExtension {
    'x-arbitrary'?: unknown
}

export type JsonSchema<T = unknown> = JsonAnnotations<T> &
    JsonAnyInstance &
    JsonArrayInstance &
    JsonBooleanLogic &
    JsonDefs &
    JsonHyperSchema &
    JsonNumericInstance &
    JsonObjectInstance &
    JsonStringInstance &
    ThereforeExtension
