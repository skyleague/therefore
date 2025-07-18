import type { ArrayType } from './array/array.js'
import type { BooleanType } from './boolean/boolean.js'
import type { ConstType } from './const/const.js'
import type { EnumType, NativeEnumType } from './enum/enum.js'
import type { IntegerType } from './integer/integer.js'
import type { IntersectionType } from './intersection/intersection.js'
import type { NullableType } from './nullable/nullable.js'
import type { NumberType } from './number/number.js'
import type { ObjectType } from './object/object.js'
import type { OptionalType } from './optional/optional.js'
import type { RefType } from './ref/type.js'
import type { StringType } from './string/string.js'
import type { TupleType } from './tuple/tuple.js'
import type { UnionType } from './union/union.js'
import type { UnknownType } from './unknown/unknown.js'
import type { ValidatorType } from './validator/validator.js'

export type ThereforeSchema =
    | ArrayType
    | BooleanType
    | EnumType
    | NativeEnumType
    | ConstType
    | IntegerType
    | IntersectionType
    | NumberType
    | ObjectType
    | RefType
    | StringType
    | TupleType
    | UnionType
    | UnknownType
    | ValidatorType
    | NullableType
    | OptionalType
