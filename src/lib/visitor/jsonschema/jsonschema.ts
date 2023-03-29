import type { JsonSchemaValidator } from '../../../commands/generate/types.js'
import type { JsonAnnotations, JsonSchema, JsonSchema7TypeName } from '../../../json.js'
import { defaultAjvConfig } from '../../ajv/defaults.js'
import type { ThereforeNode } from '../../cst/cst.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { isNamedArray } from '../../guard.js'
import type { MetaDescription, SchemaMeta } from '../../primitives/base.js'
import type { ThereforeCst } from '../../primitives/types.js'

import type { RelaxedPartial } from '@skyleague/axioms'
import { asArray, evaluate, omit, omitUndefined } from '@skyleague/axioms'
import type { Options as AjvOptions } from 'ajv'
import _Ajv from 'ajv'
import _standaloneCode from 'ajv/dist/standalone/index.js'
import { transform } from 'esbuild'

const Ajv = _Ajv.default ?? _Ajv
const standaloneCode = _standaloneCode.default ?? _standaloneCode

export interface JsonSchemaWalkerContext {
    defaults: {
        additionalProperties: boolean
    }
    ajvOptions: AjvOptions
    entry?: ThereforeNode | undefined
    definitions: NonNullable<JsonSchema['definitions']>
    transform: (node: ThereforeNode, schema: RelaxedPartial<JsonSchema>) => JsonSchema
}

export function toType(type: JsonSchema['type'], definition: MetaDescription): JsonSchema['type'] {
    if (type === undefined) {
        return undefined
    }
    return definition.nullable ? [...asArray(type), 'null'] : type
}

export function annotate(schemaType: JsonSchema7TypeName | JsonSchema7TypeName[] | undefined, doc: SchemaMeta): JsonAnnotations {
    return omitUndefined({
        title: doc.title ?? doc.name,
        description: doc.description,
        default: doc.default,
        readonly: doc.readonly,
        // writeonly?: boolean
        examples: doc.examples,
        deprecated: doc.deprecated,
        nullable: schemaType !== undefined ? doc.nullable : undefined,
    })
}

export const jsonSchemaVisitor: ThereforeVisitor<RelaxedPartial<JsonSchema>, JsonSchemaWalkerContext> = {
    string: ({ value: image }) => ({
        type: 'string',
        ...image,
        pattern: typeof image.pattern !== 'string' ? image.pattern?.source : image.pattern,
    }),
    number: (node) => ({
        type: 'number',
        ...node.value,
    }),
    integer: (node) => ({
        type: 'integer',
        ...node.value,
    }),
    boolean: (node) => ({
        type: 'boolean',
        ...node.value,
    }),
    null: () => ({
        type: 'null',
    }),
    unknown: () => ({}),
    enum: ({ children }) => {
        const values = isNamedArray(children) ? children.map(([, c]) => c) : children
        if (values.length === 1) {
            return {
                const: values[0],
            }
        }
        return {
            enum: values,
        }
    },
    union: ({ children }, context) => {
        return {
            anyOf: children.map((u) => walkTherefore(u, jsonSchemaVisitor, context)),
        }
    },
    intersection: ({ children }, context) => {
        return {
            allOf: children.map((u) =>
                walkTherefore(
                    {
                        ...u,
                        value: {
                            ...u.value,
                            // force non strict subsets
                            additionalProperties: true,
                        },
                    },
                    jsonSchemaVisitor,
                    context
                )
            ),
        }
    },
    object: ({ children, value }, context) => {
        const properties: NonNullable<JsonSchema['properties']> = {}
        const required: string[] = []
        for (const child of children) {
            properties[child.name] = walkTherefore(child, jsonSchemaVisitor, context)
            const defaultIsInferred = child.description.default !== undefined && context.ajvOptions.useDefaults === true
            if (!defaultIsInferred && (child.description.optional === undefined || child.description.optional === 'explicit')) {
                required.push(child.name)
            }
        }
        return omitUndefined({
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
            additionalProperties: value.additionalProperties
                ? true
                : value.indexSignature !== undefined
                ? walkTherefore(value.indexSignature, jsonSchemaVisitor, context)
                : value.additionalProperties ?? context.defaults.additionalProperties,
            patternProperties:
                value.indexPatterns !== undefined
                    ? (Object.fromEntries(
                          Object.entries(value.indexPatterns).map(([pattern, values]) => [
                              pattern,
                              walkTherefore(values, jsonSchemaVisitor, context),
                          ])
                      ) as JsonSchema['patternProperties'])
                    : undefined,
        }) as JsonSchema
    },
    array: (node, context) => {
        const [items] = node.children
        return {
            type: 'array',
            items: walkTherefore(items, jsonSchemaVisitor, context),
            ...node.value,
        }
    },
    tuple: ({ children }, context) => {
        return {
            type: 'array',
            items: children.map((c) => walkTherefore(c, jsonSchemaVisitor, context)),
            additionalItems: false,
            minItems: children.length,
        }
    },
    dict: ({ children }, context) => {
        const [items] = children
        return {
            type: 'object',
            additionalProperties: walkTherefore(items, jsonSchemaVisitor, context),
        }
    },
    ref: ({ children: unevaluatedReference, description }, context) => {
        const reference = evaluate(unevaluatedReference[0])

        const { definitions, entry } = context

        const uuid = reference.uuid

        if (entry && uuid === entry.uuid) {
            // we referenced the root of the schema
            return { $ref: '#' }
        }

        if (definitions[`{{${uuid}:uniqueSymbolName}}`] === undefined) {
            definitions[`{{${uuid}:uniqueSymbolName}}`] = {} // mark spot as taken (prevents recursion)
            const node: JsonSchema = walkTherefore(reference, jsonSchemaVisitor, context)
            node.title = `{{${uuid}:uniqueSymbolName}}`
            definitions[`{{${uuid}:uniqueSymbolName}}`] = node
        }
        if (description.nullable) {
            return { oneOf: [{ type: 'null' }, { $ref: `#/$defs/{{${uuid}:uniqueSymbolName}}` }] }
        }
        return { $ref: `#/$defs/{{${uuid}:uniqueSymbolName}}` }
    },
    custom: () => {
        return {}
    },
    default: (node) => {
        console.error(node)
        throw new Error('should not be called')
    },
}

