import type { CstNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import type { Json } from '@skyleague/axioms'
import { isArray, entriesOf } from '@skyleague/axioms'

export interface EnumOptions {}

export type EnumType = CstNode<'enum', EnumOptions, unknown, [name: number, value: unknown][] | unknown[]>

/**
 * Declares an enum type. This is either a list of values, or a dictionary
 * where the key is the name of value.
 *
 * @param values - the values that are allowed on this property
 * @param options - additional options to pass to the property
 *
 * @example
 *      $enum([1, 2, 3])
 *
 * @example
 *      $enum({
 *          one: 1,
 *          two: 2,
 *          three: 3
 *      })
 *
 * @category $enum
 */
export function $enum<T extends Json>(values: Record<string, T> | T[], options: SchemaOptions<EnumOptions> = {}): EnumType {
    return cstNode('enum', options, isArray(values) ? values : entriesOf(values).map(([name, value]) => [name, value]))
}
