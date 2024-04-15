import type {
    JsonAnnotations,
    JsonAnyInstance,
    JsonArrayInstance,
    JsonObjectInstance,
    JsonSchema,
    ThereforeExtension,
} from '../../../json.js'
import { hasOptionalPrimitive } from '../../cst/graph.js'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { References } from '../../output/references.js'
import { ConstType } from '../../primitives/const/const.js'
import { $null } from '../../primitives/null/null.js'
import { ajvOptions } from '../../primitives/validator/validator.js'

import type { RelaxedPartial } from '@skyleague/axioms'
import { omitUndefined, second } from '@skyleague/axioms'
import type { Options as AjvOptions, Schema } from 'ajv'
import Ajv from 'ajv'
import addFormats, { type FormatName } from 'ajv-formats'
import standaloneCode from 'ajv/dist/standalone/index.js'
import type { StringFormat } from '../../primitives/string/string.js'

export interface JsonSchemaWalkerContext {
    ajv: AjvOptions
    entry?: Node | undefined
    definitions: NonNullable<JsonSchema['definitions']>
    references: References<'generic'>
    formats: Set<string>
    transform: (node: Node, schema: RelaxedPartial<JsonSchema>) => JsonSchema
    render: (node: Node) => JsonSchema
}

export function buildContext(
    obj?: Node,
    { references = new References('generic') }: { references?: References<'generic'> } = {},
): JsonSchemaWalkerContext {
    const ajv = ajvOptions(obj)
    ajv.code ??= {}
    ajv.code.source = true

    const context: JsonSchemaWalkerContext = {
        ajv,
        definitions: {},
        entry: obj,
        references,
        formats: new Set(),
        transform: (node, schema): JsonSchema => {
            const { type, ...other } = schema
            return omitUndefined({
                type,
                ...annotate(schema, node),
                ...other,
            })
        },
        render: (node) => walkTherefore(node, jsonSchemaVisitor, context),
    }
    return context
}

export function annotate(schema: JsonSchema, node: Node): JsonAnnotations {
    const hasType = schema.type !== undefined

    return {
        title: node.definition.jsonschema?.title,
        writeonly: node.definition.jsonschema?.writeonly,
        examples: node.definition.jsonschema?.examples,

        description: node.definition.description,
        default: node.definition.default,
        readonly: node.definition.readonly,
        deprecated: node.definition.deprecated,
        nullable: hasType ? node.definition.nullable : undefined,
    }
}

export const toFormat: Record<StringFormat, JsonSchema['format'] | 'ulid' | 'uuid'> = {
    'date-time': 'date-time',
    date: 'date',
    time: 'time',
    email: 'email',
    hostname: 'hostname',
    ipv4: 'ipv4',
    ipv6: 'ipv6',
    uri: 'uri',
    ulid: 'ulid',
    uuid: 'uuid',
}

