import { toJSDoc } from './jsdoc.js'
import { stringLiteral, toLiteral } from './literal.js'

import type { TypescriptDefinition } from '../../../commands/generate/types.js'
import { renderTemplate } from '../../../common/template/index.js'
import { defaultAjvConfig } from '../../ajv/defaults.js'
import { isNamedCstNodeArray } from '../../cst/cst.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { isNamedArray } from '../../guard.js'
import type { MetaDescription, ThereforeMeta } from '../../primitives/base.js'
import type { DictType, ObjectType, RefType, UnionType } from '../../primitives/index.js'
import { $ref } from '../../primitives/index.js'
import type { CustomType, ThereforeCst } from '../../primitives/types.js'
import { createWriter } from '../../writer.js'

import { entriesOf, evaluate, groupBy, isAlphaNumeric, keysOf, mapValues, valuesOf } from '@skyleague/axioms'
import camelCase from 'camelcase'

export interface TypescriptWalkerContext {
    symbolName: string
    references: TypescriptDefinition['references']
    locals: NonNullable<TypescriptDefinition['locals']>
    exportKeyword: string | undefined
    property: string | undefined
    sourceSymbol: string | undefined
}

export function escapeProperty(prop: string): string {
    if (isAlphaNumeric(prop, '_') && !/^[0-9]+/.test(prop)) {
        return prop
    }
    return stringLiteral(prop)
}

export function optional(meta: MetaDescription): string {
    return meta.optional !== undefined ? '?' : ''
}

export function readonly(meta: MetaDescription): string {
    return meta.readonly === true ? 'readonly ' : ''
}

export function writeThereforeSchema({
    uuid,
    schemaReference,
    validatorFile,
    description,
}: {
    uuid: string
    schemaReference: string
    validatorFile: string | undefined
    description: MetaDescription & ThereforeMeta
}): string {
    const writer = createWriter()
    const isCompiled = validatorFile !== undefined
    return writer
        .write(`export const {{${uuid}:symbolName}} = `)
        .inlineBlock(() => {
            writer.writeLine(
                isCompiled
                    ? `validate: (await import('${validatorFile}')).validate as ValidateFunction<{{${uuid}:symbolName}}>,`
                    : `validate: new AjvValidator.default(${JSON.stringify({
                          ...defaultAjvConfig,
                          ...description.ajvOptions,
                      })}).compile<{{${uuid}:symbolName}}>(${schemaReference}),`
            )

            writer.writeLine(
                isCompiled ? `get schema() { return {{${uuid}:symbolName}}.validate.schema},` : `schema: ${schemaReference},`
            )
            writer.writeLine(`get errors() { return {{${uuid}:symbolName}}.validate.errors ?? undefined },`)
            writer.writeLine(`is: (o: unknown): o is {{${uuid}:symbolName}} => {{${uuid}:symbolName}}.validate(o) === true,`)
            if (description.validator?.enabled === true && description.validator.assert) {
                writer
                    // the full assertion syntax is not yet supported on properties
                    // https://github.com/microsoft/TypeScript/issues/34523
                    // .write(`assert: (o: unknown): asserts o is {{${uuid}:symbolName}} => `)
                    .write(`assert: (o: unknown) => `)
                    .inlineBlock(() => {
                        writer.write(`if (!{{${uuid}:symbolName}}.validate(o))`).block(() => {
                            writer.writeLine(`throw new ValidationError({{${uuid}:symbolName}}.errors ?? [])`)
                        })
                    })
                    .write(',')
            }
        })
        .write(' as const\n')
        .toString()
}

