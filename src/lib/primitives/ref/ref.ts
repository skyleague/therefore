import type { CstNode, CstSubNode } from '../../cst/cst'
import { isCstNode, cstNode } from '../../cst/cst'
import type { SchemaOptions } from '../base'

import { omit, isArray, isFunction, isTuple } from '@skyleague/axioms'

export interface RefOptions {
    exportSymbol?: boolean
}

export type AsyncRefType = CstNode<'ref', RefOptions, unknown, [CstSubNode | Promise<CstSubNode>]>
export type RefType = CstNode<'ref', RefOptions, unknown, [CstSubNode]>

export function isCombinedDefinition(
    x:
        | CstSubNode
        | [string, CstSubNode | Promise<CstSubNode>]
        | (SchemaOptions<RefOptions> & { reference: CstSubNode | [string, CstSubNode] | [string, Promise<CstSubNode>] })
): x is SchemaOptions<RefOptions> & { reference: CstSubNode | [string, CstSubNode] | [string, Promise<CstSubNode>] } {
    return (
        'reference' in x &&
        (isCstNode(x.reference) || isFunction(x.reference) || isTuple(2, x.reference) || 'then' in x.reference)
    )
}

export function $ref(reference: CstSubNode | [string, CstSubNode]): AsyncRefType
export function $ref(reference: CstSubNode | [string, Promise<CstSubNode>]): AsyncRefType
export function $ref(reference: SchemaOptions<RefOptions> & { reference: CstSubNode | [string, CstSubNode] }): AsyncRefType
export function $ref(
    reference: SchemaOptions<RefOptions> & { reference: CstSubNode | [string, Promise<CstSubNode>] }
): AsyncRefType
export function $ref(reference: CstSubNode | [string, CstSubNode], options?: SchemaOptions<RefOptions>): AsyncRefType
export function $ref(
    definition:
        | CstSubNode
        | [string, CstSubNode | Promise<CstSubNode>]
        | (SchemaOptions<RefOptions> & { reference: CstSubNode | [string, CstSubNode] | [string, Promise<CstSubNode>] }),
    options: SchemaOptions<RefOptions> = {}
): AsyncRefType {
    let reference: CstSubNode | [string, CstSubNode | Promise<CstSubNode>]
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
