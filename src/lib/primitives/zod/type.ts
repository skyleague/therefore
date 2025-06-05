import type { ArrayType } from '../array/array.js'
import type { BooleanType } from '../boolean/boolean.js'
import type { ConstType } from '../const/const.js'
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

export type ZodV3Schema = { _def: { typeName: unknown }; _output: unknown }

export type ZodV3SchemaAsNode<T extends ZodV3Schema> = T['_def']['typeName'] extends 'ZodString'
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
                  ? Element extends ZodV3Schema
                      ? ArrayType<ZodV3SchemaAsNode<Element>>
                      : never
                  : T extends { _def: { typeName: 'ZodObject' }; shape: infer Shape }
                    ? ObjectType<{
                          [K in keyof Shape]: Shape[K] extends ZodV3Schema ? ZodV3SchemaAsNode<Shape[K]> : never
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
                              ? RecordType<Element extends ZodV3Schema ? ZodV3SchemaAsNode<Element> : never>
                              : T extends { _def: { typeName: 'ZodLiteral' }; value: infer Value }
                                ? ConstType<Value>
                                : T extends { _def: { typeName: 'ZodOptional'; innerType: infer Schema } }
                                  ? Schema extends ZodV3Schema
                                      ? OptionalType<ZodV3SchemaAsNode<Schema>>
                                      : never
                                  : T extends { _def: { typeName: 'ZodNullable'; innerType: infer Schema } }
                                    ? Schema extends ZodV3Schema
                                        ? NullableType<ZodV3SchemaAsNode<Schema>>
                                        : never
                                    : T['_def']['typeName'] extends 'ZodDefault'
                                      ? BooleanType //
                                      : T extends {
                                              _def: { typeName: 'ZodEffects' }
                                              innerType: (...args: unknown[]) => infer Schema
                                          }
                                        ? Schema extends ZodV3Schema
                                            ? ZodV3SchemaAsNode<Schema>
                                            : never
                                        : never

export type ZodV4Schema = { _zod: { def: { type: string }; output: unknown } }

export type ZodV4SchemaAsNode<T extends ZodV4Schema> = T['_zod']['def']['type'] extends 'string'
    ? StringType
    : T['_zod']['def']['type'] extends 'number'
      ? NumberType
      : T['_zod']['def']['type'] extends 'boolean'
        ? BooleanType
        : T['_zod']['def']['type'] extends 'undefined'
          ? ConstType<undefined>
          : T['_zod']['def']['type'] extends 'null'
            ? ConstType<null>
            : T['_zod']['def']['type'] extends 'ZodAny' //
              ? UnknownType
              : T['_zod']['def']['type'] extends 'ZodUnknown' //
                ? UnknownType
                : T extends { _zod: { def: { type: 'ZodArray' }; element: infer Element } } //
                  ? Element extends ZodV3Schema
                      ? ArrayType<ZodV3SchemaAsNode<Element>>
                      : never
                  : T extends { _def: { typeName: 'ZodObject' }; shape: infer Shape } //
                    ? ObjectType<{
                          [K in keyof Shape]: Shape[K] extends ZodV3Schema ? ZodV3SchemaAsNode<Shape[K]> : never
                      }>
                    : T['_zod']['def']['type'] extends 'ZodUnion' //
                      ? UnionType
                      : T['_zod']['def']['type'] extends 'ZodDiscriminatedUnion' //
                        ? DiscriminatedUnionType
                        : T['_zod']['def']['type'] extends 'ZodIntersection' //
                          ? IntersectionType
                          : T['_zod']['def']['type'] extends 'ZodTuple' //
                            ? TupleType
                            : T extends { _zod: { def: { type: 'ZodRecord' }; element: infer Element } }
                              ? RecordType<Element extends ZodV3Schema ? ZodV3SchemaAsNode<Element> : never>
                              : T extends { _zod: { def: { type: 'ZodLiteral' }; value: infer Value } } //
                                ? ConstType<Value>
                                : T extends { _zod: { def: { type: 'ZodOptional'; innerType: infer Schema } } } //
                                  ? Schema extends ZodV3Schema
                                      ? OptionalType<ZodV3SchemaAsNode<Schema>>
                                      : never
                                  : T extends { _zod: { def: { type: 'ZodNullable'; innerType: infer Schema } } } //
                                    ? Schema extends ZodV3Schema
                                        ? NullableType<ZodV3SchemaAsNode<Schema>>
                                        : never
                                    : T['_zod']['def']['type'] extends 'ZodDefault' //
                                      ? BooleanType //
                                      : T extends {
                                              _zod: { def: { type: 'ZodEffects' } } //
                                              innerType: (...args: unknown[]) => infer Schema
                                          }
                                        ? Schema extends ZodV3Schema
                                            ? ZodV3SchemaAsNode<Schema>
                                            : never
                                        : never

export type ZodSchema = ZodV3Schema | ZodV4Schema

export type ZodSchemaAsNode<T extends ZodSchema> = T extends ZodV3Schema
    ? ZodV3SchemaAsNode<T>
    : T extends ZodV4Schema
      ? ZodV4SchemaAsNode<T>
      : never
