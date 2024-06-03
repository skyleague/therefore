import { isObject, omitUndefined } from '@skyleague/axioms'
import type { Options as AjvOptions, Schema } from 'ajv'
import { Ajv } from 'ajv'
import addFormats, { type FormatName } from 'ajv-formats'
import standaloneCode from 'ajv/dist/standalone/index.js'
import camelcase from 'camelcase'
import type {
    JsonAnnotations,
    JsonAnyInstance,
    JsonArrayInstance,
    JsonObjectInstance,
    JsonSchema,
    ThereforeExtension,
} from '../../../json.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { References } from '../../output/references.js'
import type { JSONObjectType } from '../../primitives/jsonschema/jsonschema.js'
import type { StringFormat } from '../../primitives/string/string.js'
import { ajvOptions } from '../../primitives/validator/validator.js'

export interface JsonSchemaWalkerContext {
    ajv: AjvOptions
    entry?: Node | undefined
    branch: Node | undefined
    current: Node | undefined
    definitions: NonNullable<JsonSchema['definitions']>
    references: References<'generic'>
    formats: Set<string>
    transform: (node: Node, schema: Partial<JsonSchema>) => JsonSchema
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
        branch: obj,
        current: obj,
        references,
        formats: new Set(),
        transform: (node, schema): JsonSchema => {
            const { type, ...other } = schema
            return omitUndefined({
                type,
                ...annotate(schema, node, context.branch),
                ...other,
            })
        },
        render: (node) => {
            const previous = context?.current
            const branch = context.branch
            if (previous?._isCommutative === false) {
                context.branch = node
            }

            context.current = node
            const value = walkTherefore(node, jsonSchemaVisitor, context)
            context.current = previous
            context.branch = branch

            return value
        },
    }
    return context
}

export function annotate(schema: JsonSchema, node: Node, branch: Node | undefined): JsonAnnotations {
    const hasType = schema.type !== undefined

    return {
        title: node._definition.jsonschema?.title,
        writeonly: node._definition.jsonschema?.writeonly,
        examples: node._definition.jsonschema?.examples,

        description: node._definition.description,
        default: node._definition.default,
        readonly: node._definition.readonly,
        deprecated: node._definition.deprecated,
        nullable: hasType && branch !== undefined ? (hasNullablePrimitive(branch) ? true : undefined) : undefined,
    }
}

export const toFormat: Record<StringFormat, JsonSchema['format'] | 'ulid' | 'uuid' | 'duration'> = {
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
    duration: 'duration',
    base64: undefined,
}

