import { identity, isObject, isString, omitUndefined } from '@skyleague/axioms'
import { deterministicBoolean } from '@skyleague/axioms'
import type * as JSONSchema from '../../../src/json.js'
import { arbitrary } from '../../../src/lib/visitor/arbitrary/arbitrary.js'
import { jsonSchema } from './schema.schema.js'

export function normalize(
    schema: JSONSchema.JsonSchema,
    options: {
        target: 'openapi3' | 'draft-07'
    },
): JSONSchema.JsonSchema {
    if (Array.isArray(schema.type)) {
        const types = schema.type.filter((type) => !(schema.nullable === true && type === 'null') || schema.type?.length === 1)

        if (types.length > 1) {
            schema.anyOf = types.map((type) => normalize({ type }, options))
            schema.type = undefined
        } else {
            // biome-ignore lint/style/noNonNullAssertion: we know that types is not empty
            schema.type = types[0]!
        }
    }

    // fix properties subschema
    if (schema.properties !== undefined) {
        const properties = Object.entries(schema.properties)
        for (const [name, property] of properties) {
            schema.properties[name] = normalize(property, options)
        }

        // we delete the properties attributes when it is empty in therefore
        if (properties.length === 0) {
            schema.properties = undefined
        }
    }
    if (schema.required !== undefined) {
        schema.required = schema.required.sort((a, b) => a.localeCompare(b))
    }

    if (schema.patternProperties !== undefined) {
        const properties = Object.entries(schema.patternProperties)
        for (const [name, property] of properties) {
            schema.patternProperties[name] = normalize(property, options)
        }

        // we delete the properties attributes when it is empty in therefore
        if (properties.length === 0) {
            schema.patternProperties = undefined
        }
    }
    if (isObject(schema.additionalProperties)) {
        schema.additionalProperties = normalize(schema.additionalProperties, options)
    }

    if (schema.oneOf !== undefined) {
        schema.anyOf = schema.oneOf
        schema.oneOf = undefined
    }
    if (schema.anyOf !== undefined) {
        schema.anyOf = schema.anyOf.map((x) => normalize(x, options))
        if (schema.nullable === true && schema.anyOf.find((x) => x.type === 'null') === undefined) {
            schema.anyOf.push(normalize({ type: 'null' }, options))
        }
        schema.nullable = undefined
    }
    if (schema.allOf !== undefined) {
        schema.allOf = schema.allOf.map((x) => normalize(x, options))
        if (schema.nullable === true) {
            schema.anyOf = [
                {
                    allOf: schema.allOf,
                },
                normalize(
                    {
                        type: 'null',
                    },
                    options,
                ),
            ]
            schema.allOf = undefined
            schema.nullable = undefined
        }
    }
    if (schema.type === 'array') {
        if (schema.items !== undefined) {
            schema.items = Array.isArray(schema.items)
                ? schema.items.map((x) => normalize(x, options))
                : normalize(schema.items, options)
        } else {
            schema.items = {}
        }
        if (isObject(schema.additionalItems)) {
            schema.additionalItems = normalize(schema.additionalItems, options)
        }
    }

    // set to the maximum precision
    if (schema.multipleOf !== undefined) {
        schema.multipleOf = Number.parseFloat(schema.multipleOf.toFixed(7))
    }

    // ajv needs to extend nullable enum and const
    if (schema.nullable) {
        if (schema.enum !== undefined && schema.enum.find((x) => x === null) === undefined) {
            schema.enum = [...schema.enum, null]
            schema.nullable = undefined
        }
        if (schema.const !== undefined) {
            schema.enum = [schema.const, null]
            schema.nullable = undefined
            schema.const = undefined
        }
        if (schema.enum && options.target === 'openapi3') {
            schema.type = 'string'
            schema.nullable = true
        }
    }

    if (options.target !== 'openapi3') {
        if (schema.enum !== undefined && schema.enum.length === 1) {
            schema.const = schema.enum[0]
            schema.enum = undefined
        }
    } else {
        if (schema.const) {
            schema.enum = [schema.const]
            schema.const = undefined
        }
        // this is not supported
        if (schema.type === 'null') {
            // best standard ever
            schema.type = 'string'
            schema.enum = [null]
            schema.nullable = true
        }
    }

    if (options.target !== 'openapi3' && schema.nullable) {
        if (schema.type !== 'null' && schema.type) {
            schema.type = Array.isArray(schema.type) ? [...new Set([...schema.type, 'null'])] : [schema.type, 'null']
        }
        schema.nullable = undefined
    }
    if (schema.nullable === false) {
        // we don't store this information
        schema.nullable = undefined
    }

    // handle exclusiveMinimum/Maximum differences between draft-07 and openapi3
    if (options.target === 'openapi3') {
        // OpenAPI 3 uses boolean flag + minimum/maximum
        if (typeof schema.exclusiveMinimum === 'number') {
            schema.minimum = schema.exclusiveMinimum
            schema.exclusiveMinimum = true as never
        }
        if (typeof schema.exclusiveMaximum === 'number') {
            schema.maximum = schema.exclusiveMaximum
            schema.exclusiveMaximum = true as never
        }
    }

    if ('type' in schema) {
        // we always prefill a default strictness
        if (
            (schema.type === 'object' || (Array.isArray(schema.type) && schema.type?.includes('object'))) &&
            schema.additionalProperties === undefined
        ) {
            schema.additionalProperties = true
        }
    } else {
        // nullable extension is only allowed in ajv when type is explicitly mentioned
        schema.nullable = undefined
    }

    // for zod
    if (schema.type === 'object') {
        if (isObject(schema.additionalProperties) && Object.keys(schema.additionalProperties).length === 0) {
            schema.additionalProperties = true
        }
    }

    return omitUndefined(schema)
}

