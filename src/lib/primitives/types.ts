import type { ArrayType } from './array/index.js'
import type { BooleanType } from './boolean/index.js'
import type { DictType } from './dict/index.js'
import type { EnumType } from './enum/index.js'
import type { IntegerType } from './integer/index.js'
import type { IntersectionType } from './intersection/index.js'
import type { NullType } from './null/index.js'
import type { NumberType } from './number/index.js'
import type { ObjectType } from './object/index.js'
import type { RefType } from './ref/index.js'
import type { StringType } from './string/index.js'
import type { TupleType } from './tuple/index.js'
import type { UnionType } from './union/index.js'
import type { UnknownType } from './unknown/index.js'

import type { ThereforeNode } from '../cst/cst.js'

import { isObject } from '@skyleague/axioms'

export interface CustomTypeOptions {
    typescript?: {
        imports?: string[]
        declType?: string
        operator?: string
        declaration?: string
    }
    fileSuffix?: string
    filePath?: string
}

export type CustomType = ThereforeNode<'custom', CustomTypeOptions, unknown, ThereforeCst[]>

export type ThereforeCst =
    | ArrayType
    | BooleanType
    | CustomType
    | DictType
    | EnumType
    | IntegerType
    | IntersectionType
    | NullType
    | NumberType
    | ObjectType
    | RefType
    | StringType
    | TupleType
    | UnionType
    | UnknownType

export type ThereforeSchema = ThereforeCst

export function isThereforeExport(x: ThereforeCst | unknown): x is ThereforeCst {
    return isObject(x) && 'type' in x && 'uuid' in x && 'value' in x && 'description' in x
}