export const jsonSchemaVisitor: ThereforeVisitor<RelaxedPartial<JsonSchema>, JsonSchemaWalkerContext> = {
    string: ({ options }, { formats }) => {
        const format = options.format ? (toFormat[options.format] as JsonSchema['format']) : undefined
        if (format !== undefined) {
            formats.add(format)
        }
        return {
            type: 'string',
            minLength: options.minLength,
            maxLength: options.maxLength,
            pattern: typeof options.regex !== 'string' ? options.regex?.source : options.regex,
            format: format,
            'x-arbitrary': options.arbitrary,
        }
    },
    number: ({ options }) => ({
        type: 'number',
        multipleOf: options.multipleOf,
        ...(options.minInclusive ? { minimum: options.min } : { exclusiveMinimum: options.min }),
        ...(options.maxInclusive ? { maximum: options.max } : { exclusiveMaximum: options.max }),
        'x-arbitrary': options.arbitrary,
    }),
    integer: ({ options }) => ({
        type: 'integer',
        multipleOf: options.multipleOf,
        ...(options.minInclusive ? { minimum: options.min } : { exclusiveMinimum: options.min }),
        ...(options.maxInclusive ? { maximum: options.max } : { exclusiveMaximum: options.max }),
        'x-arbitrary': options.arbitrary,
    }),
    boolean: () => ({
        type: 'boolean',
    }),
    unknown: ({ options }) => ({ 'x-arbitrary': options.arbitrary }),
    const: (node) => {
        if (node.const === null) {
            return {
                type: 'null',
            }
        }
        // we need to extend the set
        if (node.definition.nullable) {
            return {
                enum: [node.const, null],
            }
        }
        return {
            const: node.const,
        }
    },
    enum: (node) => {
        const values = node.isNamed ? node.values.map(second) : node.values
        if (node.definition.nullable) {
            return {
                enum: [...values, null],
            }
        }
        return {
            enum: values,
        }
    },
    union: ({ children, definition }, context) => {
        if (definition.nullable === true && children.find((c) => c instanceof ConstType && c.const === null) === undefined) {
            return {
                anyOf: [...children, $null()].map((u) => context.render(u)),
            }
        }
        return {
            anyOf: children.map((u) => context.render(u)),
        }
    },
    intersection: ({ children, definition }, context) => {
        if (definition.nullable === true) {
            return {
                anyOf: [
                    {
                        allOf: children.map((u) => context.render(u)),
                    },
                    {
                        type: 'null',
                    },
                ],
            }
        }
        return {
            allOf: children.map((u) => {
                return context.render(u)
            }),
        }
    },
    object: (
        { shape, options, recordType, patternProperties: childPatternProperties },
        context,
    ): JsonAnyInstance & JsonObjectInstance & ThereforeExtension => {
        const properties: NonNullable<JsonSchema['properties']> = {}
        const required: string[] = []
        for (const [name, child] of Object.entries(shape)) {
            properties[name] = context.render(child)
            const defaultIsInferred = child.definition.default !== undefined && context.ajv.useDefaults === true
            if (!(defaultIsInferred || hasOptionalPrimitive(child))) {
                required.push(name)
            }
        }

        const additionalProperties: JsonSchema['additionalProperties'] =
            recordType !== undefined ? context.render(recordType) : options.strict !== true
        const patternProperties: JsonSchema['patternProperties'] =
            childPatternProperties !== undefined
                ? Object.fromEntries(
                      Object.entries(childPatternProperties).map(([pattern, values]) => [pattern, context.render(values)]),
                  )
                : undefined
        return {
            type: 'object' as const,
            properties: Object.keys(shape).length > 0 ? properties : undefined,
            required: required.length > 0 ? required.sort((a, b) => a.localeCompare(b)) : undefined,
            additionalProperties,
            patternProperties,
            'x-arbitrary': options.arbitrary,
        } satisfies JsonSchema
    },
    array: ({ options, element }, context): JsonArrayInstance & JsonAnyInstance & ThereforeExtension => {
        return {
            type: 'array' as const,
            items: context.render(element),
            minItems: options.minItems,
            maxItems: options.maxItems,
            uniqueItems: options.set,
            'x-arbitrary': options.arbitrary,
        }
    },
    tuple: ({ elements, options: { rest } }, context): JsonArrayInstance & JsonAnyInstance => {
        return {
            type: 'array',
            items: elements.map((c) => context.render(c)),
            additionalItems: rest !== undefined ? context.render(rest) : false,
            minItems: elements.length,
        }
    },
    ref: ({ children: [reference], definition }, context) => {
        const { definitions, entry, references } = context

        const uuid = reference.id

        if (
            entry !== undefined &&
            (uuid === entry.id || (reference.isCommutative && reference.children?.find((c) => c.id === entry.id) !== undefined))
        ) {
            // we referenced the root of the schema
            return { $ref: '#' }
        }

        const symbolName = references.reference(reference, 'symbolName')
        if (definitions[symbolName] === undefined) {
            definitions[symbolName] = {} // mark spot as taken (prevents recursion)
            const node: JsonSchema = context.render(reference)
            // node.title = symbolName
            definitions[symbolName] = node
        }
        if (definition.nullable) {
            // https://github.com/OAI/OpenAPI-Specification/issues/1368
            return { oneOf: [{ $ref: `#/$defs/${symbolName}` }, { type: 'null' }] }
        }
        return { $ref: `#/$defs/${symbolName}` }
    },
    default: (node, context) => {
        const child = node.children?.[0]
        if (node.isCommutative && child !== undefined) {
            return context.render(child)
        }
        console.error(node)
        throw new Error('should not be called')
    },
}

export function toJsonSchema(
    obj: Node,
    {
        compile = true,
        references = new References('generic'),
        formats = true,
    }: { compile?: boolean; references?: References<'generic'>; formats?: boolean } = {},
) {
    const context = buildContext(obj, { references })
    const definition: JsonSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: references.reference(obj, 'symbolName'),
        ...context.render(obj),
    } as const

    if (Object.keys(context.definitions).length > 0) {
        definition.$defs = context.definitions
    }
    if (compile) {
        const ajv = new Ajv.default(context.ajv)
        if (context.formats.size > 0 && formats) {
            addFormats.default(ajv, { formats: [...context.formats] as FormatName[] })
        }

        const validator = ajv.compile(definition as Schema)
        let code = standaloneCode.default(ajv, validator)
        code = `${code};validate.schema=schema11;`
        if (code.includes('require(')) {
            code = `import {createRequire} from 'module';const require = createRequire(import.meta.url);${code}`
        }
        // nice little "hack" to disble inferrence on the validate function
        // it also allows copying over the javascript files like tsc should
        code = code.replace('export const validate =', '\n/** @type {unknown} */\nexport const validate =')
        return {
            schema: definition,
            code,
            validator,
            compiled: true as const,
            references: context.references,
            formats: [...context.formats],
        }
    }
    return { schema: definition, compiled: false as const, formats: [...context.formats], references: context.references }
}
