import { entriesOf, isAlphaNumeric, isDefined, keysOf, mapValues, valuesOf } from '@skyleague/axioms'
import camelcase from 'camelcase'
import { TypescriptReferences } from '../../../commands/generate/output/references.js'
import { setDefaultNames } from '../../../commands/generate/output/typescript.js'
import { constants } from '../../constants.js'
import type { ThereforeNodeDefinition } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import type { ConstType } from '../../primitives/const/const.js'
import type { EnumType, _KeyOfType } from '../../primitives/enum/enum.js'
import type { JSONObjectType } from '../../primitives/jsonschema/jsonschema.js'
import { NullableType } from '../../primitives/nullable/nullable.js'
import type { _ExtendType, _MergeType, _OmitType, _PickType } from '../../primitives/object/object.js'
import { OptionalType } from '../../primitives/optional/optional.js'
import type { RecordType } from '../../primitives/record/record.js'
import { $ref } from '../../primitives/ref/ref.js'
import { createWriter } from '../../writer.js'
import type { DefinedTypescriptOutput } from './cst.js'
import { JSDoc } from './jsdoc.js'
import { stringLiteral, toLiteral } from './literal.js'
import type { TypescriptZodWalkerContext } from './typescript-zod.js'

export interface TypescriptTypeWalkerContext {
    targetPath: string
    symbol?: Node | undefined
    references: TypescriptReferences
    locals: [
        Node,
        (
            | ((
                  output:
                      | DefinedTypescriptOutput<TypescriptTypeWalkerContext>
                      | DefinedTypescriptOutput<TypescriptZodWalkerContext>,
              ) => boolean)
            | undefined
        ),
    ][]
    exportKeyword: string | undefined
    property: string | undefined
    render: (node: Node, ctx?: Partial<TypescriptTypeWalkerContext>) => string
    declare: (declType: 'interface' | 'type' | 'const' | 'class', node: Node) => string

    type: (node: Node) => string
    value: (node: Node) => string
}

export function buildTypescriptTypeContext({
    targetPath,
    symbol,
    references = new TypescriptReferences(),
    locals = [],
    exportSymbol,
}: {
    targetPath: string
    symbol?: Node | undefined
    references?: TypescriptReferences | undefined
    locals?:
        | [
              Node,
              (
                  | ((
                        output:
                            | DefinedTypescriptOutput<TypescriptTypeWalkerContext>
                            | DefinedTypescriptOutput<TypescriptZodWalkerContext>,
                    ) => boolean)
                  | undefined
              ),
          ][]
        | undefined
    exportSymbol: boolean
}): TypescriptTypeWalkerContext {
    const context: TypescriptTypeWalkerContext = {
        targetPath,
        symbol,
        references,
        locals,
        exportKeyword: exportSymbol ? 'export ' : '',
        property: undefined,
        render: (node, ctx: Partial<TypescriptTypeWalkerContext> = {}) =>
            walkTherefore(node, typescriptTypeVisitor, { ...context, ...ctx }),
        declare: (declType: 'interface' | 'type' | 'const' | 'class', node) =>
            asTypeDeclaration(declType, node, { exportSymbol, references }),
        type: (node) => references.type(node),
        value: (node) => references.value(node),
    } satisfies TypescriptTypeWalkerContext
    return context
}

export function escapeProperty(prop: string): string {
    if (isAlphaNumeric(prop, '_') && !/^[0-9]+/.test(prop)) {
        return prop
    }
    return stringLiteral(prop)
}

export function optional(node: Node): string {
    return hasOptionalPrimitive(node) ? '?' : ''
}