interface TypeDefinition {
    declaration: string
    referenceName: string
}
export const typeDefinitionVisitor: ThereforeVisitor<TypeDefinition, TypescriptWalkerContext> = {
    object: (obj, context) => toDeclaration(obj, context),
    dict: (obj, context) => toDeclaration(obj, context),
    union: (obj, context) => toDeclaration(obj, context),
    ref: (obj, context) => toDeclaration(obj, context),
    enum: (obj, context) => {
        const { children } = obj
        if (isNamedArray(children)) {
            const exportString = context.exportKeyword ?? ''
            const writer = createWriter()
            let referenceName = `{{${obj.uuid}:symbolName}}`
            if (!children.some(([, v]) => typeof v === 'object')) {
                writer.write(`${exportString}enum {{${obj.uuid}:symbolName}} `).block(() => {
                    for (const [childName, value] of children) {
                        writer.writeLine(`${childName} = ${toLiteral(value)},`)
                    }
                })
            } else {
                writer
                    .write(`${exportString}const {{${obj.uuid}:symbolName}}Enum = `)
                    .inlineBlock(() => {
                        for (const [childName, value] of children) {
                            writer.writeLine(`${childName}: ${toLiteral(value)},`)
                        }
                    })
                    .write(' as const')
                    .writeLine(`${exportString}type {{${obj.uuid}:symbolName}} = typeof {{${obj.uuid}:symbolName}}Enum`)
                referenceName = `keyof typeof {{${obj.uuid}:symbolName}}`
            }
            const declaration = writer.writeLine('').toString()
            return {
                declaration,
                referenceName,
            }
        }
        return typeDefinitionVisitor.default(obj, context)
    },
    custom: (obj, context) => toDeclaration(obj, context),
    default: (obj, context: TypescriptWalkerContext): TypeDefinition => {
        const { symbolName, exportKeyword: exportSymbol } = context
        return {
            declaration: `${toJSDoc({ key: symbolName, meta: obj.description }) ?? ''}${exportSymbol ?? ''}type {{${
                obj.uuid
            }:symbolName}} = ${walkTherefore(obj, typescriptVisitor, context)}\n`,
            referenceName: `{{${obj.uuid}:symbolName}}`,
        }
    },
}

