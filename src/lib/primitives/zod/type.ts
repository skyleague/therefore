import type { ArrayType } from '../array/array.js'
import type { BooleanType } from '../boolean/boolean.js'
import type { ConstType } from '../const/const.js'
import type { EnumType } from '../enum/enum.js'
import type { IntersectionType } from '../intersection/intersection.js'
import type { NullableType } from '../nullable/nullable.js'
import type { NumberType } from '../number/number.js'
import type { ObjectType } from '../object/object.js'
import type { OptionalType } from '../optional/optional.js'
import type { RecordType } from '../record/record.js'
import type { StringType } from '../string/string.js'
import type { TupleType } from '../tuple/tuple.js'
import type { DiscriminatedUnionType, UnionType } from '../union/union.js'
import type { UnknownType } from '../unknown/unknown.js'

export type ZodSchema = { _def: { typeName: unknown }; _output: unknown }

export type ZodSchemaAsNode<T extends ZodSchema> = T['_def']['typeName'] extends 'ZodString'
    ? StringType
    : T['_def']['typeName'] extends 'ZodNumber'
      ? NumberType
      : T['_def']['typeName'] extends 'ZodBoolean'
        ? BooleanType
        : T['_def']['typeName'] extends 'ZodUndefined'
          ? ConstType<undefined>
          : T['_def']['typeName'] extends 'ZodNull'
            ? ConstType<null>
            : T['_def']['typeName'] extends 'ZodAny'
              ? UnknownType
              : T['_def']['typeName'] extends 'ZodUnknown'
                ? UnknownType
                : T extends { _def: { typeName: 'ZodArray' }; element: infer Element }
                  ? Element extends ZodSchema
                      ? ArrayType<ZodSchemaAsNode<Element>>
                      : never
                  : T extends { _def: { typeName: 'ZodObject' }; shape: infer Shape }
                    ? ObjectType<{
                          [K in keyof Shape]: Shape[K] extends ZodSchema ? ZodSchemaAsNode<Shape[K]> : never
                      }>
                    : T['_def']['typeName'] extends 'ZodUnion'
                      ? UnionType
                      : T['_def']['typeName'] extends 'ZodDiscriminatedUnion'
                        ? DiscriminatedUnionType
                        : T['_def']['typeName'] extends 'ZodIntersection'
                          ? IntersectionType
                          : T['_def']['typeName'] extends 'ZodTuple'
                            ? TupleType
                            : T extends { _def: { typeName: 'ZodRecord' }; element: infer Element }
                              ? RecordType<Element extends ZodSchema ? ZodSchemaAsNode<Element> : never>
                              : T extends { _def: { typeName: 'ZodLiteral' }; value: infer Value }
                                ? ConstType<Value>
                                : T extends { _def: { typeName: 'ZodOptional'; innerType: infer Schema } }
                                  ? Schema extends ZodSchema
                                      ? OptionalType<ZodSchemaAsNode<Schema>>
                                      : never
                                  : T extends { _def: { typeName: 'ZodNullable'; innerType: infer Schema } }
                                    ? Schema extends ZodSchema
                                        ? NullableType<ZodSchemaAsNode<Schema>>
                                        : never
                                    : T['_def']['typeName'] extends 'ZodDefault'
                                      ? BooleanType //
                                      : T extends {
                                              _def: { typeName: 'ZodEffects' }
                                              innerType: (...args: unknown[]) => infer Schema
                                          }
                                        ? Schema extends ZodSchema
                                            ? ZodSchemaAsNode<Schema>
                                            : never
                                        : T extends { _def: { typeName: 'ZodEnum'; values: Array<infer Values> } }
                                          ? EnumType<Values[]>
                                          : never
