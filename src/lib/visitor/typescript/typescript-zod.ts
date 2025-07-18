import { References } from '../../../commands/generate/output/references.js'
import { zodSymbols } from '../../cst/module.js'
import type { Node } from '../../cst/node.js'
import { type ThereforeVisitor, walkTherefore } from '../../cst/visitor.js'
import type { _ExtendType, _OmitType, _PickType } from '../../primitives/object/object.js'
import type { RecordType } from '../../primitives/record/record.js'
import { createWriter } from '../../writer.js'
import type { DefinedTypescriptOutput } from './cst.js'
import { stringLiteral, toLiteral } from './literal.js'
import { buildTypescriptTypeContext, escapeProperty } from './typescript-type.js'

export interface TypescriptZodWalkerContext {
    symbol?: Node | undefined
    references: References<'typescript'>
    locals: [Node, ((output: DefinedTypescriptOutput) => boolean) | undefined][]
    exportKeyword: string | undefined
    property: string | undefined
    render: (node: Node, ctx?: Partial<TypescriptZodWalkerContext>, options?: { allowToZod: boolean }) => string
    declare: (declType: string, node: Node) => string
    reference: (node: Node) => string
    transform: (node: Node, schema: string) => string
    value: (node: Node) => string
}

export function buildTypescriptZodContext({
    symbol,
    references = new References('typescript'),
    locals = [],
    exportSymbol,
}: {
    symbol?: Node | undefined
    references?: References<'typescript'> | undefined
    locals?: [Node, ((output: DefinedTypescriptOutput) => boolean) | undefined][] | undefined
    exportSymbol: boolean
}): TypescriptZodWalkerContext {
    const context: TypescriptZodWalkerContext = {
        symbol,
        references,
        locals,
        exportKeyword: exportSymbol ? 'export ' : '',
        property: undefined,
        transform: (node: Node, schema: string) => {
            const writer = createWriter()
            writer.write(schema)

            if (node._definition.description !== undefined) {
                writer.write(
                    `.describe(${stringLiteral(node._definition.description.replaceAll('\n', '\\n'), { allowBacktick: true })})`,
                )
            }
            if (node._definition.default !== undefined) {
                writer.write(`.default(${toLiteral(node._definition.default)})`)
            }

            return writer.toString()
        },
        render: (node, ctx: Partial<TypescriptZodWalkerContext> = {}, { allowToZod = false }: { allowToZod?: boolean } = {}) => {
            if (node._toZod !== undefined && allowToZod && node._type === 'object') {
                return context.render(node._toZod)
            }
            return walkTherefore(node, typescriptZodVisitor, { ...context, ...ctx })
        },
        declare: (declType: string, node) => asZodDeclaration(declType, node, { exportSymbol, references }),
        reference: (node) => references.reference(node._toZod ?? node, 'referenceName'),
        value: (node) => references.reference(node._toZod ?? node, 'referenceName', { tag: 'value' }),
    }
    return context
}

export function buildTypescriptZodTypeContext({
    symbol,
    exportSymbol,
    references,
    locals,
}: {
    symbol: Node
    exportSymbol: boolean
    references: References<'typescript'>
    locals: [Node, ((output: DefinedTypescriptOutput) => boolean) | undefined][]
}) {
    const context = buildTypescriptTypeContext({
        symbol,
        exportSymbol,
        references,
        locals,
    })
    const originalReference = context.reference
    context.reference = (node) => {
        if (node._attributes.validatorType?._options.type === 'zod' && node._attributes.validatorType._options.types) {
            return originalReference(node)
        }
        return `${originalReference(zodSymbols.z())}.infer<typeof ${originalReference(node)}>`
    }
    return context
}

