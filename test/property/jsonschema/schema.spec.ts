import { asyncForAll, constant, forAll, omitUndefined, tuple } from '@skyleague/axioms'
import { Ajv, type AnySchema, ValidationError } from 'ajv'
import ts from 'typescript'
import { expect, it } from 'vitest'
import { GenericFileOutput } from '../../../src/commands/generate/output/generic.js'
import { TypescriptFileOutput } from '../../../src/commands/generate/output/typescript.js'
import type * as JSONSchema from '../../../src/json.js'
import { defaultAjvConfig } from '../../../src/lib/ajv/defaults.js'
import { $jsonschema } from '../../../src/lib/primitives/jsonschema/jsonschema.js'
import { arbitrary } from '../../../src/lib/visitor/arbitrary/arbitrary.js'
import { toJsonSchema } from '../../../src/lib/visitor/jsonschema/jsonschema.js'
import { generateNode } from '../../../src/lib/visitor/prepass/prepass.js'
import { toLiteral } from '../../../src/lib/visitor/typescript/literal.js'
import { jsonSchemaArbitrary, normalize } from './jsonschema.js'
import { JsonSchema } from './schema.type.js'

it('annotation type matches', () => {
    // check if they are compatible
    const _foo: JSONSchema.JsonSchema = {} satisfies JsonSchema
})

function extendSchemaCoverage(schema: JSONSchema.JsonSchema) {
    let value = schema
    // in case all mixed types are unique, combine them into one single object to test those code paths as well
    // as the specified anyOf
    const anyOf = value.anyOf
    if (anyOf !== undefined && anyOf.length > 1) {
        const typeGroups = Object.groupBy(
            anyOf.flatMap((x) => x.type),
            (x) => {
                if (x === 'number' || x === 'integer') {
                    return 'numeric'
                }
                return x ?? 'undefined'
            },
        )
        const allUnique = Object.values(typeGroups).every((x) => x.length === 1)
        if (allUnique && anyOf.every((x) => x.type !== undefined)) {
            // assign all seperate types to the schema object, and create the types array
            value = Object.assign(schema, ...anyOf.map((x) => omitUndefined(x)))
            value.type = anyOf.flatMap((x) => x.type) as JSONSchema.JsonSchema7TypeName[]
            value.anyOf = undefined
        }
    }
    // Recursively handle nested schemas
    if (value.properties !== undefined) {
        const properties = Object.entries(value.properties)
        for (const [name, property] of properties) {
            value.properties[name] = extendSchemaCoverage(property)
        }
    }

    if (value.patternProperties !== undefined) {
        const patternProperties = Object.entries(value.patternProperties)
        for (const [name, property] of patternProperties) {
            value.patternProperties[name] = extendSchemaCoverage(property)
        }
    }

    if (value.additionalProperties !== undefined && typeof value.additionalProperties === 'object') {
        value.additionalProperties = extendSchemaCoverage(value.additionalProperties)
    }

    if (value.items !== undefined) {
        if (Array.isArray(value.items)) {
            value.items = value.items.map((item) => extendSchemaCoverage(item))
        } else {
            value.items = extendSchemaCoverage(value.items)
        }
    }

    if (value.additionalItems !== undefined && typeof value.additionalItems === 'object') {
        value.additionalItems = extendSchemaCoverage(value.additionalItems)
    }

    if (value.allOf !== undefined) {
        value.allOf = value.allOf.map((schema) => extendSchemaCoverage(schema))
    }

    if (value.anyOf !== undefined) {
        value.anyOf = value.anyOf.map((schema) => extendSchemaCoverage(schema))
    }

    if (value.oneOf !== undefined) {
        value.oneOf = value.oneOf.map((schema) => extendSchemaCoverage(schema))
    }

    if (value.not !== undefined) {
        value.not = extendSchemaCoverage(value.not)
    }
    return value
}

it.each(['draft-07', 'openapi3'] as const)(
    '%s - arbitrary <=> jsonschema <=> therefore <=> jsonschema',
    async (target) => {
        await asyncForAll(
            jsonSchemaArbitrary({ target }),
            async (schema) => {
                const therefore = $jsonschema(structuredClone(schema), {
                    name: 'root',
                    allowIntersection: true,
                    dereference: false,
                })
                    // make our own lives a whole lot easier
                    .validator({ type: 'ajv', ajv: { useDefaults: false } })
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

                expect(transformed).toStrictEqual(normalized)

                const original = structuredClone(converted.schema)
                JsonSchema.assert(converted.schema)
                expect(original).toEqual(converted.schema)

                const declaration = TypescriptFileOutput.define({ symbol: therefore, render: true })
                const transpiled = ts.transpileModule(declaration, { reportDiagnostics: true })
                if (transpiled.diagnostics?.length !== 0) {
                    throw new Error(declaration)
                }

                // nullable is only partially supported in ajv
                const originalValidator =
                    target === 'draft-07'
                        ? new Ajv({ ...defaultAjvConfig, allowUnionTypes: true, useDefaults: false }).compile(
                              extendSchemaCoverage(schema) as AnySchema,
                          )
                        : undefined
                forAll(
                    arbitrary(therefore),
                    (value) => {
                        if (
                            converted.validator !== undefined &&
                            (converted.validator(value) as boolean) &&
                            originalValidator?.(value) !== false
                        ) {
                            return true
                        }
                        throw new ValidationError(converted.validator?.errors ?? originalValidator?.errors ?? [])
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
    150000,
)

it.each(['draft-07', 'openapi3'] as const)(
    '%s - value to literal',
    (target) => {
        forAll(
            jsonSchemaArbitrary({ target })
                .map((schema) => {
                    const therefore = $jsonschema(structuredClone(schema), {
                        name: 'root',
                        allowIntersection: true,
                        dereference: false,
                    })
                        // make our own lives a whole lot easier
                        .validator({ type: 'ajv', ajv: { useDefaults: false } })
                    return therefore
                })
                .chain((therefore) => tuple(constant(therefore), arbitrary(therefore))),
            ([therefore, value]) => {
                const declaration = TypescriptFileOutput.define({ symbol: therefore, render: true })
                const transpiled = ts.transpileModule([declaration, `export const root: Root = ${toLiteral(value)}`].join('\n'), {
                    reportDiagnostics: true,
                })
                if (transpiled.diagnostics?.length !== 0) {
                    throw new Error(declaration)
                }
            },
            {
                tests: 1000,
                depth: 'm',
                shrinks: 400,
            },
        )
    },
    150000,
)
