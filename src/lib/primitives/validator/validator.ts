import { generatedAjv } from '../../../commands/generate/constants.js'
import { defaultAjvConfig } from '../../ajv/defaults.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { ajvFormatsSymbols, ajvSymbols, moduleSymbol, zodSymbols } from '../../cst/module.js'
import { type Hooks, Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import { createWriter } from '../../writer.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'
import type { Options } from 'ajv'
import decamelize from 'decamelize'

import fs from 'node:fs'
import path from 'node:path'
import { constants } from '../../constants.js'
import { toJsonSchema } from '../../visitor/jsonschema/jsonschema.js'
import { toLiteral } from '../../visitor/typescript/literal.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import { type TypescriptZodWalkerContext, buildTypescriptZodTypeContext } from '../../visitor/typescript/typescript-zod.js'
import { type ValidatorInputOptions, type ValidatorOptions, defaultAjvValidatorOptions } from './types.js'

export function ajvOptions(node?: Node): Options {
    const validator = node?._validator
    const ajvOptions = validator?.type === 'ajv' ? validator : defaultAjvValidatorOptions
    return structuredClone({
        ...defaultAjvConfig,
        ...(ajvOptions.coerce ? { coerceTypes: true } : {}),
        ...ajvOptions.ajv,
    })
}

export class ValidatorType<T extends Node = Node> extends Node {
    public override _type = 'validator' as const
    public override _children: [Node]

    public _options: ValidatorOptions
    public formats: string[] | undefined = []
    public declare infer: T['infer']
    public declare intrinsic: Intrinsic<T>

    protected constructor(node: ConstExpr<T>) {
        super({})
        const evaluatedNode = evaluate(node)

        this._options = evaluatedNode._validator
        this._children = [evaluatedNode]
        this._connections = [evaluatedNode]
        this._attributes.validator = this._children[0]._attributes.validator
        this._attributes.isGenerated = this._children[0]._attributes.isGenerated
        this._origin = this._children[0]._origin

        evaluatedNode._attributes.validatorType = this
    }

    public override _hooks: Partial<Hooks> = {
        onLoad: [
            () => {
                this._name ??= this._children[0]._name
            },
        ],
        onExport: [
            (n) => {
                if (this._options?.type === 'ajv') {
                    const schemaName = decamelize(n._name, { separator: '-' })

                    n._attributes.generic['jsonschema:path'] = path.join(
                        path.dirname(n._sourcePath),
                        `./schemas/${schemaName}.schema.js${this._options.compile ? '' : 'on'}`,
                    )
                }
            },
        ],
    }

    public static _root(symbol: Node) {
        if (symbol._attributes.validatorType !== undefined) {
            return symbol
        }
        if (symbol._type === 'validator') {
            return symbol
        }
        return symbol._attributes.validator !== undefined ? new ValidatorType(symbol) : symbol
    }

    public override get _output(): (
        | TypescriptOutput<TypescriptTypeWalkerContext>
        | TypescriptOutput<TypescriptZodWalkerContext>
        | GenericOutput
    )[] {
        return [
            {
                type: 'typescript',
                subtype: 'ajv',
                isTypeOnly: false,
                definition: ({ _attributes: { generic } }, { value, type, targetPath }) => {
                    // be a little cheeky to not mark duplicates in our detection
                    const child = this._children[0]
                    const symbolValue = value(child)
                    const symbolType = type(child)

                    child._attributes.typescript['value:path'] = targetPath

                    const options = this._validator
                    if (options.type !== 'ajv') {
                        throw new Error('We expect the validator to be ajv, but it is not.')
                    }

                    const writer = createWriter()
                    const schemaPath = path.relative(path.dirname(targetPath), generic['jsonschema:path'] ?? '.')

                    const validatorReference = moduleSymbol(`./${schemaPath}`, `${symbolValue}Validator`, {
                        'value:export': 'validate',
                    })
                    const schemaReference = moduleSymbol(`./${schemaPath}`, `${symbolValue}Schema`, {
                        'value:export': 'default',
                    })

                    return writer
                        .write(`export const ${symbolValue} = `)
                        .inlineBlock(() => {
                            if (options.compile) {
                                writer
                                    .writeLine(
                                        `validate: ${value(validatorReference())} as ${type(
                                            ajvSymbols.ValidateFunction(),
                                        )}<${symbolType}>,`,
                                    )
                                    .writeLine(`get schema() { return ${symbolValue}.validate.schema},`)
                            } else {
                                const ajvCompile = `new ${value(ajvSymbols.AjvValidator())}(${JSON.stringify(ajvOptions(child))})`
                                const compile = `.compile<${symbolType}>(${value(schemaReference())})`

                                if (this.formats !== undefined && this.formats.length > 0) {
                                    writer.writeLine(
                                        `validate: ${value(ajvFormatsSymbols.addFormats())}.default(${ajvCompile}, ${toLiteral(
                                            this.formats,
                                        )} as ${type(ajvFormatsSymbols.FormatName())}[])${compile},`,
                                    )
                                } else {
                                    writer.writeLine(`validate: ${ajvCompile}${compile},`)
                                }

                                writer.writeLine(`schema: ${value(schemaReference())},`)
                            }

                            writer.writeLine(`get errors() { return ${symbolValue}.validate.errors ?? undefined },`)
                            writer.writeLine(`is: (o: unknown): o is ${symbolType} => ${symbolValue}.validate(o) === true,`)
                            if (options.assert) {
                                writer
                                    // the full assertion syntax is not yet supported on properties
                                    // https://github.com/microsoft/TypeScript/issues/34523
                                    // .write(`assert: (o: unknown): asserts o is ${symbolName} => `)
                                    .write('assert: (o: unknown) => ')
                                    .inlineBlock(() => {
                                        writer.write(`if (!${symbolValue}.validate(o))`).block(() => {
                                            writer.writeLine(
                                                `throw new ${value(ajvSymbols.ValidationError())}(${symbolValue}.errors ?? [])`,
                                            )
                                        })
                                    })
                                    .write(',')
                            }
                            if (options.parse) {
                                const definedErrorReference = type(ajvSymbols.DefinedError())
                                writer
                                    .writeLine(
                                        `parse: (o: unknown): { right: ${symbolType} } | { left: ${definedErrorReference}[] } => `,
                                    )
                                    .inlineBlock(() => {
                                        writer
                                            .write(`if(${symbolValue}.is(o))`)
                                            .block(() => {
                                                writer.writeLine('return { right: o }')
                                            })
                                            .write(`return { left: (${symbolValue}.errors ?? []) as ${definedErrorReference}[] }`)
                                    })
                                    .write(',')
                            }
                        })
                        .write(' as const\n')
                        .toString()
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
            {
                type: 'typescript',
                subtype: 'zod',
                isTypeOnly: false,
                enabled: (node) =>
                    (node._attributes.isGenerated && node._attributes.validator?.type === 'zod') ||
                    (constants.migrateToValidator === 'zod' && node._attributes.validator === undefined),
                definition: (symbol, context) => {
                    // be a little cheeky to not mark duplicates in our detection
                    const child = this._children[0]
                    const symbolType = context.type(child)

                    const options = this._options
                    if (options.type !== 'zod') {
                        throw new Error('We expect the validator to be zod, but it is not.')
                    }

                    const writer = createWriter()

                    // Generate type definition if needed
                    if (options.types) {
                        child._attributes.typescript['type:path'] = context.targetPath

                        const hasInlineZodDefinition =
                            symbol._guessedTrace?.symbolName === undefined && symbol._origin.zod !== undefined
                        const isExternalReference = symbol._guessedTrace?.source !== symbol._sourcePath
                        if (child._isRecurrent || symbol._name === undefined || hasInlineZodDefinition || !isExternalReference) {
                            const typeContext = buildTypescriptZodTypeContext({
                                targetPath: context.targetPath,
                                symbol,
                                exportSymbol: true,
                                references: context.references,
                                locals: context.locals,
                            })
                            writer.writeLine(`export type ${symbolType} = ${typeContext.render(child)}`)
                        } else {
                            writer.writeLine(
                                `export type ${symbolType} = ${context.type(zodSymbols.z())}.infer<typeof ${context.value(child)}>`,
                            )
                        }
                    }

                    // Generate Zod validator for recursive types
                    // we do it here to make sure they are always local to each other
                    if (child._attributes.validator?.type === 'zod' && child._isRecurrent) {
                        child._attributes.typescript['value:path'] = context.targetPath

                        writer
                            .write(
                                `${context.declare('const', child)}: ${context.type(zodSymbols.ZodType())}<${context.type(child)}> = `,
                            )
                            .write(context.render(child))
                    }

                    return writer.toString()
                },
            } satisfies TypescriptOutput<TypescriptZodWalkerContext>,
            {
                type: 'file',
                subtype: () => ('compile' in this._options && this._options.compile ? 'typescript' : 'json'),
                targetPath: () => {
                    if (this._attributes.generic['jsonschema:path'] === undefined) {
                        throw new Error('schemaPath is undefined, node was not properly initialized.')
                    }
                    return this._attributes.generic['jsonschema:path']
                },
                content: (_, { references }) => {
                    const options = this._options
                    if (options.type !== 'ajv') {
                        throw new Error('We expect the validator to be ajv, but it is not.')
                    }
                    const jsonschema = toJsonSchema(this._children[0], {
                        compile: options.compile,
                        references,
                        formats: options.formats !== undefined && options.formats === true,
                    })
                    this.formats = jsonschema.formats
                    if (jsonschema.compiled) {
                        return `/* eslint-disable */\n// @ts-nocheck\n/**\n * ${generatedAjv}\n */\n${jsonschema.code}`
                    }
                    return JSON.stringify(jsonschema.schema, null, 2)
                },
                clean: (targetPath) => {
                    const targetFolder = path.dirname(targetPath)
                    if (fs.existsSync(targetFolder)) {
                        console.warn(`Cleaning ${targetFolder}`)
                        fs.rmSync(targetFolder, { force: true, recursive: true })
                    }
                },
                prettify: () => !('compile' in this._options && this._options.compile),
                enabled: () => this._validator.type === 'ajv' && this._children[0]._attributes.validator !== undefined,
            } satisfies GenericOutput,
            {
                type: 'file',
                enabled: () => this._validator.output?.jsonschema !== undefined,
                subtype: () => 'json',
                targetPath: ({ _sourcePath }) => {
                    const dir = path.dirname(_sourcePath)
                    // biome-ignore lint/style/noNonNullAssertion: this is the condition to enable the file
                    return path.join(dir, this._validator.output!.jsonschema!)
                },
                content: (_, { references }) => {
                    const jsonschema = toJsonSchema(this._children[0], {
                        compile: false,
                        references,
                    })
                    return JSON.stringify(jsonschema.schema, null, 2)
                },
            } satisfies GenericOutput,
        ]
    }
}

/**
 * Enable the generation of validator code to this schema.
 *
 * ### Example
 * ```ts
 * $validator(
 *   $object({
 *       foo: $string,
 *   })
 * )
 * ```
 *
 * @param node - The schema to enable the validator for.
 * @param options - The validator options.
 *
 * @group Modifiers
 */
export function $validator<T extends Node>(node: T, options?: ValidatorInputOptions): T {
    return node.validator(options)
}
