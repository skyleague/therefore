import type { CreateTableCommandInput, KeyType, ScalarAttributeType } from '@aws-sdk/client-dynamodb'
import { CreateTableCommand } from '@aws-sdk/client-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import type { IsStringLiteral } from '@skyleague/axioms/types'
import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../visitor/typescript/typescript-zod.js'
import { createWriter } from '../../writer.js'
import { BooleanType } from '../boolean/boolean.js'
import { NumberType } from '../number/number.js'
import { ObjectType, type ShapeToInfer } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import { StringType } from '../string/string.js'
import type { ZodSchemaAsNode } from '../zod/type.js'
import { DynamoDbEntityType } from './entity.js'
import { dynamodbSymbols } from './symbols.js'

export type IndexDefinition<
    Pk extends string = string,
    NonKeyAttributes extends string[] = string[],
    Sk extends string | undefined = string | undefined,
> =
    | {
          pk: Pk
          sk?: Sk
          projectionType: 'INCLUDE'
          nonKeyAttributes: NonKeyAttributes
      }
    | {
          pk: Pk
          projectionType: 'KEYS_ONLY' | 'ALL'
      }

// export type EntityFormatters<
//     EntityShape extends Record<string, unknown>,
//     TableShape extends Record<string, unknown>,
//     Definition extends DynamoDbTableDefinition<EntityShape>,
// > = {
//     pk: (keys: Record<keyof EntityShape | keyof TableShape, string>) => string
//     sk: [Definition['sk']] extends [undefined] ? never : (keys: Record<keyof EntityShape | keyof TableShape, string>) => string
// } & Record<string, (keys: Record<keyof EntityShape | keyof TableShape, string>) => string>

// export interface DynamoDbTableDefinition<
//     Entity extends Record<string, unknown> = Record<string, unknown>,
//     Pk extends keyof Entity = keyof Entity, //'pk',
//     Sk extends keyof Entity | undefined = keyof Entity | undefined, //'sk',
//     CreatedAt extends keyof Entity | undefined = keyof Entity, //'createdAt',
//     UpdatedAt extends keyof Entity | undefined = keyof Entity, //'updatedAt',
//     EntityType extends keyof Entity | undefined = keyof Entity, //'entityType',
//     Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined = Record<
//         string,
//         IndexDefinition<string, string[], string | undefined>
//     >,
// > {
//     pk: Pk
//     sk: Sk
//     createdAt: CreatedAt
//     updatedAt: UpdatedAt
//     entityType: EntityType
//     indexes: Indexes
//     validator: 'zod' | 'ajv'
// }

/**
 * Type for defining formatters for DynamoDB keys and attributes
 * @template EntitySchema - The schema of the entity being formatted
 * @template BaseShape - The base shape of the table
 * @template Sk - The sort key type (if any)
 */
export type EntityAttributeFormatters<
    EntitySchema extends { shape: Record<string, unknown> },
    BaseShape extends { shape: Record<string, unknown> },
    Sk extends string | undefined = undefined,
> = {
    /**
     * Required formatter for the partition key
     */
    pk: (keys: { [K in keyof EntitySchema['shape'] | keyof BaseShape['shape']]: string }) => string
    /**
     * Optional formatter for the sort key, only required if Sk is defined
     */
    sk?: [Sk] extends [undefined]
        ? never
        : (keys: { [K in keyof EntitySchema['shape'] | keyof BaseShape['shape']]: string }) => string
} & {
    /**
     * Optional formatters for any other attributes
     */
    [K in keyof EntitySchema['shape'] | keyof BaseShape['shape']]?: (
        keys: { [P in keyof EntitySchema['shape'] | keyof BaseShape['shape']]: string },
    ) => string
}

export class DynamoDbTableType<
    BaseShape extends ObjectType = ObjectType,
    const Pk extends keyof BaseShape['shape'] & string = keyof BaseShape['shape'] & string,
    const Sk extends (keyof BaseShape['shape'] & string) | undefined = (keyof BaseShape['shape'] & string) | undefined,
    const CreatedAt extends (keyof BaseShape['shape'] & string) | undefined = (keyof BaseShape['shape'] & string) | undefined,
    const UpdatedAt extends (keyof BaseShape['shape'] & string) | undefined = (keyof BaseShape['shape'] & string) | undefined,
    const EntityType extends (keyof BaseShape['shape'] & string) | undefined = (keyof BaseShape['shape'] & string) | undefined,
    const Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
