import type { MetaDescription, SchemaMeta, SchemaOptions, TypeDiscriminator } from '../primitives/base.js'
import { descriptionKeys } from '../primitives/base.js'

import type { RequireKeys } from '@skyleague/axioms'
import { omit, omitUndefined, pick, isObject } from '@skyleague/axioms'
import { v4 as uuid } from 'uuid'

export type ThereforeExpr = ThereforeNode | (() => ThereforeNode)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ThereforeNode<D extends string = string, I = unknown, T = unknown, C extends readonly any[] = unknown[]> {
    name?: string
    uuid: string
    type: D
    value: I
    description: SchemaMeta<T>
    children: C
}

export function cstNode<D extends TypeDiscriminator, O, T>(type: D, options: SchemaOptions<O, T>): ThereforeNode<D, O, T, never>
export function cstNode<D extends TypeDiscriminator, O, T, C extends readonly unknown[]>(
    type: D,
    options: SchemaOptions<O, T>,
    children?: C,
    name?: string
): ThereforeNode<D, O, T, C>
export function cstNode<D extends TypeDiscriminator, O, T, C extends readonly unknown[]>(
    type: D,
    options: SchemaOptions<O, T>,
    children?: C,
    name?: string
): ThereforeNode<D, O, T, C> {
    return omitUndefined({
        uuid: uuid(),
        type,
        value: omit(options, descriptionKeys) as unknown as O,
        description: pick(options, descriptionKeys) as MetaDescription<T>,
        children,
        name: name ?? options.name,
    }) as unknown as ThereforeNode<D, O, T, C>
}

export function isNamedCstNodeArray<T extends ThereforeNode>(
    x: Omit<T, 'name'>[] | RequireKeys<T, 'name'>[]
): x is RequireKeys<T, 'name'>[] {
    return x.length > 0 && x[0] !== undefined && 'name' in x[0]
}

/**
 * Checks whether the given object is a valid therefore schema node.
 *
 * @param x - The node to check.
 * @returns Checks if `x` is a ThereforeNode.
 *
 * @group Guards
 */
export function isThereforeNode(x: unknown): x is ThereforeNode {
    return isObject(x) && 'type' in x && 'uuid' in x && 'value' in x && 'description' in x
}