export function sensible({
    schema,
    document,
    target,
    pre = identity,
    post = identity,
}: {
    schema: JSONSchema.JsonSchema
    document: JSONSchema.JsonSchema
    target: 'openapi3' | 'draft-07'
    pre?: (x: JSONSchema.JsonSchema, doc: JSONSchema.JsonSchema) => JSONSchema.JsonSchema
    post?: (x: JSONSchema.JsonSchema, doc: JSONSchema.JsonSchema) => JSONSchema.JsonSchema
}): JSONSchema.JsonSchema {
    schema = pre(schema, document)

    if (schema.allOf !== undefined) {
        const seenProperties = new Set<string>()
        const allOf: JSONSchema.JsonSchema[] = []
        for (const sub of schema.allOf) {
            for (const [name, _] of Object.entries(sub.properties ?? {})) {
                if (seenProperties.has(name)) {
                    delete sub.properties?.[name]
                }
                seenProperties.add(name)
            }
            // if not all of them are nullable we can't make the allOf nullable
            sub.nullable = false
            sub.additionalProperties = true
            // make our life easier
            sub.patternProperties = undefined
            if (Object.keys(sub.properties ?? {}).length > 0 || Object.keys(sub.patternProperties ?? {}).length > 0) {
                allOf.push(sub)
            }
        }
        schema.allOf = allOf.map((x) => sensible({ schema: x, document, target, pre, post }))
        if (schema.allOf.length === 0) {
            schema.allOf = undefined
        }
    }

    if (target === 'openapi3') {
        // only support string enums
        if (schema.const && !isString(schema.const)) {
            schema.const = JSON.stringify(schema.const)
        }
        if (schema.enum) {
            schema.enum = schema.enum.map((x) => JSON.stringify(x))
        }
    }

    if (schema.anyOf !== undefined) {
        schema.anyOf = schema.anyOf.map((x) => sensible({ schema: x, document, target, pre, post }))
    }
    if (schema.oneOf !== undefined) {
        schema.oneOf = schema.oneOf.map((x) => sensible({ schema: x, document, target, pre, post }))
    }

    if (schema.properties !== undefined) {
        const properties = Object.entries(schema.properties)
        for (const [name, property] of properties) {
            const subSchema = sensible({ schema: property, document, target, pre, post })
            schema.properties[name] = subSchema
            if (deterministicBoolean(name) && !isObject(subSchema.default)) {
                schema.required ??= []
                schema.required.push(name)
            }
        }
    }

    if (schema.patternProperties !== undefined) {
        const patternProperties = Object.entries(schema.patternProperties)
        for (const [name, property] of patternProperties) {
            schema.patternProperties[name] = sensible({ schema: property, document, target, pre, post })
        }
    }
    if (schema.additionalProperties !== undefined && isObject(schema.additionalProperties)) {
        schema.additionalProperties = sensible({ schema: schema.additionalProperties, document, target, pre, post })
    }

    if (schema.items !== undefined) {
        schema.items = Array.isArray(schema.items)
            ? schema.items.map((x) => sensible({ schema: x, document, target, pre, post }))
            : sensible({ schema: schema.items, document, target, pre, post })
    }
    // In OpenAPI 3, exclusive min/max are not fully supported by AJV, so we convert them to regular min/max
    if (target === 'openapi3' && (schema.type === 'number' || schema.type === 'integer')) {
        if (schema.exclusiveMinimum !== undefined) {
            schema.minimum = schema.exclusiveMinimum
            schema.exclusiveMinimum = undefined
        }
        if (schema.exclusiveMaximum !== undefined) {
            schema.maximum = schema.exclusiveMaximum
            schema.exclusiveMaximum = undefined
        }
    }

    if (schema.minimum !== undefined && schema.maximum !== undefined) {
        const minimum = Math.min(schema.minimum, schema.maximum)
        const maximum = Math.max(schema.minimum, schema.maximum)
        schema.maximum = minimum
        schema.maximum = maximum
    }
    if (schema.exclusiveMinimum !== undefined && schema.exclusiveMaximum !== undefined) {
        const minimum = Math.min(schema.exclusiveMinimum, schema.exclusiveMaximum)
        const maximum = Math.max(schema.exclusiveMinimum, schema.exclusiveMaximum)
        schema.exclusiveMinimum = minimum
        schema.exclusiveMaximum = maximum
    }
    if (schema.minimum !== undefined && schema.exclusiveMaximum !== undefined) {
        const minimum = Math.min(schema.minimum, schema.exclusiveMaximum)
        const maximum = Math.max(schema.minimum, schema.exclusiveMaximum)
        schema.minimum = minimum
        schema.exclusiveMaximum = maximum
    }
    if (schema.exclusiveMinimum !== undefined && schema.maximum !== undefined) {
        const minimum = Math.min(schema.exclusiveMinimum, schema.maximum)
        const maximum = Math.max(schema.exclusiveMinimum, schema.maximum)
        schema.exclusiveMinimum = minimum
        schema.maximum = maximum
    }

    if (schema.type === 'integer') {
        schema.minimum = schema.minimum !== undefined ? Math.ceil(schema.minimum) : undefined
        schema.maximum = schema.maximum !== undefined ? Math.ceil(schema.maximum) : undefined
        schema.exclusiveMinimum = schema.exclusiveMinimum !== undefined ? Math.ceil(schema.exclusiveMinimum) : undefined
        schema.exclusiveMaximum = schema.exclusiveMaximum !== undefined ? Math.ceil(schema.exclusiveMaximum) : undefined
    }

    if (schema.minLength !== undefined && schema.maxLength !== undefined) {
        const minLength = Math.min(schema.minLength, schema.maxLength)
        const maxLength = Math.max(schema.minLength, schema.maxLength)
        schema.minLength = minLength
        schema.maxLength = maxLength
    }
    if (schema.minItems !== undefined && schema.maxItems !== undefined) {
        const minItems = Math.min(schema.minItems, schema.maxItems)
        const maxItems = Math.max(schema.minItems, schema.maxItems)
        schema.minItems = minItems
        schema.maxItems = maxItems
    }

    if (schema.multipleOf !== undefined) {
        // make generation easier
        schema.minimum = undefined
        schema.maximum = undefined
        schema.exclusiveMaximum = undefined
        schema.exclusiveMinimum = undefined
    }

    if (schema.type === 'array') {
        if (schema.additionalItems !== undefined && isObject(schema.items)) {
            // this case does not make any sense
            /// https://ajv.js.org/json-schema.html#additionalitems
            schema.additionalItems = undefined
        }

        if (Array.isArray(schema.items) && schema.minItems === undefined) {
            schema.minItems = schema.items.length
        }

        if (schema.uniqueItems !== undefined && schema.minItems !== undefined) {
            // we dont't test ajv uniquness check
            schema.uniqueItems = false
        }
        if (schema.additionalItems !== undefined && isObject(schema.additionalItems)) {
            schema.additionalItems = sensible({ schema: schema.additionalItems, document, target, pre, post })
        }
    }

    if (target !== 'openapi3') {
        if (schema.nullable === true && schema.type !== 'null' && schema.type) {
            // we dont support the nullable keyword outsize of openapi3/swagger
            schema.type = (
                Array.isArray(schema.type) ? [...new Set([...schema.type, 'null'])] : [schema.type, 'null']
            ) as JSONSchema.JsonSchema7TypeName[]
        }
    }

    if (Array.isArray(schema.type)) {
        if (schema.type.includes('null') && schema.nullable === false) {
            //this does not make sense
            schema.nullable = undefined
        }
    } else if (schema.type === 'null' && schema.nullable === false) {
        //this does not make sense
        schema.nullable = undefined
    }

    if (schema.$ref !== undefined && !schema.$ref.startsWith('#')) {
        document.$defs ??= {}
        const ref = schema.$ref.toUpperCase()
        schema.$ref = `#/$defs/${ref}`
        if (!(ref in document.$defs)) {
            document.$defs[ref] = {} //sensible({}, document)
        }
    }

    return omitUndefined(post(schema, document))
}

export const jsonSchemaArbitrary = ({ target }: { target: 'openapi3' | 'draft-07' }) =>
    arbitrary(jsonSchema).map((x) => {
        const schema = structuredClone(x) as JSONSchema.JsonSchema
        // coerce away things like -0
        return JSON.parse(JSON.stringify(sensible({ schema, document: schema, target })))
    })
