import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { NodeTrait } from '../../cst/mixin.js'
import { toLiteral } from '../../visitor/typescript/literal.js'
import { createWriter } from '../../writer.js'
import type { SchemaOptions } from '../base.js'

export type EnumOptions = object

abstract class _EnumType extends NodeTrait {
    public override _type = 'enum' as const
    public _options: EnumOptions = {}
}

export class EnumType<Values extends unknown[] = string[]> extends _EnumType {
    public _isNamed = false as const
    public enum: Values
    public declare infer: Values[number]
    public declare input: Values[number]

    public constructor(values: Values, options: SchemaOptions<EnumOptions, Values[number]>) {
        super(options)
        this._options = options
        this.enum = values
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                definition: (_, context) => {
                    return `${context.declare('type', this)} = ${context.render(this)}`
                },
            },
        ]
    }
}

export class NativeEnumType<Enum extends Record<string, string> = Record<string, string>> extends _EnumType {
    public _isNamed = true as const
    public enum: Enum

    public declare infer: Enum[keyof Enum]
    public declare input: Enum[keyof Enum]
    public constructor(values: Enum, options: SchemaOptions<EnumOptions, Enum[keyof Enum]>) {
        super(options)
        this._options = options
        this.enum = values
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                definition: (_, context) => {
                    const { enum: vals } = this
                    const { exportKeyword = '', references } = context
                    const writer = createWriter()
                    const symbolName = references.reference(this, 'symbolName')
                    writer
                        .write(`${exportKeyword}const ${symbolName} = `)
                        .inlineBlock(() => {
                            for (const [childName, value] of Object.entries(vals)) {
                                writer.writeLine(`${childName}: ${toLiteral(value)},`)
                            }
                        })
                        .write(' as const')
                        .writeLine(`${exportKeyword}type ${symbolName} = typeof ${symbolName}`)
                    // @todo check this
                    this._attributes.typescript.referenceName = `keyof typeof ${symbolName}`
                    return writer.writeLine('').toString()
                },
            },
        ]
    }
}

/**
 * Declares an `EnumType`. This is either a list of values, or a dictionary
 * where the key is the name of value.
 *
 * ### Example
 * ```ts
 * $enum([1, 3])
 *
 * $enum(["foobar"])
 * ```
 *
 * @param values - The values that are allowed on this property.
 * @param options - Additional options to pass to the enum.
 *
 * @group Primitives
 */
export function $enum<const Values extends string[]>(
    values: Values,
    options?: SchemaOptions<EnumOptions, Values[number]>,
): EnumType<Values>
export function $enum<const Values extends Record<string, string>>(
    values: Values,
    options?: SchemaOptions<EnumOptions, Values[keyof Values]>,
): NativeEnumType<Values>
export function $enum<const Values extends string[]>(
    values: Record<string, Values[number]> | Values,
    options: SchemaOptions<EnumOptions, Values[number]> = {},
): EnumType<Values> | NativeEnumType<Record<string, string>> {
    return Array.isArray(values) ? new EnumType(values, options) : new NativeEnumType(values, options)
}
