import { JSDoc } from './jsdoc.js'
import { stringLiteral, toLiteral } from './literal.js'

import type { ThereforeNodeDefinition } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { References } from '../../output/references.js'
import { setDefaultNames } from '../../output/typescript.js'
import type { EnumType } from '../../primitives/enum/enum.js'
import { $ref } from '../../primitives/ref/ref.js'
import { createWriter } from '../../writer.js'

import { entriesOf, isAlphaNumeric, isDefined, keysOf, mapValues, valuesOf } from '@skyleague/axioms'
import camelcase from 'camelcase'
import type { JSONObjectType } from '../../primitives/jsonschema/jsonschema.js'
import { NullableType } from '../../primitives/nullable/nullable.js'
import { OptionalType } from '../../primitives/optional/optional.js'
import type { RecordType } from '../../primitives/record/record.js'

export interface TypescriptWalkerContext {
    symbol?: Node | undefined
    references: References<'typescript'>
    locals: Node[]
    exportKeyword: string | undefined
    property: string | undefined
    render: (node: Node, ctx?: Partial<TypescriptWalkerContext>) => string
    declare: (declType: string, node: Node) => string
    reference: (node: Node) => string
    value: (node: Node) => string
}

export function buildContext({
    symbol,
    references = new References('typescript'),
    locals = [],
    exportSymbol,
}: {
    symbol?: Node
    references?: References<'typescript'>
    locals?: Node[]
    exportSymbol: boolean
}): TypescriptWalkerContext {
    const context: TypescriptWalkerContext = {
        symbol,
        references,
        locals,
        exportKeyword: exportSymbol ? 'export ' : '',
        property: undefined,
        render: (node, ctx: Partial<TypescriptWalkerContext> = {}) =>
            walkTherefore(node, typescriptVisitor, { ...context, ...ctx }),
        declare: (declType: string, node) => asDeclaration(declType, node, { exportSymbol, references }),
        reference: (node) => references.reference(node, 'referenceName'),
        value: (node) => references.reference(node, 'referenceName', { tag: 'value' }),
    } satisfies TypescriptWalkerContext
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

export const toMaybePrimitive = (node: OptionalType | NullableType, context: TypescriptWalkerContext) => {
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

export const typescriptVisitor: ThereforeVisitor<string, TypescriptWalkerContext> = {
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
    enum: (node) => {
        const { enum: values, _isNamed } = node
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
        const { element } = node as RecordType
        const { patternProperties } = node as JSONObjectType
        const writer = createWriter()
        writer.block(() => {
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
            const commonIndex = '[k: string]'
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
        if (!isSmall(element)) {
            if (element._name === undefined) {
                const symbolName = camelcase([context.property, node._type].filter(isDefined).join('_'))
                const symbolRef = context.symbol !== undefined ? context.references.reference(context.symbol, 'symbolName') : ''
                element._name = symbolName
                element._transform ??= {}
                element._transform.symbolName = (name) => `${symbolRef}${name}`

                setDefaultNames(element)
            }
            const local = $ref(element)
            localReference = context.render(local, context)
        }

        const itemsTs = localReference ?? context.render(element)
        const { minItems, maxItems } = node._options
        if (minItems !== undefined && minItems > 0 && maxItems === undefined) {
            return `[${`${itemsTs}, `.repeat(minItems)} ...(${itemsTs})[]]`
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
    ref: (node, { reference, locals }) => {
        const {
            _children: [ref],
        } = node

        // this reference was not exported on its own, which means we'll have to hoist it in
        if ((ref._sourcePath === undefined && locals.find((l) => l._id === ref._id)) === undefined) {
            locals.push(ref)
        }
        return reference(ref)
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

export interface TypescriptSubtree {
    node: Node
    fileSuffix?: string
    filePath?: string
}

export function asDeclaration(
    declType: string,
    obj: Node,
    { exportSymbol, references }: { exportSymbol: boolean; references: References<'typescript'> },
) {
    const exportString = exportSymbol ? 'export ' : ''
    const writer = createWriter()
    writer
        .write(JSDoc.fromNode(obj) ?? '')
        .write(exportString)
        .write(declType)
        .write(' ')
        .write(references.reference(obj, 'symbolName'))

    return writer.toString()
}
