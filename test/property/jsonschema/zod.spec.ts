import { asyncForAll, forAll, isObject, omitUndefined } from '@skyleague/axioms'
import { ValidationError } from 'ajv'
import { jsonSchemaToZod } from 'json-schema-to-zod'
import ts from 'typescript'
import { expect, it } from 'vitest'
import type { ZodSchema } from 'zod'
import z from 'zod'
import { GenericFileOutput } from '../../../src/commands/generate/output/generic.js'
import { TypescriptFileOutput } from '../../../src/commands/generate/output/typescript.js'
import type * as JSONSchema from '../../../src/json.js'
import { $jsonschema } from '../../../src/lib/primitives/jsonschema/jsonschema.js'
import { $zod } from '../../../src/lib/primitives/zod/zod.js'
import { arbitrary } from '../../../src/lib/visitor/arbitrary/arbitrary.js'
import { toJsonSchema } from '../../../src/lib/visitor/jsonschema/jsonschema.js'
import { generateNode } from '../../../src/lib/visitor/prepass/prepass.js'
import { normalize, sensible } from './jsonschema.js'
import { jsonSchema } from './schema.schema.js'
import { JsonSchema } from './schema.type.js'

function zodSensiblePre(schema: JSONSchema.JsonSchema): JSONSchema.JsonSchema {
    if (schema.anyOf !== undefined) {
        if (schema.anyOf.length === 1) {
            return schema.anyOf[0]!
        }
    }
    if (schema.oneOf !== undefined) {
        if (schema.oneOf.length === 1) {
            return schema.oneOf[0]!
        }
    }
    if (schema.allOf !== undefined) {
        if (schema.allOf.length === 1) {
            return schema.allOf[0]!
        }
    }
    return omitUndefined(schema)
}

function zodSensiblePost(jsonschema: JSONSchema.JsonSchema): JSONSchema.JsonSchema {
    const schema = zodSensiblePre(jsonschema)
    if (schema.properties !== undefined) {
        const properties = Object.entries(schema.properties)
        for (const [name, _property] of properties) {
            // why?!
            if (isObject(schema.default) && name in schema.default) {
                schema.required = schema.required?.filter((x) => x !== name)
            }
        }
    }

    // normalized by zod
    if (Array.isArray(schema.type)) {
        if (schema.type.length === 1) {
            schema.type = schema.type[0]
        }
    }

    // not supported by zod
    schema.title = undefined
    schema.writeonly = undefined
    schema.readonly = undefined
    schema.examples = undefined
    schema.deprecated = undefined

    if (!schema.description) {
        schema.description = undefined
    }
    if (schema.nullable === false) {
        schema.nullable = undefined
    }
    if (schema.format !== undefined && ['hostname'].includes(schema.format)) {
        schema.format = undefined
    }
    schema['x-arbitrary'] = undefined
    schema.patternProperties = undefined

    // not properly supported by the jsonSchmaToZod
    schema.$defs = undefined
    schema.$ref = undefined
    schema.uniqueItems = undefined

    schema.additionalItems = undefined

    if (Array.isArray(schema.type)) {
        return {
            anyOf: schema.type.map((x) => zodSensiblePost(omitUndefined({ ...(x !== 'null' ? schema : {}), type: x }))),
        }
    }
    if (schema.enum !== undefined && schema.enum.length > 1 && !schema.enum.every((x) => typeof x === 'string')) {
        return {
            anyOf: schema.enum.map((x) => omitUndefined({ ...schema, enum: undefined, const: x })),
        }
    }

    // why?!
    if ((schema.type === 'number' || schema.type === 'integer') && schema.multipleOf === 1) {
        schema.type = 'integer'
        schema.multipleOf = undefined
    }

    // why?!
    if (schema.type === 'object') {
        schema.default = undefined
    }

    if (schema.required?.length === 0) {
        schema.required = undefined
    }

    if (isObject(schema.additionalProperties) && !('type' in schema.additionalProperties)) {
        schema.additionalProperties = true
    }

    return omitUndefined(schema)
}

function zodNormalize(schema: JSONSchema.JsonSchema): JSONSchema.JsonSchema {
    if (schema.anyOf !== undefined) {
        schema.anyOf = schema.anyOf.map((x) => zodNormalize(x))
    }
    if (schema.oneOf !== undefined) {
        schema.oneOf = schema.oneOf.map((x) => zodNormalize(x))
    }
    if (schema.allOf !== undefined) {
        schema.allOf = schema.allOf.map((x) => zodNormalize(x))
    }
    if (schema.properties !== undefined) {
        const properties = Object.entries(schema.properties)
        for (const [name, property] of properties) {
            schema.properties[name] = zodNormalize(property)
        }
    }
    if (schema.patternProperties !== undefined) {
        const patternProperties = Object.entries(schema.patternProperties)
        for (const [name, property] of patternProperties) {
            schema.patternProperties[name] = zodNormalize(property)
        }
    }
    if (schema.additionalProperties !== undefined && isObject(schema.additionalProperties)) {
        schema.additionalProperties = zodNormalize(schema.additionalProperties)
    }

    if (schema.items !== undefined) {
        schema.items = Array.isArray(schema.items) ? schema.items.map((x) => zodNormalize(x)) : zodNormalize(schema.items)
    }

    if (schema.type === 'array') {
        if (schema.additionalItems !== undefined && isObject(schema.additionalItems)) {
            schema.additionalItems = zodNormalize(schema.additionalItems)
        }
    }

    // not supported by jsonSchemaToZod
    schema.additionalItems = undefined

    return omitUndefined(schema)
}

