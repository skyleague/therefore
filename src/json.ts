export type JsonSchema7TypeName = 'array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string'

export type SchemaVersion = 'http://json-schema.org/draft-07/schema#'

export interface JsonHyperSchema {
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-8.2
    $id?: string
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-8.3
    $ref?: string
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-7
    $schema?: SchemaVersion
    // https://tools.ietf.org/html/draft-handrews-json-schema-01#section-9
    $comment?: string
    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-9
    definitions?: Record<string, JsonSchema>
    $defs?: Record<string, JsonSchema>
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1
export interface JsonAnyInstance {
    type?: JsonSchema7TypeName | JsonSchema7TypeName[]
    enum?: unknown[]
    const?: unknown
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.2
export interface JsonNumericInstance {
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: number
    minimum?: number
    exclusiveMinimum?: number
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.3
export interface JsonStringInstance {
    maxLength?: number
    minLength?: number
    pattern?: string

    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-7
    format?:
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
    contentMediaType?: string
    contentEncoding?: string
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.4
export interface JsonArrayInstance {
    items?: JsonSchema | JsonSchema[]
    additionalItems?: JsonSchema | false
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    /** @deprecated */
    contains?: JsonSchema
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.5
export interface JsonObjectInstance {
    /** @deprecated */
    maxProperties?: number
    /** @deprecated */
    minProperties?: number
    required?: ReadonlyArray<string>
    properties?: Record<string, JsonSchema>
    patternProperties?: Record<string, JsonSchema>
    additionalProperties?: JsonSchema | false
    dependencies?: Record<string, JsonSchema | ReadonlyArray<string>>
    /** @deprecated */
    propertyNames?: JsonSchema

    // https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.6
    /** @deprecated */
    if?: JsonSchema
    /** @deprecated */
    then?: JsonSchema
    /** @deprecated */
    else?: JsonSchema
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.7
export interface JsonBooleanLogic {
    allOf?: ReadonlyArray<JsonSchema>
    /** @deprecated */
    anyOf?: ReadonlyArray<JsonSchema>
    oneOf?: ReadonlyArray<JsonSchema>
    /** @deprecated */
    not?: JsonSchema
}

// https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-10
export interface JsonAnnotations {
    title?: string
    description?: string
    default?: unknown
    /** 2019-09 draft */
    deprecated?: boolean
    /** @deprecated */
    readonly?: boolean
    /** @deprecated */
    writeonly?: boolean
    examples?: unknown[]
}

export interface JsonDefs {
    $defs?: Record<string, JsonSchema>
}

export type JsonSchema = JsonAnnotations &
    JsonAnyInstance &
    JsonArrayInstance &
    JsonBooleanLogic &
    JsonDefs &
    JsonHyperSchema &
    JsonNumericInstance &
    JsonObjectInstance &
    JsonStringInstance