> extends Node {
    public override _type = 'dynamodb:table' as const
    public override _canReference?: boolean = false
    public definition: {
        pk: Pk
        sk: Sk
        createdAt: CreatedAt
        updatedAt: UpdatedAt
        entityType: EntityType
        indexes: Indexes
        validator: 'zod' | 'ajv'
    }

    public shape: BaseShape
    public declare infer: ShapeToInfer<BaseShape['shape']>

    public constructor(
        shape: BaseShape,
        definition: {
            pk: Pk
            sk?: Sk
            createdAt?: CreatedAt
            updatedAt?: UpdatedAt
            entityType?: EntityType
            indexes?: Indexes
            validator?: 'zod' | 'ajv'
        },
    ) {
        super()
        this.definition = {
            createdAt: undefined as CreatedAt,
            updatedAt: undefined as UpdatedAt,
            entityType: undefined as EntityType,
            validator: 'zod',
            ...definition,
        }
        this.shape = shape
    }

    public override get _output():
        | (TypescriptOutput<TypescriptTypeWalkerContext> | TypescriptOutput<TypescriptZodWalkerContext> | GenericOutput)[]
        | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.client.ts'),
                type: 'typescript',
                subtype: undefined,
                isTypeOnly: false,
                definition: (node, { type, declare, targetPath }) => {
                    const DynamoDBDocument = type(dynamodbSymbols.DynamoDBDocument())

                    node._attributes.typescript['type:path'] = targetPath

                    const tableWriter = createWriter()
                    tableWriter.write(declare('class', node)).block(() => {
                        tableWriter
                            .writeLine('public tableName: string')
                            .writeLine(`public client: ${DynamoDBDocument}`)
                            .blankLine()
                            .write(
                                `public constructor({ client, tableName } : { client: ${DynamoDBDocument}; tableName: string; })`,
                            )
                            .block(() => {
                                tableWriter.writeLine('this.client = client').writeLine('this.tableName = tableName')
                            })
                    })

                    return tableWriter.toString()
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
        ]
    }

    /**
     * This overload is used for ObjectType schemas
     */
    public entity<
        EntitySchema extends ObjectType,
        const ConstEntityType extends IsStringLiteral<EntityType> extends true ? string : never,
        const AttributeFormatters extends EntityAttributeFormatters<EntitySchema, BaseShape, Sk> | undefined =
            | EntityAttributeFormatters<EntitySchema, BaseShape, Sk>
            | undefined,
    >(
        args: {
            shape: EntitySchema
            formatters?: AttributeFormatters
        } & (IsStringLiteral<EntityType> extends true ? { entityType: ConstEntityType } : { entityType?: never }),
    ): DynamoDbEntityType<EntitySchema, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>
    /**
     * This overload is used for Zod schemas
     */
    public entity<
        EntitySchema extends ZodObjectSchema,
        const ConstEntityType extends IsStringLiteral<EntityType> extends true ? string : never,
        const AttributeFormatters extends EntityAttributeFormatters<EntitySchema, BaseShape, Sk> | undefined =
            | EntityAttributeFormatters<EntitySchema, BaseShape, Sk>
            | undefined,
    >(
        args: {
            shape: EntitySchema
            formatters?: AttributeFormatters
        } & (IsStringLiteral<EntityType> extends true ? { entityType: ConstEntityType } : { entityType?: never }),
    ): DynamoDbEntityType<
        ZodSchemaAsNode<EntitySchema> extends ObjectType ? ZodSchemaAsNode<EntitySchema> : never,
        BaseShape,
        Pk,
        Sk,
        CreatedAt,
        UpdatedAt,
        EntityType,
        Indexes,
        AttributeFormatters
    >
    public entity<
        EntitySchema extends ObjectType | ZodObjectSchema,
        const ConstEntityType extends EntityType extends string ? string : never,
        const AttributeFormatters extends EntityAttributeFormatters<EntitySchema, BaseShape, Sk> | undefined = undefined,
    >(
        args: {
            shape: EntitySchema
            entityType: ConstEntityType
            formatters?: any
        } & (IsStringLiteral<EntityType> extends true ? { entityType: ConstEntityType } : { entityType?: never }),
    ): any {
        const shapeRef = args.shape instanceof ObjectType ? args.shape : $ref(args.shape)
        return new DynamoDbEntityType<
            ObjectType,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >({
            table: this,
            entityType: args.entityType,
            shape: shapeRef as ObjectType,
            formatters: args.formatters ?? {},
        })
    }

    public async createIfNotExists(client: { client: DynamoDBDocument; tableName: string }) {
        const { client: dynamoClient, tableName } = client

        const inferAttributeType = (key: string): ScalarAttributeType => {
            const valueType = this.shape.shape[key]
            if (valueType instanceof StringType) {
                return 'S' as const
            }
            if (valueType instanceof NumberType) {
                return 'N' as const
            }
            if (valueType instanceof BooleanType) {
                return 'B' as const
            }
            // officially not supported, but just fall back to string
            return 'S' as const
        }

        try {
            const input: CreateTableCommandInput = {
                TableName: tableName,
                AttributeDefinitions: [
                    { AttributeName: this.definition.pk, AttributeType: inferAttributeType(this.definition.pk) },
                    ...(this.definition.sk
                        ? [{ AttributeName: this.definition.sk, AttributeType: inferAttributeType(this.definition.sk) }]
                        : []),
                    ...(this.definition.indexes
                        ? Object.values(this.definition.indexes).flatMap((index) => {
                              const attributes = [{ AttributeName: index.pk, AttributeType: inferAttributeType(index.pk) }]
                              if ('sk' in index && index.sk) {
                                  attributes.push({ AttributeName: index.sk, AttributeType: inferAttributeType(index.sk) })
                              }
                              return attributes
                          })
                        : []),
                ],
                KeySchema: [
                    { AttributeName: this.definition.pk, KeyType: 'HASH' as KeyType },
                    ...(this.definition.sk ? [{ AttributeName: this.definition.sk, KeyType: 'RANGE' as KeyType }] : []),
                ],
                GlobalSecondaryIndexes: this.definition.indexes
                    ? Object.entries(this.definition.indexes).map(([indexName, index]) => {
                          const keySchema = [{ AttributeName: index.pk, KeyType: 'HASH' as KeyType }]
                          if ('sk' in index && index.sk) {
                              keySchema.push({ AttributeName: index.sk, KeyType: 'RANGE' as KeyType })
                          }
                          return {
                              IndexName: indexName,
                              KeySchema: keySchema,
                              Projection: {
                                  ProjectionType: index.projectionType,
                                  ...(index.projectionType === 'INCLUDE' ? { NonKeyAttributes: index.nonKeyAttributes } : {}),
                              },
                          }
                      })
                    : undefined,
                BillingMode: 'PAY_PER_REQUEST',
            }
            await dynamoClient.send(new CreateTableCommand(input))
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'ResourceInUseException') {
                // Table already exists, which is fine
                return
            }
            throw error
        }
    }
}

