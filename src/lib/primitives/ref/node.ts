import type { IsUnknown } from '@skyleague/axioms/types'
import type { Node } from '../../cst/node.js'
import type { ArrayType } from '../array/array.js'
import type { BooleanType } from '../boolean/boolean.js'
import type { NullableType } from '../nullable/nullable.js'
import type { NumberType } from '../number/number.js'
import type { ObjectType } from '../object/object.js'
import type { OptionalType } from '../optional/optional.js'
import type { StringType } from '../string/string.js'
import type { UnknownType } from '../unknown/unknown.js'

type AsObject<T> = T extends Record<string, Node> ? ObjectType<T> : UnknownType
export type SchemaAsNode<S> = IsUnknown<S> extends true
    ? UnknownType
    : undefined extends S
      ? OptionalType<SchemaAsNode<Exclude<S, undefined>>>
      : null extends S
        ? NullableType<SchemaAsNode<Exclude<S, null>>>
        : S extends infer T
          ? T extends undefined
              ? never
              : T extends string
                ? StringType
                : T extends number
                  ? NumberType
                  : T extends boolean
                    ? BooleanType
                    : T extends (infer U)[]
                      ? ArrayType<SchemaAsNode<U>>
                      : // biome-ignore lint/suspicious/noExplicitAny: needed for matching
                        T extends Record<string, any>
                        ? AsObject<{
                              [K in keyof T]-?: SchemaAsNode<T[K]>
                          }>
                        : UnknownType
          : never
