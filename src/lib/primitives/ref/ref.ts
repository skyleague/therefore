import type { ThereforeNode, ThereforeExpr } from '../../cst/cst'
import { isThereforeNode, cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { omit, isArray, isFunction, isTuple } from '@skyleague/axioms'

export interface RefOptions {
    exportSymbol?: boolean
}

export type RefType = ThereforeNode<'ref', RefOptions, unknown, [ThereforeExpr]>

export function isCombinedDefinition(
    x:
        | ThereforeExpr
        | [string, ThereforeExpr]
        | (SchemaOptions<RefOptions> & { reference: ThereforeExpr | [string, ThereforeExpr] })
): x is SchemaOptions<RefOptions> & { reference: ThereforeExpr | [string, ThereforeExpr] } {
    return (
        'reference' in x &&
        (isThereforeNode(x.reference) || isFunction(x.reference) || isTuple(2, x.reference) || 'then' in x.reference)
    )
}

/**
 * Create a new `RefType` instance with the given options.
 *
 * ### Example
 * ```ts
 * const foo = $number()
 * $ref(foo)
 *
 * $ref(["foobar", foo])
 * ```
 *
 * @param reference - The schema to reference.
 * @param options - Additional options to pass to the number.
 *
 * @group Primitives
 */
export function $ref(reference: ThereforeExpr | [string, ThereforeExpr]): RefType
export function $ref(reference: SchemaOptions<RefOptions> & { reference: ThereforeExpr | [string, ThereforeExpr] }): RefType
export function $ref(reference: ThereforeExpr | [string, ThereforeExpr], options?: SchemaOptions<RefOptions>): RefType
export function $ref(
    definition:
        | ThereforeExpr
        | [string, ThereforeExpr]
        | (SchemaOptions<RefOptions> & { reference: ThereforeExpr | [string, ThereforeExpr] }),
    options: SchemaOptions<RefOptions> = {}
): RefType {
    let reference: ThereforeExpr | [string, ThereforeExpr]
    if (isCombinedDefinition(definition)) {
        options = omit(definition, ['reference'])
        reference = definition.reference
    } else {
        reference = definition
    }

    if (isArray(reference)) {
        const [name, sub] = reference
        return cstNode('ref', options, [sub], name)
    }

    return cstNode('ref', options, [reference])
}
