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
import { generatedAjv } from '../../../commands/generate/constants.js'
import { replaceExtension } from '../../../common/template/path.js'
import { constants } from '../../constants.js'
import { toJsonSchema } from '../../visitor/jsonschema/jsonschema.js'
import { mustBeLazyDefined } from '../../visitor/prepass/prepass.js'
import { toLiteral } from '../../visitor/typescript/literal.js'
import { buildTypescriptZodTypeContext } from '../../visitor/typescript/typescript-zod.js'
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

                    n._attributes.typescript.schemaPath = path.join(
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

    public override get _output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                subtype: 'ajv',
                isTypeOnly: false,
                definition: ({ _attributes: { typescript } }, { value, reference, references }) => {
                    // be a little cheeky to not mark duplicates in our detection
                    const child = this._children[0]
                    const symbolName = references.reference(child, 'symbolName')
                    this._attributes.typescript.symbolName = symbolName
                    this._attributes.typescript.referenceName = reference(this)

                    const symbolPath = typescript.path
                    if (symbolPath === undefined) {
                        throw new Error('path is undefined, node was not properly initialized.')
                    }

                    const options = this._validator
                    if (options.type !== 'ajv') {
                        throw new Error('We expect the validator to be ajv, but it is not.')
                    }

                    const writer = createWriter()
                    const schemaPath = path.relative(path.dirname(symbolPath), typescript.schemaPath ?? '.')

                    const validatorReference = moduleSymbol(`./${schemaPath}`, 'validate', {
                        alias: 'validate',
                        transform: { aliasName: () => `${symbolName}Validator` },
                    })
                    const schemaReference = moduleSymbol(`./${schemaPath}`, 'default', {
                        alias: 'schema',
                        transform: { aliasName: () => `${symbolName}Schema` },
                    })

                    return writer
                        .write(`export const ${symbolName} = `)
                        .inlineBlock(() => {
                            if (options.compile) {
                                writer
                                    .writeLine(
                                        `validate: ${value(validatorReference())} as ${reference(
                                            ajvSymbols.ValidateFunction(),
                                        )}<${symbolName}>,`,
                                    )
                                    .writeLine(`get schema() { return ${symbolName}.validate.schema},`)
                            } else {
                                const ajvCompile = `new ${value(ajvSymbols.AjvValidator())}(${JSON.stringify(ajvOptions(child))})`
                                const compile = `.compile<${symbolName}>(${value(schemaReference())})`

                                if (this.formats !== undefined && this.formats.length > 0) {
                                    writer.writeLine(
                                        `validate: ${value(ajvFormatsSymbols.addFormats())}.default(${ajvCompile}, ${toLiteral(
                                            this.formats,
                                        )} as ${reference(ajvFormatsSymbols.FormatName())}[])${compile},`,
                                    )
                                } else {
                                    writer.writeLine(`validate: ${ajvCompile}${compile},`)
                                }

                                writer.writeLine(`schema: ${value(schemaReference())},`)
                            }

                            writer.writeLine(`get errors() { return ${symbolName}.validate.errors ?? undefined },`)
                            writer.writeLine(`is: (o: unknown): o is ${symbolName} => ${symbolName}.validate(o) === true,`)
                            if (options.assert) {
                                writer
                                    // the full assertion syntax is not yet supported on properties
                                    // https://github.com/microsoft/TypeScript/issues/34523
                                    // .write(`assert: (o: unknown): asserts o is ${symbolName} => `)
                                    .write('assert: (o: unknown) => ')
                                    .inlineBlock(() => {
                                        writer.write(`if (!${symbolName}.validate(o))`).block(() => {
                                            writer.writeLine(
                                                `throw new ${value(ajvSymbols.ValidationError())}(${symbolName}.errors ?? [])`,
                                            )
                                        })
                                    })
                                    .write(',')
                            }
                            if (options.parse) {
                                const definedErrorReference = reference(ajvSymbols.DefinedError())
                                writer
                                    .writeLine(
                                        `parse: (o: unknown): { right: ${symbolName} } | { left: ${definedErrorReference}[] } => `,
                                    )
                                    .inlineBlock(() => {
                                        writer
                                            .write(`if(${symbolName}.is(o))`)
                                            .block(() => {
                                                writer.writeLine('return { right: o }')
                                            })
                                            .write(`return { left: (${symbolName}.errors ?? []) as ${definedErrorReference}[] }`)
                                    })
                                    .write(',')
                            }
                        })
                        .write(' as const\n')
                        .toString()
                },
            },
            {
                type: 'typescript',
                subtype: 'zod',
                isTypeOnly: false,
                definition: ({ _attributes: { typescript } }, { value, references }) => {
                    const child = this._children[0]
                    const symbolName = references.reference(child, 'aliasName')
                    const symbolNameAlias = moduleSymbol(
                        `./${path.relative(path.dirname(this._attributes.typescript.path ?? ''), child._attributes.typescript.path ?? '')}`,
                        symbolName,
                        {
                            alias: 'schema',
                            transform: { aliasName: () => `${symbolName}Schema` },
                        },
                    )()

                    const symbolPath = typescript.path
                    if (symbolPath === undefined) {
                        throw new Error('path is undefined, node was not properly initialized.')
                    }
                    const writer = createWriter()
                    writer
                        .writeLine('/**')
                        .writeLine(' * @deprecated')
                        .writeLine(' */')
                        .writeLine(`export type ${symbolName} = ${value(zodSymbols.z())}.infer<typeof ${value(symbolNameAlias)}>`)
                        .writeLine('/**')
                        .writeLine(
                            ` * @deprecated Use \`${symbolName}.safeParse\` instead. To migrate: 1) Replace \`${symbolName}.validate(data)\` with \`${symbolName}.safeParse(data)\` 2) Check result with \`.success\` instead of the return value 3) Access parsed data via \`.data\` or validation errors via \`.error.issues\` on the result object`,
                        )
                        .writeLine(' */')
                        .writeLine(`export const ${symbolName} = Object.assign(${value(symbolNameAlias)}.refine(x => x), `)
                        .block(() => {
                            writer
                                .writeLine('validate: (value: unknown): boolean => ')
                                .inlineBlock(() => {
                                    writer
                                        .writeLine(`const result = ${value(symbolNameAlias)}.safeParse(value)`)
                                        .writeLine('if (result.success && typeof value === "object" && value !== null) {')
                                        .writeLine('    Object.assign(value, result.data)')
                                        .writeLine('}')
                                        .writeLine(
                                            `${symbolName}.errors = result.success ? undefined : result.error.issues.map((issue) => ({`,
                                        )
                                        .writeLine('message: issue.message,')
                                        .writeLine('params: issue.path,')
                                        .writeLine("schemaPath: issue.path.join('/'),")
                                        .writeLine('}))')
                                        .writeLine('return result.success')
                                })
                                .write(',')
                                .writeLine('errors: undefined as unknown[] | undefined,')
                                .writeLine(`is: (o: unknown): o is ${symbolName} =>`)
                                .inlineBlock(() => {
                                    writer
                                        .writeLine(`const result = ${value(symbolNameAlias)}.safeParse(o)`)
                                        .writeLine('if (result.success && typeof o === "object" && o !== null) {')
                                        .writeLine('    Object.assign(o, result.data)')
                                        .writeLine('}')
                                        .writeLine('return result.success')
                                })
                                .write(',')
                                .writeLine(`parse: (o: unknown): { right: ${symbolName} } | { left: unknown[] } => `)
                                .inlineBlock(() => {
                                    writer
                                        .writeLine(`const result = ${value(symbolNameAlias)}.safeParse(o)`)
                                        .writeLine('if (result.success) { return { right: result.data } }')
                                        .writeLine('return {')
                                        .writeLine('left: result.error.issues.map((issue) => ({')
                                        .writeLine('message: issue.message,')
                                        .writeLine('params: issue.path,')
                                        .writeLine("schemaPath: issue.path.join('/')")
                                        .writeLine('}))')
                                        .writeLine('}')
                                })
                        })
                        .write(')')
                    return writer.toString()
                },
                enabled: (node) =>
                    constants.migrate &&
                    constants.migrateToValidator === 'zod' &&
                    !node._attributes.isGenerated &&
                    constants.generateInterop,
                targetPath: ({ _sourcePath: sourcePath }) => {
                    return replaceExtension(sourcePath, constants.defaultTypescriptOutExtension)
                },
            },
            {
                type: 'typescript',
                subtype: 'zod',
                isTypeOnly: false,
                enabled: (node) =>
                    (node._attributes.isGenerated && node._attributes.validator?.type === 'zod') ||
                    (!constants.generateInterop &&
                        constants.migrateToValidator === 'zod' &&
                        node._attributes.validator === undefined),
                definition: (symbol, context) => {
                    // be a little cheeky to not mark duplicates in our detection
                    const child = this._children[0]
                    const symbolName = context.references.reference(child, 'symbolName')
                    this._attributes.typescript.symbolName = symbolName
                    this._attributes.typescript.referenceName = context.reference(this)

                    const options = this._options
                    if (options.type !== 'zod') {
                        throw new Error('We expect the validator to be zod, but it is not.')
                    }

                    const writer = createWriter()
                    if (options.types) {
                        if (mustBeLazyDefined(child)) {
                            const typeContext = buildTypescriptZodTypeContext({
                                symbol,
                                exportSymbol: true,
                                references: context.references,
                                locals: context.locals,
                            })
                            writer.writeLine(`export type ${symbolName} = ${typeContext.render(symbol)}`)
                            //.write('// lazy')
                        } else {
                            writer.writeLine(`export type ${symbolName} = z.infer<typeof ${symbolName}>`)
                        }
                    }

                    if (child._attributes.validator?.type === 'zod') {
                        if (mustBeLazyDefined(child)) {
                            writer
                                .write(
                                    `${context.declare('const', child)}: ${context.reference(zodSymbols.ZodType())}<${context.reference(child)}> = `,
                                )
                                .write(`${context.value(zodSymbols.z())}.lazy(() => `)
                                .write(context.render(child))
                                .write(')')
                            // .write('//lazy')
                        }
                    }
                    return writer.toString()
                },
            },
            {
                type: 'file',
                subtype: () => ('compile' in this._options && this._options.compile ? 'typescript' : 'json'),
                targetPath: () => {
                    if (this._attributes.typescript.schemaPath === undefined) {
                        throw new Error('schemaPath is undefined, node was not properly initialized.')
                    }
                    return this._attributes.typescript.schemaPath
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
            },
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
            },
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