export function readonly(meta: ThereforeNodeDefinition): string {
    return meta.readonly === true ? 'readonly ' : ''
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

// @todo a bit more heuristic here
const isSmall = (t: Node) => {
    if (t._type === 'enum' && (t as EnumType).enum.length > 4) {
        return false
    }
    if (t._children === undefined) {
        return true
    }
    if (t._type === 'object' && t._children.length < 3) {
        return true
    }
    if (t._type === 'union' && t._children.length < 4) {
        return true
    }
    if (t._type === 'ref') {
        return true
    }
    return false
}

export const toMaybePrimitive = (node: OptionalType | NullableType, context: TypescriptTypeWalkerContext) => {
    let field: Node = node
    while (field instanceof OptionalType || field instanceof NullableType) {
        field = field.unwrap()
    }

    const type = context.render(field, { property: context.property })
    if (type === 'unknown') {
        return type
    }

    const hasOptional = hasOptionalPrimitive(node) && type !== 'undefined'
    const hasNullable = hasNullablePrimitive(node) && type !== 'null'
    if (hasOptional && hasNullable) {
        return `(${type} | null | undefined)`
    }
    if (hasOptional) {
        return `(${type} | undefined)`
    }
    if (hasNullable) {
        return `(${type} | null)`
    }
    return type
}

export function isReferenceable(node: Node): boolean {
    if (node._name === undefined) {
        return false
    }

    if (node._sourcePath === undefined && node._guessedTrace?.symbolName !== undefined) {
        if (node._origin.zod !== undefined) {
            return true
        }
        return false
    }
    return true
}

export const typescriptTypeVisitor: ThereforeVisitor<string, TypescriptTypeWalkerContext> = {
    optional: (node, context) => {
        return toMaybePrimitive(node, context)
    },
    nullable: (node, context) => {
        return toMaybePrimitive(node, context)
    },
    integer: () => 'number',
    number: () => 'number',
    string: () => 'string',
    boolean: () => 'boolean',
    unknown: () => 'unknown',
    const: (node) => {
        return toLiteral(node.const)
    },
    enum: (node, context) => {
        const { enum: values, _isNamed } = node
        const _keyof = node as _KeyOfType
        if (_keyof._keyof !== undefined && isReferenceable(_keyof._keyof.origin)) {
            return `keyof ${context.type(_keyof._keyof.origin)}`
        }
        return (_isNamed ? Object.values(values) : values).map((v) => toLiteral(v)).join(' | ')
    },
    union: (node, context) => {
        const { _children } = node
        return `(${_children.map((v) => context.render(v)).join(' | ')})`
    },
    intersection: (node, context) => {
        const { _children } = node
        return `(${_children.map((v) => context.render(v)).join(' & ')})`
    },
    object: (node, context) => {
        const { shape } = node
        const { element, key } = node as RecordType
        const { patternProperties } = node as JSONObjectType
        const writer = createWriter()

        const omitType = node as _OmitType
        if (omitType._omitted !== undefined) {
            const originRef = isReferenceable(omitType._omitted.origin)
                ? context.type(omitType._omitted.origin)
                : context.render(omitType._omitted.origin)

            writer.write(`Omit<${originRef}, ${omitType._omitted.mask.map((m) => `'${m}'`).join(' | ')}>`)

            return writer.toString()
        }

        const pickType = node as _PickType
        if (pickType._picked !== undefined) {
            const originRef = isReferenceable(pickType._picked.origin)
                ? context.type(pickType._picked.origin)
                : context.render(pickType._picked.origin)
            writer.write(`Pick<${originRef}, ${pickType._picked.mask.map((m) => `'${m}'`).join(' | ')}>`)

            return writer.toString()
        }

        const extendedType = node as _ExtendType
        if (extendedType._extended !== undefined) {
            const originRef = isReferenceable(extendedType._extended.origin)
                ? context.type(extendedType._extended.origin)
                : context.render(extendedType._extended.origin)

            // For dramatic type changes, we want to show the overridden types explicitly
            const originShape = extendedType._extended.origin.shape
            const extendShape = extendedType._extended.extends
            const overriddenKeys = new Set(Object.keys(extendShape).filter((key) => key in originShape))

            // If no keys are being overridden, just use a simple intersection
            if (overriddenKeys.size === 0) {
                writer
                    .write(`(${originRef} & `)
                    .inlineBlock(() => {
                        for (const [name, property] of Object.entries(extendShape)) {
                            const { _definition, _output } = property
                            if (_output?.find((t) => t.type === 'typescript')?.content !== false) {
                                const child = context.render(property, { property: name })
                                const jsdoc = JSDoc.fromNode(property)
                                writer.writeLine(
                                    `${jsdoc ?? ''}${readonly(_definition)}${escapeProperty(name)}${optional(property)}: ${child}`,
                                )
                            }
                        }
                    })
                    .write(')')
            } else {
                writer
                    .write(`(Omit<${originRef}, ${[...overriddenKeys].map((k) => `'${k}'`).join(' | ')}> & `)
                    .inlineBlock(() => {
                        for (const [name, property] of Object.entries(extendShape)) {
                            const { _definition, _output } = property
                            if (_output?.find((t) => t.type === 'typescript')?.content !== false) {
                                const child = context.render(property, { property: name })
                                const jsdoc = JSDoc.fromNode(property)
                                const originalType =
                                    constants.debug && originShape[name] ? ` /* was ${context.render(originShape[name])} */` : ''
                                writer.writeLine(
                                    `${jsdoc ?? ''}${readonly(_definition)}${escapeProperty(name)}${optional(property)}: ${child}${originalType}`,
                                )
                            }
                        }
                    })
                    .write(')')
            }

            return writer.toString()
        }

        const mergedType = node as _MergeType
        if (mergedType._merged !== undefined) {
            const originRef = isReferenceable(mergedType._merged.origin)
                ? context.type(mergedType._merged.origin)
                : context.render(mergedType._merged.origin)

            const mergedRef = isReferenceable(mergedType._merged.merged)
                ? context.type(mergedType._merged.merged)
                : context.render(mergedType._merged.merged)

            // For dramatic type changes in merge, we want to show the overridden types explicitly
            const originShape = mergedType._merged.origin.shape
            const mergedShape = mergedType._merged.merged.shape
            const overriddenKeys = new Set(
                Object.keys(mergedShape)
                    .filter((key) => key in originShape)
                    .filter((key) => {
                        const original = originShape[key]
                        const narrowed = mergedShape[key]
                        if (original === undefined || narrowed === undefined) {
                            return true
                        }
                        // Skip keys where the new type is a narrowing of the original
                        if (original._type === 'string') {
                            if (narrowed._type === 'const' && typeof (narrowed as ConstType).const === 'string') {
                                return false
                            }
                            if (
                                narrowed._type === 'enum' &&
                                (narrowed as EnumType).enum.every((v: unknown) => typeof v === 'string')
                            ) {
                                return false
                            }
                            if (
                                narrowed._type === 'union' &&
                                narrowed._children?.every(
                                    (child) => child._type === 'const' && 'const' in child && typeof child.const === 'string',
                                )
                            ) {
                                return false
                            }
                        }
                        return true
                    }),
            )

            // If no keys are being overridden or narrowed, just use a simple intersection
            if (overriddenKeys.size === 0) {
                writer.write(`(${originRef} & ${mergedRef})`)
            } else {
                writer.write(`(Omit<${originRef}, ${[...overriddenKeys].map((k) => `'${k}'`).join(' | ')}> & ${mergedRef})`)
            }

            return writer.toString()
        }

        writer.inlineBlock(() => {
            for (const [name, property] of Object.entries(shape)) {
                const { _definition, _output } = property
                if (_output?.find((t) => t.type === 'typescript')?.content !== false) {
                    const child = context.render(property, { property: name })
                    const jsdoc = JSDoc.fromNode(property)
                    writer.writeLine(
                        `${jsdoc ?? ''}${readonly(_definition)}${escapeProperty(name)}${optional(property)}: ${child}`,
                    )
                }
            }
            const indices: [string, string][] = []
            const commonIndex = key !== undefined ? `[k in ${context.render(key)}]` : '[k: string]'
            if (element !== undefined) {
                indices.push([commonIndex, context.render(new OptionalType(element))])
            }
            if (patternProperties !== undefined) {
                for (const [pattern, patternNode] of Object.entries(patternProperties)) {
                    const mappedType = getIndexSignatureType(pattern)
                    if ('type' in mappedType) {
                        indices.push([`[k: ${mappedType.type}]`, context.render(patternNode)])
                    } else {
                        for (const name of mappedType.names) {
                            indices.push([name, context.render(patternNode)])
                        }
                    }
                }
            }
            if (indices.length > 0) {
                const grouped = mapValues(
                    Object.groupBy(indices, ([key]) => key),
                    (values): string[] | undefined => values?.map(([, v]) => v),
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
    array: (node, context) => {
        let localReference: string | undefined = undefined
        const element = node.element
        if (!isSmall(element) && element._origin.zod === undefined) {
            if (element._name === undefined) {
                const symbolName = camelcase([context.property, node._type].filter(isDefined).join('_'))
                const symbolRef = context.symbol !== undefined ? context.type(context.symbol) : ''

                element._name = symbolName
                element._transform ??= {}
                element._transform['type:source'] = (name) => `${symbolRef}${name}`

                setDefaultNames(element)
            }
            const local = $ref(element)
            localReference = context.render(local, context)
        }

        const itemsTs = localReference ?? context.render(element)
        const { minItems, maxItems } = node._options
        if (minItems !== undefined && minItems > 0 && maxItems === undefined) {
            return `[${`${itemsTs}, `.repeat(minItems)}...(${itemsTs})[]]`
        }
        if (minItems !== undefined && minItems > 0 && maxItems !== undefined && maxItems >= minItems) {
            return ` [${`${itemsTs}, `.repeat(minItems)}${`(${itemsTs})?, `.repeat(maxItems - minItems)}]`
        }
        if (maxItems !== undefined && maxItems >= 0) {
            return ` [${`(${itemsTs})?, `.repeat(maxItems)}]`
        }
        return `(${itemsTs})[]`
    },
    tuple: (node, context) => {
        const {
            items: elements,
            _options: { rest },
        } = node
        const restString = rest !== undefined ? [`...${context.render(rest)}`] : []
        return `[${[...elements.map((c) => context.render(c)), ...restString].join(', ')}]`
    },
    ref: (node, { type, locals }) => {
        const {
            _children: [ref],
        } = node

        // this type was not exported on its own, which means we'll have to hoist it in
        if ((ref._sourcePath === undefined && locals.find(([l]) => l._id === ref._id)) === undefined) {
            locals.push([ref, (out) => out.subtype === 'ajv'])
        }
        return type(ref)
    },
    default: (node, context): string => {
        const child = node._children?.[0]
        if (node._isCommutative && child !== undefined) {
            return context.render(child)
        }
        console.error(node)
        throw new Error('should not be called')
    },
}

export function asTypeDeclaration(
    declType: 'interface' | 'type' | 'const' | 'class',
    obj: Node,
    { exportSymbol, references }: { exportSymbol: boolean; references: TypescriptReferences },
) {
    const exportString = exportSymbol ? 'export ' : ''
    const writer = createWriter()
    writer
        .write(JSDoc.fromNode(obj) ?? '')
        .write(exportString)
        .write(declType)
        .write(' ')
        .write(references.typeName(obj))

    return writer.toString()
}