export function getIndexSignatureType(indexPattern: string) {
    const strPattern = indexPattern.replaceAll('\\', '')
    // check if simple regex
    const [, literal] = strPattern.match(/^\^?\(?([/a-zA-Z0-9/\-_|$@#]+?)\)?\$?$/) ?? [undefined, undefined]

    if (literal !== undefined && literal.length > 0) {
        const split = literal.split('|')
        const hasStartToken = strPattern.startsWith('^')
        const hasEndToken = strPattern.endsWith('$')
        if (hasStartToken && hasEndToken) {
            return { names: split.map((s) => `"${s}"?`) }
        }
        return {
            type: `\`${!hasStartToken ? '${string}' : ''}${split.join(' | ')}${!hasEndToken ? '${string}' : ''}\``,
        }
    }
    return { type: 'string' }
}

export const typescriptVisitor: ThereforeVisitor<string, TypescriptWalkerContext> = {
    integer: () => 'number',
    unknown: () => 'unknown',
    enum: ({ children }) => children.map((v) => toLiteral(v)).join(' | '),
    union: ({ children }, context) =>
        children.map((v) => walkTherefore<string, TypescriptWalkerContext>(v, typescriptVisitor, context)).join(' | '),
    intersection: ({ children }, context) =>
        children.map((v) => walkTherefore<string, TypescriptWalkerContext>(v, typescriptVisitor, context)).join(' & '),
    object: ({ children, value }, context) => {
        const writer = createWriter()
        writer.block(() => {
            for (const property of children) {
                const { name, description } = property
                const child = walkTherefore(property, typescriptVisitor, { ...context, property: name })
                const jsdoc = toJSDoc({ key: name, meta: description })
                const nestedChild = description.nullable ? `(${child} | null)` : child
                writer.writeLine(
                    `${jsdoc ?? ''}${readonly(description)}${escapeProperty(name)}${optional(description)}: ${
                        description.optional === 'explicit' ? `(${nestedChild} | undefined)` : nestedChild
                    }`
                )
            }
            const indices: [string, string][] = []
            const indexSignature = value.indexSignature
            const commonIndex = `[k: string]`
            if (indexSignature !== undefined) {
                // writer.writeLine(`[k: string]: ${walkCst(indexSignature, typescriptVisitor, context)}`)
                indices.push([commonIndex, walkTherefore(indexSignature, typescriptVisitor, context)])
            }
            const indexPatterns = value.indexPatterns
            if (indexPatterns !== undefined) {
                for (const [pattern, node] of Object.entries(indexPatterns)) {
                    // writer.writeLine(`[k: ${getIndexSignatureType(pattern)}]: ${walkCst(node, typescriptVisitor, context)}`)
                    const mappedType = getIndexSignatureType(pattern)
                    if ('type' in mappedType) {
                        indices.push([`[k: ${mappedType.type}]`, walkTherefore(node, typescriptVisitor, context)])
                    } else {
                        for (const name of mappedType.names) {
                            indices.push([name, walkTherefore(node, typescriptVisitor, context)])
                        }
                    }
                }
            }
            if (indices.length > 0) {
                const grouped = mapValues(
                    groupBy(indices, ([key]) => key),
                    (values): string[] | undefined => values.map(([, v]) => v)
                )
                const common = grouped[commonIndex]
                if (keysOf(grouped).length > 1 && common !== undefined) {
                    writer.writeLine(`${commonIndex}: ${[...valuesOf(grouped)].join(' | ')}`)
                    for (const [index, values] of entriesOf(grouped)) {
                        if (values !== undefined && index !== commonIndex) {
                            writer.writeLine(`${index}: ${values.join(' | ')}`)
                        }
                    }
                } else {
                    for (const [index, values] of entriesOf(grouped)) {
                        if (values !== undefined) {
                            writer.writeLine(`${index}: ${values.join(' | ')}`)
                        }
                    }
                }
            }
        })
        return writer.toString()
    },
    array: (obj, context) => {
        // @todo a bit more heuristic here
        const isSmall = (t: ThereforeCst) =>
            (t.type !== 'object' || t.children.length < 3) &&
            (t.type !== 'union' || t.children.length < 4) &&
            ((t.type === 'enum' && t.children.length < 4) || t.type !== 'enum')

        let localReference: string | undefined = undefined
        const [items] = obj.children as [ThereforeCst]
        if (!isSmall(items)) {
            const { locals } = context
            if (locals[items.uuid] === undefined) {
                const sourceSymbol = `${context.symbolName}${
                    context.property !== undefined
                        ? camelCase(context.property, {
                              pascalCase: true,
                              preserveConsecutiveUppercase: true,
                          })
                        : ''
                }${camelCase(obj.type, { pascalCase: true, preserveConsecutiveUppercase: true })}`
                const { definition: local } = toTypescriptDefinition({
                    sourceSymbol,
                    schema: items,
                    exportSymbol: false,
                    locals,
                })
                locals[local.uuid] = local
            }
            localReference = walkTherefore(
                $ref(context.property !== undefined ? [context.property, items] : items),
                typescriptVisitor,
                context
            )
        }

        const itemsTs = localReference ?? walkTherefore<string, TypescriptWalkerContext>(items, typescriptVisitor, context)
        const { minItems, maxItems } = obj.value
        if (minItems !== undefined && minItems > 0 && maxItems === undefined) {
            return `[${`${itemsTs}, `.repeat(minItems)} ...(${itemsTs})[]]`
        } else if (minItems !== undefined && minItems > 0 && maxItems !== undefined && maxItems >= minItems) {
            return ` [${`${itemsTs}, `.repeat(minItems)}${`(${itemsTs})?, `.repeat(maxItems - minItems)}]`
        } else if (maxItems !== undefined && maxItems >= 0) {
            return ` [${`(${itemsTs})?, `.repeat(maxItems)}]`
        }
        return `(${itemsTs})[]`
    },
    tuple: ({ children }, context) => {
        // for named tuples
        if (isNamedCstNodeArray(children)) {
            return `[${children
                .map((c) => [c, walkTherefore(c, typescriptVisitor, context)] as const)
                .map(([child, ts]) => `${child.name}${optional(child.description)}: ${ts}`)
                .join(', ')}]`
        }
        return `[${children.map((c) => walkTherefore(c, typescriptVisitor, context)).join(', ')}]`
    },
    dict: ({ children }, context) => {
        const [items] = children
        const writer = createWriter()
        writer.inlineBlock(() => {
            writer.writeLine(`[k: string]: ( ${walkTherefore(items, typescriptVisitor, context)} ) | undefined`)
        })

        return writer.toString()
    },
    ref: ({ children: unevaluatedReference, value }, { references }) => {
        const reference = evaluate(unevaluatedReference[0])

        const uuid = reference.uuid
        if (references.find((d) => d.uuid === uuid) === undefined) {
            const referenceName =
                reference.name !== undefined
                    ? camelCase(reference.name, { pascalCase: true, preserveConsecutiveUppercase: true })
                    : `{{${uuid}:referenceName}}`

            references.push({
                reference: [reference],
                name: reference.name,
                referenceName,
                uuid: uuid,
                exportSymbol: value.exportSymbol === true,
            })
        }
        return `{{${uuid}:referenceName}}`
    },
    custom: (obj, _context): string => obj.value.typescript?.declaration ?? '',
    default: (obj, _context): string => obj.type,
}

export interface TypescriptSubtree {
    node: ThereforeCst
    fileSuffix?: string
    filePath?: string
}

export function sanitizeTypescriptTypeName(symbol: string): string {
    return symbol.replace(/[^a-zA-Z0-9]/g, ' ')
}

export function toTypescriptDefinition({
    sourceSymbol,
    symbolName,
    schema,
    fileHash = '',
    exportSymbol = true,
    locals = {},
}: {
    sourceSymbol: string
    symbolName?: string
    schema: ThereforeCst & { uuid: string }
    fileHash?: string
    exportSymbol?: boolean
    locals?: TypescriptDefinition['locals']
}): { definition: TypescriptDefinition; subtrees: TypescriptSubtree[] } {
    // allow propagation and deduplication
    locals ??= {}
    const references: TypescriptDefinition['references'] = []

    const readableSymbolName = camelCase(sanitizeTypescriptTypeName(symbolName ?? sourceSymbol), {
        pascalCase: true,
        preserveConsecutiveUppercase: true,
    })

    const context = {
        symbolName: readableSymbolName,
        references,
        locals,
        exportKeyword: exportSymbol ? 'export ' : '',
        sourceSymbol,
        property: undefined,
    }
    const declaration = walkTherefore(schema, typeDefinitionVisitor, context)

    let allSubtrees: TypescriptSubtree[] = []
    let imports: string[] = []
    if (schema.type === 'custom') {
        imports = schema.value.typescript?.imports ?? []
        allSubtrees = schema.children.map((c) => ({
            node: c,
        }))
        // make the references transitive
        for (const child of schema.children) {
            walkTherefore($ref(child, { validator: child.description.validator }), typescriptVisitor, context)
        }
    } else if (schema.description.validator?.enabled === true) {
        if (schema.description.validator.assert) {
            imports.push(`import { ValidationError } from 'ajv'`)
        }
        if (schema.description.validator.compile === false) {
            imports.push(`import AjvValidator from 'ajv'`)
        } else {
            imports.push(`import type { ValidateFunction } from 'ajv'`)
        }
    }

    const groupedTrees = groupBy(allSubtrees, (node) => node.node.uuid)

    const subtrees = valuesOf(groupedTrees).map((xs) => {
        let prev = xs[0]!
        for (const x of xs.slice(1)) {
            if (x.node.description.validator?.enabled) {
                const { assert = false, compile = true } = prev.node.description.validator ?? {}
                prev.node.description.validator = {
                    enabled: true,
                    assert: assert || x.node.description.validator.enabled,
                    compile: (compile || x.node.description.validator.compile) ?? true,
                }
            }
            prev = x
        }
        return xs[0]!
    })

    return {
        definition: {
            imports,
            references,
            sourceSymbol,
            symbolName: readableSymbolName,
            uuid: schema.uuid,
            declaration: declaration.declaration,
            referenceName: declaration.referenceName,
            uniqueSymbolName: `{{${schema.uuid}:symbolName}}${fileHash}`,
            isExported: exportSymbol,
            schema: () => schema,
            locals,
        },
        subtrees,
    }
}

export interface DeclarationOutput {
    declaration: string
    referenceName: string
    sourceSymbol: string | undefined
    render: () => string
}

export function decltype(obj: CustomType | DictType | ObjectType | RefType | UnionType) {
    if (obj.type === 'dict' || obj.type === 'object') {
        return { declType: 'interface' }
    }
    if (obj.type === 'custom') {
        const { declType, operator } = obj.value.typescript ?? {}
        return { declType, operator }
    }
    return { declType: 'type', operator: '= ' }
}

export function toDeclaration(
    obj: CustomType | DictType | ObjectType | RefType | UnionType,
    context: TypescriptWalkerContext
): DeclarationOutput {
    const { symbolName, exportKeyword, sourceSymbol } = context
    const exportString = exportKeyword ?? ''
    const { declType = '', operator = '' } = decltype(obj)
    const declaration = `${toJSDoc({ key: symbolName, meta: obj.description }) ?? ''}${exportString}${declType} {{${
        obj.uuid
    }:symbolName}} ${operator}${walkTherefore(obj, typescriptVisitor, context)}\n`
    return {
        declaration,
        referenceName: `{{${obj.uuid}:symbolName}}`,
        sourceSymbol,
        render: () =>
            renderTemplate(declaration, {
                [`${obj.uuid}:symbolName`]: symbolName,
            }),
    }
}