export const jsonSchemaVisitor: ThereforeVisitor<JsonSchema, JsonSchemaWalkerContext> = {
    string: ({ _options: options }, { formats }) => {
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
            contentEncoding: options.format === 'base64' ? 'base64' : undefined,
            'x-arbitrary': options.arbitrary,
        }
    },
    number: ({ _options: options }) => ({
        type: 'number',
        multipleOf: options.multipleOf,
        ...(options.minInclusive ? { minimum: options.min } : { exclusiveMinimum: options.min }),
        ...(options.maxInclusive ? { maximum: options.max } : { exclusiveMaximum: options.max }),
        'x-arbitrary': options.arbitrary,
    }),
    integer: ({ _options: options }) => ({
        type: 'integer',
        multipleOf: options.multipleOf,
        ...(options.minInclusive ? { minimum: options.min } : { exclusiveMinimum: options.min }),
        ...(options.maxInclusive ? { maximum: options.max } : { exclusiveMaximum: options.max }),
        'x-arbitrary': options.arbitrary,
    }),
    boolean: () => ({
        type: 'boolean',
    }),
    unknown: ({ _options: options }) => ({ 'x-arbitrary': options.arbitrary }),
    const: (node, { branch }) => {
        if (node.const === null) {
            return {
                type: 'null',
            }
        }
        // we need to extend the set
        if (branch !== undefined && hasNullablePrimitive(branch)) {
            return {
                enum: [node.const, null],
            }
        }
        return {
            const: node.const,
        }
    },
    enum: (node, { branch }) => {
        const values = node._isNamed ? Object.values(node.enum) : node.enum
        if (branch !== undefined && hasNullablePrimitive(branch) && values.findIndex((v) => v === null) === -1) {
            return {
                enum: [...values, null],
            }
        }
        if (node.enum.length === 1) {
            return {
                const: values[0],
            }
        }
        return {
            enum: values,
        }
    },
    union: ({ _children }, context) => {
        const children = _children.map((u) => context.render(u))
        if (
            context.branch !== undefined &&
            hasNullablePrimitive(context.branch) &&
            children.find((c) => c.type === 'null') === undefined
        ) {
            return {
                anyOf: [...children, { type: 'null' }],
            }
        }
        return {
            anyOf: children,
        }
    },
    intersection: ({ _children }, context) => {
        if (context.branch !== undefined && hasNullablePrimitive(context.branch)) {
            return {
                anyOf: [
                    {
                        allOf: _children.map((u) => context.render(u)),
                    },
                    {
                        type: 'null',
                    },
                ],
            }
        }
        return {
            allOf: _children.map((u) => {
                return context.render(u)
            }),
        }
    },
    object: (obj, context): JsonAnyInstance & JsonObjectInstance & ThereforeExtension => {
        const { shape, _options: options, element: recordType, patternProperties: childPatternProperties } = obj as JSONObjectType
        const properties: NonNullable<JsonSchema['properties']> = {}
        const required: string[] = []
        for (const [name, child] of Object.entries(shape)) {
            properties[name] = context.render(child)
            const defaultIsInferred = child._definition.default !== undefined && context.ajv.useDefaults === true
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
            additionalProperties:
                isObject(additionalProperties) && Object.keys(additionalProperties).length === 0 ? true : additionalProperties,
            patternProperties,
            'x-arbitrary': options.arbitrary,
        } satisfies JsonSchema
    },
    array: ({ _options: options, element }, context): JsonArrayInstance & JsonAnyInstance & ThereforeExtension => {
        return {
            type: 'array' as const,
            items: context.render(element),
            minItems: options.minItems,
            maxItems: options.maxItems,
            uniqueItems: options.set,
            'x-arbitrary': options.arbitrary,
        }
    },
    tuple: ({ items: elements, _options: { rest } }, context): JsonArrayInstance & JsonAnyInstance => {
        return {
            type: 'array',
            items: elements.map((c) => context.render(c)),
            additionalItems: rest !== undefined ? context.render(rest) : false,
            minItems: elements.length,
        }
    },
    ref: ({ _children: [reference], _definition }, context) => {
        const { definitions, entry, references } = context

        const uuid = reference._id

        if (
            entry !== undefined &&
            (uuid === entry._id ||
                (reference._isCommutative && reference._children?.find((c) => c._id === entry._id) !== undefined))
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
        if (context.branch !== undefined && hasNullablePrimitive(context.branch)) {
            // https://github.com/OAI/OpenAPI-Specification/issues/1368
            return { anyOf: [{ $ref: `#/$defs/${symbolName}` }, { type: 'null' }] }
        }
        return { $ref: `#/$defs/${symbolName}` }
    },
    default: (node, context) => {
        const child = node._children?.[0]
        if (node._isCommutative && child !== undefined) {
            return context.render(child)
        }
        console.error(node)
        throw new Error('should not be called')
    },
}

export function convertRequiresToImports(code: string): string {
    const requireRegex = /const\s+(\w+)\s+=\s+require\(["']([^"']+)["']\)(\.\w+|\["[\w-]+"\])/g
    const importsMap: Map<string, Set<string>> = new Map()
    const assignments: { fullMatch: string; variable: string; module: string; property: string; originalProperty: string }[] = []
    let match: RegExpExecArray | null

    // biome-ignore lint/suspicious/noAssignInExpressions: this code is from hell anyway
    while ((match = requireRegex.exec(code)) !== null) {
        const [fullMatch, variable, module, property] = match
        const originalProperty = property

        if (module === undefined || property === undefined || variable === undefined || originalProperty === undefined) {
            continue
        }

        if (!importsMap.has(module)) {
            importsMap.set(module, new Set())
        }

        const alias = camelcase(module.replace(/[^a-zA-Z0-9]/g, '_'))
        const cleanedProperty = property.replace(/[\.\[\]"]/g, '')
        importsMap.get(module)?.add(`${cleanedProperty} as ${camelcase(`${alias}_${cleanedProperty}`)}`)
        assignments.push({ fullMatch, variable, module, property: cleanedProperty, originalProperty })
    }

    const imports: string[] = []
    for (const [module, variables] of importsMap.entries()) {
        const variableList = Array.from(variables).join(', ')
        imports.push(`import { ${variableList} } from '${module}.js';`)
    }

    let transformedCode = code
    for (const { fullMatch, variable, module, property } of assignments) {
        const alias = camelcase(module.replace(/[^a-zA-Z0-9]/g, '_'))
        const replacement = camelcase(`${alias}_${property}`)
        transformedCode = transformedCode.replace(fullMatch, `const ${variable} = ${replacement}`)
    }

    const importsCode = `${imports.join('\n')}\n`
    transformedCode = importsCode + transformedCode

    return transformedCode
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
        const ajv = new Ajv(context.ajv)
        if (context.formats.size > 0 && formats) {
            addFormats.default(ajv, { formats: [...context.formats] as FormatName[] })
        }

        const validator = ajv.compile(definition as Schema)
        let code = standaloneCode.default(ajv, validator)
        code = `${code};validate.schema=schema11;`
        if (code.includes('require(')) {
            code = convertRequiresToImports(code)
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