export const typescriptZodVisitor: ThereforeVisitor<string, TypescriptZodWalkerContext> = {
    optional: (node, context) => {
        return `${context.render(node.unwrap())}.optional()`
    },
    nullable: (node, context) => {
        return `${context.render(node.unwrap())}.nullable()`
    },

    integer: (node, context) => {
        const { _options: options } = node
        const writer = createWriter()
        writer.write(`${context.value(zodSymbols.z())}.number().int()`)

        // Check for semantic number constraints
        if (options.min === 0) {
            if (options.minInclusive === true || options.minInclusive === undefined) {
                writer.write('.nonnegative()')
            } else {
                writer.write('.positive()')
            }
        } else if (options.max === 0) {
            if (options.maxInclusive === true || options.maxInclusive === undefined) {
                writer.write('.nonpositive()')
            } else {
                writer.write('.negative()')
            }
        } else {
            // Fall back to regular min/max constraints
            if (options.min !== undefined) {
                if (options.minInclusive === false) {
                    writer.write(`.gt(${options.min})`)
                } else {
                    writer.write(`.gte(${options.min})`)
                }
            }
            if (options.max !== undefined) {
                if (options.maxInclusive === false) {
                    writer.write(`.lt(${options.max})`)
                } else {
                    writer.write(`.lte(${options.max})`)
                }
            }
        }

        if (options.multipleOf !== undefined) {
            writer.write(`.multipleOf(${options.multipleOf})`)
        }
        return writer.toString()
    },
    number: (node, context) => {
        const { _options: options } = node
        const writer = createWriter()
        writer.write(`${context.value(zodSymbols.z())}.number()`)

        // Check for semantic number constraints
        if (options.min === 0) {
            if (options.minInclusive === true || options.minInclusive === undefined) {
                writer.write('.nonnegative()')
            } else {
                writer.write('.positive()')
            }
        } else if (options.max === 0) {
            if (options.maxInclusive === true || options.maxInclusive === undefined) {
                writer.write('.nonpositive()')
            } else {
                writer.write('.negative()')
            }
        } else {
            // Fall back to regular min/max constraints
            if (options.min !== undefined) {
                if (options.minInclusive === false) {
                    writer.write(`.gt(${options.min})`)
                } else {
                    writer.write(`.gte(${options.min})`)
                }
            }
            if (options.max !== undefined) {
                if (options.maxInclusive === false) {
                    writer.write(`.lt(${options.max})`)
                } else {
                    writer.write(`.lte(${options.max})`)
                }
            }
        }

        if (options.multipleOf !== undefined) {
            writer.write(`.multipleOf(${options.multipleOf})`)
        }
        return writer.toString()
    },

    string: (node, context) => {
        const { _options: options } = node
        const writer = createWriter()
        writer.write(`${context.value(zodSymbols.z())}.string()`)

        if (options.maxLength !== undefined && options.maxLength === options.minLength) {
            writer.write(`.length(${options.maxLength})`)
        } else {
            if (options.minLength === 1) {
                writer.write('.nonempty()')
            } else if (options.minLength !== undefined) {
                writer.write(`.min(${options.minLength})`)
            }
            if (options.maxLength !== undefined) {
                writer.write(`.max(${options.maxLength})`)
            }
        }
        if (options.regex !== undefined) {
            writer.write(`.regex(/${new RegExp(options.regex).source}/)`)
        }
        if (options.format !== undefined) {
            switch (options.format) {
                case 'email':
                    writer.write('.email()')
                    break
                case 'uri':
                    writer.write('.url()')
                    break
                case 'uuid':
                    writer.write('.uuid()')
                    break
                case 'ulid':
                    writer.write('.ulid()')
                    break
                case 'date-time':
                    writer.write('.datetime({ offset: true })')
                    break
                case 'date':
                    writer.write('.date()')
                    break
                case 'time':
                    writer.write('.time()')
                    break
                case 'hostname':
                    writer.write('.hostname()')
                    break
                case 'ipv4':
                    writer.write('.ipv4({ version: "v4" })')
                    break
                case 'ipv6':
                    writer.write('.ipv6({ version: "v6" })')
                    break
                case 'base64':
                    writer.write('.base64()')
                    break
                case 'duration':
                    writer.write('.duration()')
                    break
                default: {
                    const _exhaustiveCheck: never = options.format
                    break
                }
            }
        }
        return writer.toString()
    },

    boolean: (_, context) => {
        return `${context.value(zodSymbols.z())}.boolean()`
    },

    unknown: (_, context) => {
        return `${context.value(zodSymbols.z())}.unknown()`
    },

    const: (node, context) => {
        return `${context.value(zodSymbols.z())}.literal(${toLiteral(node.const)})`
    },

    enum: (node, context) => {
        const { enum: values, _isNamed } = node
        const enumValues = _isNamed ? Object.values(values) : values
        // For non-string enums, use union of literals instead of z.enum()
        if (enumValues.length === 1) {
            return `${context.value(zodSymbols.z())}.literal(${toLiteral(enumValues[0])})`
        }
        if (enumValues.every((v) => typeof v === 'string')) {
            return `${context.value(zodSymbols.z())}.enum([${enumValues.map((v) => toLiteral(v)).join(', ')}])`
        }
        return `${context.value(zodSymbols.z())}.union([${enumValues.map((v) => `${context.value(zodSymbols.z())}.literal(${toLiteral(v)})`).join(', ')}])`
    },

    union: (node, context) => {
        const { _children } = node
        if (_children.length === 1) {
            // biome-ignore lint/style/noNonNullAssertion: we know it's a union
            return context.render(_children[0]!)
        }
        return `${context.value(zodSymbols.z())}.union([${_children.map((child) => context.render(child)).join(', ')}])`
    },

    intersection: (node, context) => {
        const { _children } = node
        if (_children.length === 2) {
            return `${context.value(zodSymbols.z())}.intersection(${_children.map((child) => context.render(child)).join(', ')})`
        }
        // biome-ignore lint/style/noNonNullAssertion: we know it's an intersection
        return `${context.render(_children[0]!)}${_children
            .slice(1)
            .map((child) => `.and(${context.render(child)})`)
            .join('')}`
    },

    object: (node, context) => {
        const { shape, _options: options } = node
        const { element } = node as RecordType
        const writer = createWriter()

        const omitType = node as _OmitType
        const pickType = node as _PickType
        const extendType = node as _ExtendType
        if (omitType._omitted !== undefined) {
            if (omitType._omitted.origin._name !== undefined) {
                writer.writeLine(
                    `${context.value(omitType._omitted.origin)}.omit({ ${omitType._omitted.mask.map((m) => `'${m}': true`).join(', ')} })`,
                )
            } else {
                writer.writeLine(
                    `${context.render(omitType._omitted.origin, undefined, { allowToZod: true })}.omit({ ${omitType._omitted.mask.map((m) => `'${m}': true`).join(', ')} })`,
                )
            }
        } else if (pickType._picked !== undefined) {
            if (pickType._picked.origin._name !== undefined) {
                writer.writeLine(
                    `${context.value(pickType._picked.origin)}.pick({ ${pickType._picked.mask.map((m) => `'${m}': true`).join(', ')} })`,
                )
            } else {
                writer.writeLine(
                    `${context.render(pickType._picked.origin, undefined, { allowToZod: true })}.pick({ ${pickType._picked.mask.map((m) => `'${m}': true`).join(', ')} })`,
                )
            }
        } else if (extendType._extended !== undefined) {
            if (extendType._extended.origin._name !== undefined) {
                writer
                    .write(`${context.value(extendType._extended.origin)}.extend(`)
                    .inlineBlock(() => {
                        for (const [key, value] of Object.entries(extendType._extended?.extends ?? {})) {
                            writer.writeLine(`${escapeProperty(key)}: ${context.render(value)},`)
                        }
                    })
                    .write(')')
            } else {
                writer
                    .write(`${context.render(extendType._extended.origin, undefined, { allowToZod: true })}.extend(`)
                    .inlineBlock(() => {
                        for (const [key, value] of Object.entries(extendType._extended?.extends ?? {})) {
                            writer.writeLine(`${escapeProperty(key)}: ${context.render(value)},`)
                        }
                    })
                    .write(')')
            }
        } else if (node._toZod !== undefined) {
            return context.render(node._toZod)
        } else if (Object.keys(shape).length === 0 && element !== undefined) {
            // If it's a pure record type with no other properties
            // Zod uses .record() for key-value mappings
            writer.write(`${context.value(zodSymbols.z())}.record(${context.render(element)}.optional())`)
        } else {
            writer
                .write(`${context.value(zodSymbols.z())}.object(`)
                .inlineBlock(() => {
                    // Write regular shape properties
                    for (const [key, value] of Object.entries(shape)) {
                        writer.writeLine(`${escapeProperty(key)}: ${context.render(value)},`)
                    }
                })
                .write(')')

            // Handle additional properties
            if (element !== undefined) {
                // For mixed objects (with both defined properties and additional properties)
                // we use .catchall() to define the type of additional properties
                writer.write(`.catchall(${context.render(element)})`)
            }

            // Handle strict/passthrough mode
            if (options.strict === true) {
                writer.write('.strict()')
            } else if (options.strict === false) {
                writer.write('.passthrough()')
            }
        }

        return writer.toString()
    },

    array: (node, context) => {
        const { element, _options: options } = node
        const writer = createWriter()

        // When converting from JSON Schema, we keep arrays as arrays rather than Sets
        // because JSON data structures use arrays for collections, not Sets.
        // Converting to z.set() would require transforming the data which breaks JSON compatibility
        if (options.set === true && node._origin.jsonschema === undefined) {
            writer.write(`${context.value(zodSymbols.z())}.set(${context.render(element)})`)

            if (options.minItems !== undefined && options.maxItems !== undefined && options.minItems === options.maxItems) {
                writer.write(`.size(${options.minItems})`)
            } else {
                if (options.minItems !== undefined) {
                    if (options.minItems === 1) {
                        writer.write('.nonempty()')
                    } else {
                        writer.write(`.min(${options.minItems})`)
                    }
                }
                if (options.maxItems !== undefined) {
                    writer.write(`.max(${options.maxItems})`)
                }
            }
        } else {
            writer.write(`${context.render(element)}.array()`)

            if (options.minItems !== undefined && options.maxItems !== undefined && options.minItems === options.maxItems) {
                writer.write(`.length(${options.minItems})`)
            } else {
                if (options.minItems !== undefined) {
                    if (options.minItems === 1) {
                        writer.write('.nonempty()')
                    } else {
                        writer.write(`.min(${options.minItems})`)
                    }
                }
                if (options.maxItems !== undefined) {
                    writer.write(`.max(${options.maxItems})`)
                }
            }
        }
        return writer.toString()
    },

    tuple: (node, context) => {
        const {
            items,
            _options: { rest },
        } = node
        const writer = createWriter().write(
            `${context.value(zodSymbols.z())}.tuple([${items.map((item) => context.render(item)).join(', ')}])`,
        )

        if (rest !== undefined) {
            writer.write(`.rest(${context.render(rest)})`)
        }

        return writer.toString()
    },

    ref: (node, context) => {
        const {
            _children: [reference],
        } = node
        if (reference._sourcePath === undefined && context.locals.find(([l]) => l._id === reference._id) === undefined) {
            context.locals.push([reference, (out) => out.subtype === 'zod'])
        }

        return context.value(reference)
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

export function asZodDeclaration(
    declType: string,
    obj: Node,
    { exportSymbol, references }: { exportSymbol: boolean; references: References<'typescript'> },
) {
    const exportString = exportSymbol ? 'export ' : ''
    const writer = createWriter()
    writer.write(exportString).write(declType).write(' ').write(references.reference(obj, 'symbolName'))

    return writer.toString()
}
