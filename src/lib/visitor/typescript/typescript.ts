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

import { entriesOf, groupBy, isAlphaNumeric, isDefined, keysOf, mapValues, second, valuesOf } from '@skyleague/axioms'
import camelcase from 'camelcase'

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

export const toPrimitive = (node: Node, type: string) => {
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

// @todo a bit more heuristic here
const isSmall = (t: Node) => {
    if (t.type === 'enum' && (t as EnumType).values.length > 4) {
        return false
    }
    if (t.children === undefined) {
        return true
    }
    if (t.type === 'object' && t.children.length < 3) {
        return true
    }
    if (t.type === 'union' && t.children.length < 4) {
        return true
    }
    if (t.type === 'ref') {
        return true
    }
    return false
}
export const typescriptVisitor: ThereforeVisitor<string, TypescriptWalkerContext> = {
    integer: (node) => toPrimitive(node, 'number'),
    number: (node) => toPrimitive(node, 'number'),
    string: (node) => toPrimitive(node, 'string'),
    boolean: (node) => toPrimitive(node, 'boolean'),
    unknown: () => 'unknown',
    const: (node) => {
        return toPrimitive(node, toLiteral(node.const))
    },
    enum: (node) => {
        const { values, isNamed } = node
        return toPrimitive(node, (isNamed ? values.map(second) : values).map((v) => toLiteral(v)).join(' | '))
    },
    union: (node, context) => {
        const { children } = node
        return toPrimitive(node, `(${children.map((v) => context.render(v)).join(' | ')})`)
    },
    intersection: (node, context) => {
        const { children } = node
        return toPrimitive(node, `(${children.map((v) => context.render(v)).join(' & ')})`)
    },
    object: (node, context) => {
        const { shape, patternProperties, recordType } = node
        const writer = createWriter()
        writer.block(() => {
            for (const [name, property] of Object.entries(shape)) {
                const { definition, output } = property
                if (output?.find((t) => t.type === 'typescript')?.content !== false) {
                    const child = context.render(property, { property: name })
                    const jsdoc = JSDoc.from(property)
                    writer.writeLine(
                        `${jsdoc ?? ''}${readonly(definition)}${escapeProperty(name)}${optional(property)}: ${child}`,
                    )
                }
            }
            const indices: [string, string][] = []
            const commonIndex = '[k: string]'
            if (recordType !== undefined) {
                indices.push([commonIndex, context.render(recordType.optional())])
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
                    groupBy(indices, ([key]) => key),
                    (values): string[] | undefined => values.map(([, v]) => v),
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
        return toPrimitive(node, writer.toString())
    },
    array: (node, context) => {
        let localReference: string | undefined = undefined
        const element = node.element
        if (!isSmall(element)) {
            const symbolName = camelcase([context.property, node.type].filter(isDefined).join('_'))
            element.name = symbolName
            element.transform ??= {}
            element.transform.symbolName = (name) =>
                `${context.symbol !== undefined ? context.references.reference(context.symbol, 'symbolName') : ''}${name}`

            setDefaultNames(element)
            const local = $ref(element)
            localReference = context.render(local, context)
        }

        const itemsTs = localReference ?? context.render(element)
        const { minItems, maxItems } = node.options
        if (minItems !== undefined && minItems > 0 && maxItems === undefined) {
            return toPrimitive(node, `[${`${itemsTs}, `.repeat(minItems)} ...(${itemsTs})[]]`)
        }
        if (minItems !== undefined && minItems > 0 && maxItems !== undefined && maxItems >= minItems) {
            return toPrimitive(node, ` [${`${itemsTs}, `.repeat(minItems)}${`(${itemsTs})?, `.repeat(maxItems - minItems)}]`)
        }
        if (maxItems !== undefined && maxItems >= 0) {
            return toPrimitive(node, ` [${`(${itemsTs})?, `.repeat(maxItems)}]`)
        }
        return toPrimitive(node, `(${itemsTs})[]`)
    },
    tuple: (node, context) => {
        const {
            elements,
            options: { rest },
        } = node
        const restString = rest !== undefined ? [`...${context.render(rest)}`] : []
        return toPrimitive(node, `[${[...elements.map((c) => context.render(c)), ...restString].join(', ')}]`)
    },
    ref: (node, { reference, locals }) => {
        const {
            children: [ref],
        } = node

        // this reference was not exported on its own, which means we'll have to hoist it in
        if ((ref.sourcePath === undefined && locals.find((l) => l.id === ref.id)) === undefined) {
            locals.push(ref)
        }
        return toPrimitive(node, reference(ref))
    },
    default: (node, context): string => {
        const child = node.children?.[0]
        if (node.isCommutative && child !== undefined) {
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