export function jsonSchemaContext(obj?: ThereforeCst): JsonSchemaWalkerContext {
    return {
        defaults: {
            additionalProperties: true,
            ...(obj !== undefined && 'defaults' in obj.value ? obj.value.defaults : {}),
        },
        ajvOptions: {
            ...defaultAjvConfig,
            ...obj?.description.ajvOptions,
            code: {
                ...defaultAjvConfig.code,
                source: true,
            },
        },
        definitions: {},
        entry: obj,
        transform: (node, schema): JsonSchema => {
            const schemaType = toType(schema.type, node.description)
            return omitUndefined({
                type: schemaType,
                ...annotate(schemaType, node.description),
                ...omit(schema, ['type']),
            })
        },
    }
}

export async function toJsonSchema(obj: ThereforeCst, compile: true): Promise<Extract<JsonSchemaValidator, { compiled: true }>>
export async function toJsonSchema(obj: ThereforeCst, compile?: boolean): Promise<JsonSchemaValidator>
export async function toJsonSchema(obj: ThereforeCst, compile = false): Promise<JsonSchemaValidator> {
    const context = jsonSchemaContext(obj)
    const definition: JsonSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: `{{${obj.uuid}:uniqueSymbolName}}`,
        ...walkTherefore(obj, jsonSchemaVisitor, context),
    }

    if (Object.keys(context.definitions).length > 0) {
        definition.$defs = context.definitions
    }
    if (compile) {
        const ajv = new Ajv(context.ajvOptions)
        const validator = ajv.compile(definition)
        let code = standaloneCode(ajv, validator)
        code = code.replace('module.exports = validate10;module.exports.default = validate10', 'export {validate10}')
        code = `${code};validate10.schema=schema11;`
        if (code.includes('require(')) {
            code = `import {createRequire} from 'module';const require = createRequire(import.meta.url);${code}`
        }
        code = (
            await transform(code, {
                platform: 'node',
                target: 'esnext',
                format: 'esm',
                minify: true,
            })
        ).code

        return {
            schema: definition,
            code,
            validator,
            compiled: true,
        }
    }
    return { schema: definition, compiled: false }
}

export { toJsonSchema as toSchema }
