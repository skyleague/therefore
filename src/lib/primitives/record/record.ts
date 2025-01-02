import type { ThereforeExpr } from '../../cst/cst.js'
import type { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'
import { ObjectType } from '../object/object.js'

import { type ConstExpr, evaluate } from '@skyleague/axioms'

export type RecordOptions = object

export class RecordType<IndexType extends Node = Node> extends ObjectType {
    public declare infer: Record<string, IndexType['infer']>
    public declare input: Record<string, IndexType['input']>
    public declare element: IndexType
    public declare key: IndexType

    public constructor(recordType: ThereforeExpr, options: SchemaOptions<RecordOptions, Record<string, IndexType['infer']>>) {
        super({}, options)
        this._from({ shape: {}, recordType })
    }
}

/**
 * Create a new `RecordType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $record($integer)
 *
 * $record($boolean())
 * ```
 *
 * @param items - The items on this record.
 * @param options - Additional options to pass to the record.
 *
 * @group Primitives
 */
export function $record<IndexType extends Node = Node>(
    items: ConstExpr<Node>,
    options: SchemaOptions<RecordOptions, Record<string, IndexType['infer']>> = {},
): RecordType<IndexType> {
    return new RecordType(evaluate(items), options)
}

/**
 * @deprecated use $record instead
 */
export function $dict<IndexType extends Node = Node>(
    items: ConstExpr<Node>,
    options: SchemaOptions<RecordOptions, Record<string, IndexType['infer']>> = {},
) {
    return $record(items, options)
}
