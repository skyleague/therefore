import { generatedAjv } from '../../../commands/generate/constants.js'
import { defaultAjvConfig } from '../../ajv/defaults.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { ajvFormatsSymbols, ajvSymbols, moduleSymbol } from '../../cst/module.js'
import { type Hooks, Node } from '../../cst/node.js'
import type { Intrinsic } from '../../cst/types.js'
import { toJsonSchema } from '../../visitor/jsonschema/jsonschema.js'
import { createWriter } from '../../writer.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'
import type { Options } from 'ajv'
import decamelize from 'decamelize'

import fs from 'node:fs'
import path from 'node:path'
import { toLiteral } from '../../visitor/typescript/literal.js'

export function ajvOptions(node?: Node): Options {
    return structuredClone({
        ...defaultAjvConfig,
        ...(node?._definition.validator?.coerce ? { coerceTypes: true } : {}),
        ...node?._definition.validator?.ajv,
    })
}

export interface ValidatorOptions {
    /**
     * Toggles whether an assert function should be generated.
     *
     * @defaultvalue false
     */
    assert: boolean

    /**
     * Toggles whether a parse function should be generated.
     *
     * @defaultvalue true
     */
    parse: boolean

    /**
     * Whether the validator should be compiled.
     *
     * @defaultValue undefined
     */
    compile: boolean

    /**
     * Whether to coerce the input to the schema.
     */
    coerce: boolean

    /**
     *
     */

    /**
     * The ajv options to use.
     */
    ajv?: Options
}

export class ValidatorType<T extends Node = Node> extends Node {
    public override _type = 'validator' as const
    public override _children: [Node]

    public _options: ValidatorOptions
    public formats: string[] | undefined = []
    public declare infer: T['infer']
    public declare intrinsic: Intrinsic<T>

    public constructor(node: ConstExpr<T>) {
        super({})
        const evaluatedNode = evaluate(node)

        this._options = { assert: false, compile: true, parse: true, coerce: false, ...evaluatedNode._definition.validator }
        this._children = [evaluatedNode]
        this._connections = [evaluatedNode]
    }

    public override _hooks: Partial<Hooks> = {
        onLoad: [
            () => {
                this._name ??= this._children[0]._name
            },
        ],
        onExport: [
            (n) => {
                const schemaName = decamelize(n._name, { separator: '-' })

                n._attributes.typescript.schemaPath = path.join(
                    path.dirname(n._sourcePath),
                    `./schemas/${schemaName}.schema.js${this._options.compile ? '' : 'on'}`,
                )
            },
        ],
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
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
                            if (this._options.compile) {
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
                            if (this._options.assert) {
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
                            if (this._options.parse) {
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
                type: 'file',
                subtype: () => (this._options.compile ? 'typescript' : 'json'),
                targetPath: () => {
                    if (this._attributes.typescript.schemaPath === undefined) {
                        throw new Error('schemaPath is undefined, node was not properly initialized.')
                    }
                    return this._attributes.typescript.schemaPath
                },
                content: (_, { references }) => {
                    const jsonschema = toJsonSchema(this._children[0], {
                        compile: this._options.compile,
                        references,
                        formats: this.formats !== undefined,
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
                prettify: () => !this._options.compile,
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
export function $validator<T extends Node>(node: T, options: Partial<ValidatorOptions> = {}): T {
    return node.validator(options)
}
