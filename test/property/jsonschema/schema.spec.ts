import { JsonSchema } from './schema.type.js'

import type * as JSONSchema from '../../../src/json.js'
import { GenericFileOutput } from '../../../src/lib/output/generic.js'
import { TypescriptFileOutput } from '../../../src/lib/output/typescript.js'
import { $jsonschema } from '../../../src/lib/primitives/jsonschema/jsonschema.js'
import { arbitrary } from '../../../src/lib/visitor/arbitrary/arbitrary.js'
import { toJsonSchema } from '../../../src/lib/visitor/jsonschema/jsonschema.js'
import { generateNode } from '../../../src/lib/visitor/prepass/prepass.js'
import { toLiteral } from '../../../src/lib/visitor/typescript/literal.js'

import { asyncForAll, constant, forAll, tuple } from '@skyleague/axioms'
import { ValidationError } from 'ajv'
import ts from 'typescript'
import { expect, it } from 'vitest'
import { jsonSchemaArbitrary, normalize } from './jsonschema.js'

it('annotation type matches', () => {
    // check if they are compatible
    const _foo: JSONSchema.JsonSchema = {} satisfies JsonSchema
})

it('arbitrary <=> jsonschema <=> therefore <=> jsonschema', async () => {
    await asyncForAll(
        jsonSchemaArbitrary,
        async (schema) => {
            const therefore = $jsonschema(structuredClone(schema), {
                name: 'root',
                allowIntersection: true,
                dereference: false,
                // make our own lives a whole lot easier
                validator: {
                    ajv: { useDefaults: false },
                },
            })
            generateNode(therefore)
            const converted = toJsonSchema(therefore)
            const normalized = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: 'Root',
                ...normalize(structuredClone(schema)),
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
            timeout: false,
        },
    )
})

it('value to literal', () => {
    forAll(
        jsonSchemaArbitrary
            .map((schema) => {
                const therefore = $jsonschema(structuredClone(schema), {
                    name: 'root',
                    allowIntersection: true,
                    dereference: false,
                    // make our own lives a whole lot easier
                    validator: {
                        ajv: { useDefaults: false },
                    },
                })
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
            timeout: false,
        },
    )
})
