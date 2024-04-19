import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { NodeTrait } from '../../cst/mixin.js'
import { toLiteral } from '../../visitor/typescript/literal.js'
import { createWriter } from '../../writer.js'
import type { SchemaOptions } from '../base.js'

import { entriesOf } from '@skyleague/axioms'

export type EnumOptions = object

abstract class _EnumType extends NodeTrait {
    public override type = 'enum' as const
    public options: EnumOptions = {}
}

export class EnumType<Values extends unknown[] = string[]> extends _EnumType {
    public isNamed = false as const
    public values: Values

    public declare infer: Values[number]
    public constructor(values: Values, options: SchemaOptions<EnumOptions, Values[number]>) {
        super(options)
        this.options = options
        this.values = values
    }

    public override get output(): (TypescriptOutput | GenericOutput)[] {
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

export class NativeEnumType<Values extends unknown[] = string[]> extends _EnumType {
    public isNamed = true as const
    public values: [string, Values[number]][]

    public declare infer: Values[number]
    public constructor(values: [string, Values[number]][], options: SchemaOptions<EnumOptions, Values[number]>) {
        super(options)
        this.options = options
        this.values = values
    }

    public override get output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                definition: (_, context) => {
                    const { values: vals } = this
                    const { exportKeyword = '', references } = context
                    const writer = createWriter()
                    const symbolName = references.reference(this, 'symbolName')
                    writer
                        .write(`${exportKeyword}const ${symbolName} = `)
                        .inlineBlock(() => {
                            for (const [childName, value] of vals) {
                                writer.writeLine(`${childName}: ${toLiteral(value)},`)
                            }
                        })
                        .write(' as const')
                        .writeLine(`${exportKeyword}type ${symbolName} = typeof ${symbolName}`)
                    // @todo check this
                    this.attributes.typescript.referenceName = `keyof typeof ${symbolName}`
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
): NativeEnumType<Values[keyof Values][]>
export function $enum<const Values extends string[]>(
    values: Record<string, Values[number]> | Values,
    options: SchemaOptions<EnumOptions, Values[number]> = {},
): EnumType<Values> | NativeEnumType<Values> {
    return Array.isArray(values) ? new EnumType(values, options) : new NativeEnumType(entriesOf(values), options)
}
