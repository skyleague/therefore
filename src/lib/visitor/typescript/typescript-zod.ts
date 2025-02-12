import type { ZodString } from 'zod'
import { TypescriptReferences } from '../../../commands/generate/output/references.js'
import { zodSymbols } from '../../cst/module.js'
import type { Node } from '../../cst/node.js'
import { type ThereforeVisitor, walkTherefore } from '../../cst/visitor.js'
import type { _ExtendType, _MergeType, _OmitType, _PickType } from '../../primitives/object/object.js'
import type { RecordType } from '../../primitives/record/record.js'
import { ValidatorType } from '../../primitives/validator/validator.js'
import { createWriter } from '../../writer.js'
import type { DefinedTypescriptOutput } from './cst.js'
import { stringLiteral, toLiteral } from './literal.js'
import {
    type TypescriptTypeWalkerContext,
    buildTypescriptTypeContext,
    escapeProperty,
    isReferenceable,
} from './typescript-type.js'

export interface TypescriptZodWalkerContext {
    targetPath: string
    symbol?: Node | undefined
    references: TypescriptReferences
    locals: [
        Node,
        (
            | ((
                  output:
                      | DefinedTypescriptOutput<TypescriptZodWalkerContext>
                      | DefinedTypescriptOutput<TypescriptTypeWalkerContext>,
              ) => boolean)
            | undefined
        ),
    ][]
    exportKeyword: string | undefined
    property: string | undefined
    render: (node: Node, ctx?: Partial<TypescriptZodWalkerContext>, options?: { allowToZod: boolean }) => string
    declare: (declType: 'interface' | 'type' | 'const' | 'class', node: Node) => string
    // reference: (node: Node) => string
    transform: (node: Node, schema: string) => string
    type: (node: Node) => string
    value: (node: Node) => string
}

export function buildTypescriptZodContext({
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
                            | DefinedTypescriptOutput<TypescriptZodWalkerContext>
                            | DefinedTypescriptOutput<TypescriptTypeWalkerContext>,
                    ) => boolean)
                  | undefined
              ),
          ][]
        | undefined
    exportSymbol: boolean
}): TypescriptZodWalkerContext {
    const context: TypescriptZodWalkerContext = {
        targetPath,
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
        render: (node, ctx: Partial<TypescriptZodWalkerContext> = {}) => {
            return walkTherefore(node, typescriptZodVisitor, { ...context, ...ctx })
        },
        declare: (declType: 'interface' | 'type' | 'const' | 'class', node) =>
            asZodDeclaration(declType, node, { exportSymbol, references }),
        type: (node) => references.type(node),
        value: (node) => references.value(node),
    }
    return context
}

export function buildTypescriptZodTypeContext({
    targetPath,
    symbol,
    exportSymbol,
    references,
    locals,
}: {
    targetPath: string
    symbol: Node
    exportSymbol: boolean
    references: TypescriptReferences
    locals: [
        Node,
        (
            | ((
                  output:
                      | DefinedTypescriptOutput<TypescriptZodWalkerContext>
                      | DefinedTypescriptOutput<TypescriptTypeWalkerContext>,
              ) => boolean)
            | undefined
        ),
    ][]
}) {
    const context = buildTypescriptTypeContext({
        targetPath,
        symbol,
        exportSymbol,
        references,
        locals,
    })
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
            if (options.minInclusive === true) {
                writer.write('.nonnegative()')
            } else {
                writer.write('.positive()')
            }
        } else if (options.max === 0) {
            if (options.maxInclusive === true) {
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
            if (options.minInclusive === true) {
                writer.write('.nonnegative()')
            } else {
                writer.write('.positive()')
            }
        } else if (options.max === 0) {
            if (options.maxInclusive === true) {
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
                    if (node._origin.zod !== undefined && (node._origin.zod as ZodString)._def.checks !== undefined) {
                        const zodString = node._origin.zod as ZodString
                        const zodDatetime = zodString._def.checks.find((check) => check.kind === 'datetime')
                        if (zodDatetime !== undefined) {
                            const hasArgs =
                                (zodDatetime.precision !== undefined && zodDatetime.precision !== null) ||
                                zodDatetime.offset ||
                                zodDatetime.local

                            writer.write('.datetime(')
                            if (hasArgs) {
                                writer.inlineBlock(() => {
                                    if (zodDatetime.precision !== undefined && zodDatetime.precision !== null) {
                                        writer.writeLine(`precision: ${zodDatetime.precision},`)
                                    }
                                    if (zodDatetime.offset) {
                                        writer.writeLine(`offset: ${zodDatetime.offset},`)
                                    }
                                    if (zodDatetime.local) {
                                        writer.writeLine(`local: ${zodDatetime.local},`)
                                    }
                                })
                            }
                            writer.write(')')
                        } else {
                            writer.write('.datetime()')
                        }
                    } else {
                        writer.write('.datetime({ offset: true })')
                    }
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
        // biome-ignore lint/style/noNonNullAssertion:
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
        const mergedType = node as _MergeType
        if (omitType._omitted !== undefined) {
            const origin = isReferenceable(omitType._omitted.origin)
                ? context.value(omitType._omitted.origin)
                : context.render(omitType._omitted.origin, undefined, { allowToZod: true })

            writer.writeLine(`${origin}.omit({ ${omitType._omitted.mask.map((m) => `'${m}': true`).join(', ')} })`)
        } else if (pickType._picked !== undefined) {
            const origin = isReferenceable(pickType._picked.origin)
                ? context.value(pickType._picked.origin)
                : context.render(pickType._picked.origin, undefined, { allowToZod: true })

            writer.writeLine(`${origin}.pick({ ${pickType._picked.mask.map((m) => `'${m}': true`).join(', ')} })`)
        } else if (extendType._extended !== undefined) {
            const origin = isReferenceable(extendType._extended.origin)
                ? context.value(extendType._extended.origin)
                : context.render(extendType._extended.origin, undefined, { allowToZod: true })

            writer
                .write(`${origin}.extend(`)
                .inlineBlock(() => {
                    for (const [key, value] of Object.entries(extendType._extended?.extends ?? {})) {
                        writer.writeLine(`${escapeProperty(key)}: ${context.render(value)},`)
                    }
                })
                .write(')')
        } else if (mergedType._merged !== undefined) {
            const origin = isReferenceable(mergedType._merged.origin)
                ? context.value(mergedType._merged.origin)
                : context.render(mergedType._merged.origin)

            const merged = isReferenceable(mergedType._merged.merged)
                ? context.value(mergedType._merged.merged)
                : context.render(mergedType._merged.merged)

            writer.write(`${origin}.merge(${merged})`)
            // } else if (node._toZod !== undefined) {
            //     return context.render(node._toZod)
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

        if (options.set === true) {
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
            reference.validator({ type: 'zod' })
        }
        if (
            context.symbol === reference ||
            (context.symbol instanceof ValidatorType && context.symbol._children[0] === reference)
        ) {
            return `${context.value(zodSymbols.z())}.lazy(() => ${context.value(reference)})`
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
    { exportSymbol, references }: { exportSymbol: boolean; references: TypescriptReferences },
) {
    const exportString = exportSymbol ? 'export ' : ''
    const writer = createWriter()
    writer.write(exportString).write(declType).write(' ').write(references.value(obj))

    return writer.toString()
}
