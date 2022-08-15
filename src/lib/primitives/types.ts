import type { ArrayType } from './array'
import type { BooleanType } from './boolean'
import type { DictType } from './dict'
import type { EnumType } from './enum'
import type { IntegerType } from './integer'
import type { NullType } from './null'
import type { NumberType } from './number'
import type { ObjectType } from './object'
import type { RefType } from './ref'
import type { AsyncRefType } from './ref/ref'
import type { StringType } from './string'
import type { TupleType } from './tuple'
import type { UnionType } from './union'
import type { UnknownType } from './unknown'

import type { CstNode } from '../cst/cst'

import { isObject } from '@skyleague/axioms'

export interface CustomTypeOptions {
    typescript?: {
        imports?: string[]
        declType?: string
        operator?: string
        declaration?: string
    }
    fileSuffix?: string
    fileName?: string
}

export type CustomType = CstNode<'custom', CustomTypeOptions, unknown, ThereforeCst[]>

export type ThereforeCst =
    | ArrayType
    | BooleanType
    | CustomType
    | DictType
    | EnumType
    | IntegerType
    | NullType
    | NumberType
    | ObjectType
    | RefType
    | StringType
    | TupleType
    | UnionType
    | UnknownType

export type AyncThereforeCst = AsyncRefType | Exclude<ThereforeCst, { type: 'ref' }>

export function isThereforeExport(x: ThereforeCst | unknown): x is ThereforeCst {
    return isObject(x) && 'type' in x && 'uuid' in x && 'value' in x && 'description' in x
}
