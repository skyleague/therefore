import type { MetaDescription, SchemaMeta, SchemaOptions, TypeDiscriminator } from '../primitives/base'
import { descriptionKeys } from '../primitives/base'

import type { RequireKeys } from '@skyleague/axioms'
import { omit, omitUndefined, pick, isObject } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export type CstSubNode = CstNode | (() => CstNode)

export interface CstNode<D extends string = string, I = unknown, T = unknown, C extends readonly any[] = unknown[]> {
    name?: string
    uuid: string
    type: D
    value: I
    description: SchemaMeta<T>
    children: C
}

export function cstNode<D extends TypeDiscriminator, O, T>(type: D, options: SchemaOptions<O, T>): CstNode<D, O, T, never>
export function cstNode<D extends TypeDiscriminator, O, T, C extends readonly unknown[]>(
    type: D,
    options: SchemaOptions<O, T>,
    children?: C,
    name?: string
): CstNode<D, O, T, C>
export function cstNode<D extends TypeDiscriminator, O, T, C extends readonly unknown[]>(
    type: D,
    options: SchemaOptions<O, T>,
    children?: C,
    name?: string
): CstNode<D, O, T, C> {
    return omitUndefined({
        uuid: uuid(),
        type,
        value: omit(options, descriptionKeys) as unknown as O,
        description: pick(options, descriptionKeys) as MetaDescription<T>,
        children,
        name: name ?? options.name,
    })
}

export function isNamedCstNodeArray<T extends CstNode>(
    x: Omit<T, 'name'>[] | RequireKeys<T, 'name'>[]
): x is RequireKeys<T, 'name'>[] {
    return x.length > 0 && 'name' in x[0] && x[0] !== undefined
}

export function isCstNode(x: unknown): x is CstNode {
    return isObject(x) && 'type' in x && 'uuid' in x && 'value' in x && 'description' in x
}