it.each(['draft-07', 'openapi3'] as const)(
    '%s - arbitrary <=> jsonschema <=> therefore <=> jsonschema',
    async (target) => {
        await asyncForAll(
            arbitrary(jsonSchema).map((x) => JSON.parse(JSON.stringify(x))),
            async (jsonschema) => {
                const copy = structuredClone(jsonschema)
                // schema = zodSensible(schema, schema)
                const schema = sensible({ schema: copy, document: copy, pre: zodSensiblePre, post: zodSensiblePost, target })
                const zodStr = jsonSchemaToZod(structuredClone(schema) as any, { module: 'cjs' })
                // biome-ignore lint/security/noGlobalEval: needed here as part of the test
                const zod = eval(zodStr)
                const therefore = $zod(zod, { keepOriginalSchema: false })
                therefore._name = 'Root'
                generateNode(therefore)
                const converted = toJsonSchema(therefore, { target })
                const normalized = {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    title: 'Root',
                    ...normalize(structuredClone(schema), { target }),
                }

                const fileOutput = new GenericFileOutput({ path: 'test.json' })
                fileOutput.references = converted.references
                fileOutput.content = { content: JSON.stringify(converted.schema), output: {} as any }

                const transformed = JSON.parse((await fileOutput.render()) as unknown as string)

                expect(zodNormalize(transformed)).toStrictEqual(normalized)

                const original = structuredClone(converted.schema)
                JsonSchema.assert(converted.schema)
                expect(original).toEqual(converted.schema)

                const declaration = TypescriptFileOutput.define({ symbol: therefore, render: true })
                const transpiled = ts.transpileModule(declaration, { reportDiagnostics: true })
                if (transpiled.diagnostics?.length !== 0) {
                    throw new Error(declaration)
                }

                forAll(
                    arbitrary(therefore),
                    (value) => {
                        if (converted.validator !== undefined && (converted.validator(value) as boolean)) {
                            return true
                        }
                        throw new ValidationError(converted.validator?.errors ?? [])
                    },
                    {
                        seed: 42n,
                    },
                )
            },
            {
                tests: 200,
                depth: 'm',
                shrinks: 400,
            },
        )
    },
    100000,
)

it.each(['draft-07', 'openapi3'] as const)(
    '%s - arbitrary <=> jsonschema <=> zod <=> arbitrary',
    async (target) => {
        await asyncForAll(
            arbitrary(jsonSchema).map((x) => JSON.parse(JSON.stringify(x))),
            async (jsonschema) => {
                const copy = structuredClone(jsonschema)
                // schema = zodSensible(schema, schema)
                const schema = sensible({
                    schema: copy,
                    document: copy,
                    pre: (x) => {
                        const schema = zodSensiblePre(x)

                        // zod doesnt properly support full literals
                        if (schema.const !== undefined) {
                            schema.const = JSON.stringify(schema.const)
                        }
                        if (schema.enum !== undefined) {
                            schema.enum = schema.enum.map((x) => JSON.stringify(x))
                        }
                        if (schema.format !== undefined) {
                            schema.format = undefined
                        }
                        return schema
                    },
                    post: zodSensiblePost,
                    target,
                })
                const zodStr = jsonSchemaToZod(structuredClone(schema) as any, { module: 'cjs' })
                // biome-ignore lint/security/noGlobalEval: needed here as part of the test
                const zod: ZodSchema = eval(zodStr)

                const therefore = $jsonschema(structuredClone(schema), {
                    name: 'root',
                    allowIntersection: true,
                    dereference: false,
                    // make our own lives a whole lot easier
                    validator: { type: 'zod' },
                }).validator({
                    type: 'zod',
                })
                generateNode(therefore)
                const declaration = TypescriptFileOutput.define({ symbol: therefore, render: true })
                const transpiled = ts.transpileModule(declaration, { reportDiagnostics: true })
                if (transpiled.diagnostics?.length !== 0) {
                    throw new Error(declaration)
                }

                void z

                // biome-ignore lint/security/noGlobalEval: needed here as part of the test
                const execute = await eval(`const { z } = require("zod"); ${transpiled.outputText}; Root`)

                forAll(
                    arbitrary(zod),
                    (value) => {
                        return zod.safeParse(value).success && execute.safeParse(value).success
                    },
                    {
                        seed: 42n,
                    },
                )
            },
            {
                tests: 200,
                depth: 'm',
                shrinks: 400,
            },
        )
    },
    100000,
)
