import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import type { Json } from '@skyleague/axioms'
import { isArray, entriesOf } from '@skyleague/axioms'

export interface EnumOptions {}

export type EnumType = ThereforeNode<'enum', EnumOptions, unknown, [name: number, value: unknown][] | unknown[]>

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
export function $enum<T extends Json>(values: Record<string, T> | T[], options: SchemaOptions<EnumOptions> = {}): EnumType {
    return cstNode('enum', options, isArray(values) ? values : entriesOf(values).map(([name, value]) => [name, value]))
}