// Add minimal interface for Zod object schemas
interface ZodObjectSchema {
    _def: { typeName: 'ZodObject' }
    // biome-ignore lint/suspicious/noExplicitAny: we just need to match this
    _output: Record<string, any>
    shape: Record<string, unknown>
}

// defeault therefore schema definition
export function $table<
    Schema extends ObjectType,
    const Pk extends keyof Schema['shape'] & string,
    const Sk extends (keyof Schema['shape'] & string) | undefined = undefined,
    const CreatedAt extends (keyof Schema['shape'] & string) | undefined = undefined,
    const UpdatedAt extends (keyof Schema['shape'] & string) | undefined = undefined,
    const EntityType extends (keyof Schema['shape'] & string) | undefined = undefined,
    const Indexes extends Record<string, IndexDefinition> | undefined = undefined,
>(args: {
    shape: Schema
    pk: Pk
    sk?: Sk
    createdAt?: CreatedAt
    updatedAt?: UpdatedAt
    entityType?: EntityType
    indexes?: Indexes
    validator?: 'zod' | 'ajv'
}): DynamoDbTableType<Schema, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>
// zod schema support
export function $table<
    Schema extends ZodObjectSchema,
    const Pk extends keyof Schema['shape'] & string,
    const Sk extends (keyof Schema['shape'] & string) | undefined = undefined,
    const CreatedAt extends (keyof Schema['shape'] & string) | undefined = undefined,
    const UpdatedAt extends (keyof Schema['shape'] & string) | undefined = undefined,
    const EntityType extends (keyof Schema['shape'] & string) | undefined = undefined,
    const Indexes extends Record<string, IndexDefinition> | undefined = undefined,
>(args: {
    shape: Schema
    pk: Pk
    sk?: Sk
    createdAt?: CreatedAt
    updatedAt?: UpdatedAt
    entityType?: EntityType
    indexes?: Indexes
    validator?: 'zod' | 'ajv'
}): DynamoDbTableType<
    ZodSchemaAsNode<Schema> extends ObjectType ? ZodSchemaAsNode<Schema> : never,
    Pk,
    Sk,
    CreatedAt,
    UpdatedAt,
    EntityType,
    Indexes
>
export function $table(args: any): any {
    const shapeRef = args.shape instanceof ObjectType ? args.shape : $ref(args.shape)
    return new DynamoDbTableType(shapeRef as ObjectType, args)
}
