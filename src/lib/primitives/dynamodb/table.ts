import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../visitor/typescript/typescript-zod.js'
import { createWriter } from '../../writer.js'
import { ObjectType, type ShapeToInfer } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import type { ZodSchema, ZodSchemaAsNode } from '../zod/type.js'
import { DynamoDbEntityType, type ShapeFormatString } from './entity.js'
import { dynamodbSymbols } from './symbols.js'

export type IndexDefinition<Pk extends string, NonKeyAttributes extends string[], Sk extends string | undefined = undefined> =
    | {
          pk: Pk
          sk?: Sk
          projectionType: 'INCLUDE'
          nonKeyAttributes: NonKeyAttributes
      }
    | {
          pk: Pk
          sk?: Sk
          projectionType: 'KEYS_ONLY' | 'ALL'
      }
export interface DynamoDbTableDefinition<
    Entity extends Record<string, unknown> = Record<string, unknown>,
    Pk extends keyof Entity & string = keyof Entity & string, //'pk',
    Sk extends keyof Entity & string = keyof Entity & string, //'sk',
    CreatedAt extends keyof Entity & string = keyof Entity & string, //'createdAt',
    UpdatedAt extends keyof Entity & string = keyof Entity & string, //'updatedAt',
    EntityType extends keyof Entity & string = keyof Entity & string, //'entityType',
    Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
> {
    pk: Pk
    sk?: Sk
    tableName?: string
    createdAt?: CreatedAt
    updatedAt?: UpdatedAt
    entityType?: EntityType
    indexes?: Indexes
    validator?: 'zod' | 'ajv'
}

export class DynamoDbTableType<
    Shape extends ObjectType = ObjectType,
    Definition extends DynamoDbTableDefinition = DynamoDbTableDefinition,
> extends Node {
    public override _type = 'dynamodb:table' as const
    public override _canReference?: boolean = false
    public definition: Omit<Definition, 'createdAt' | 'updatedAt' | 'entityType' | 'validator'> &
        Required<Pick<Definition, 'createdAt' | 'updatedAt' | 'entityType' | 'validator'>>

    public shape: Shape
    public declare infer: ShapeToInfer<Shape['shape']>
    public declare inferredDefinition: Definition

    public constructor(shape: Shape, definition: Definition) {
        super()
        this.definition = {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            entityType: 'entityType',
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
                        if (this.definition.tableName) {
                            tableWriter.writeLine(`public tableName = '${this.definition.tableName}' as const`)
                        } else {
                            tableWriter.writeLine('public tableName: string')
                        }

                        tableWriter.newLine().writeLine(`public client: ${DynamoDBDocument}`)

                        tableWriter
                            .blankLine()
                            .write('public constructor({')
                            .write('client,')
                            .conditionalWrite(this.definition.tableName === undefined, 'tableName,')
                            .write('} : {')
                            .write(`client: ${DynamoDBDocument};`)
                            .conditionalWrite(this.definition.tableName === undefined, 'tableName: string;')
                            .write('})')
                            .block(() => {
                                tableWriter.writeLine('this.client = client')
                                tableWriter.conditionalWrite(
                                    this.definition.tableName === undefined,
                                    'this.tableName = tableName',
                                )
                            })
                    })

                    return tableWriter.toString()
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
        ]
    }

    public entity<
        EntitySchema extends ObjectType,
        const EntityType extends string,
        Table extends DynamoDbTableType<Shape, Definition> = typeof this,
    >(args: {
        entityType: EntityType
        shape: EntitySchema
        keyFormatters: Record<
            Definition['pk'] | NonNullable<Definition['sk']>,
            ShapeFormatString<keyof EntitySchema['shape'] | keyof Table['shape']['shape']>
        >
        attributeFormatters?: Record<string, ShapeFormatString<keyof EntitySchema['shape'] | keyof Table['shape']['shape']>>
    }): DynamoDbEntityType<EntitySchema, EntityType, Table>
    public entity<
        EntitySchema extends ZodObjectSchema,
        const EntityType extends string,
        Table extends DynamoDbTableType<Shape, Definition> = typeof this,
    >(args: {
        entityType: EntityType
        shape: EntitySchema
        keyFormatters: Record<
            Definition['pk'] | NonNullable<Definition['sk']>,
            ShapeFormatString<keyof EntitySchema['shape'] | keyof Table['shape']['shape']>
        >
        attributeFormatters?: Record<string, ShapeFormatString<keyof EntitySchema['shape'] | keyof Table['shape']['shape']>>
    }): DynamoDbEntityType<
        ZodSchemaAsNode<EntitySchema> extends ObjectType ? ZodSchemaAsNode<EntitySchema> : never,
        EntityType,
        Table
    >
    public entity<EntitySchema extends ObjectType | ZodObjectSchema, const EntityType extends string>(args: {
        entityType: EntityType
        shape: EntitySchema
        keyFormatters: Record<Definition['pk'] | NonNullable<Definition['sk']>, string>
        attributeFormatters?: Record<string, string>
    }): DynamoDbEntityType<
        EntitySchema extends ObjectType
            ? EntitySchema
            : EntitySchema extends ZodSchema
              ? ZodSchemaAsNode<EntitySchema> extends ObjectType
                  ? ZodSchemaAsNode<EntitySchema>
                  : never
              : never,
        EntityType,
        DynamoDbTableType<Shape, Definition>
    > {
        const shapeRef = args.shape instanceof ObjectType ? args.shape : $ref(args.shape)
        return new DynamoDbEntityType({
            table: this,
            entityType: args.entityType,
            shape: shapeRef as ObjectType,
            keyFormatters: args.keyFormatters,
            attributeFormatters: args.attributeFormatters ?? {},
        })
    }
}

// Add minimal interface for Zod object schemas
interface ZodObjectSchema {
    _def: { typeName: 'ZodObject' }
    // biome-ignore lint/suspicious/noExplicitAny: we just need to match this
    _output: Record<string, any>
    shape: Record<string, unknown>
}

export function $table<Shape extends ObjectType, Definition extends DynamoDbTableDefinition<Shape['infer']>>(
    args: {
        shape: Shape
    } & Definition,
): DynamoDbTableType<Shape, Definition>
export function $table<Schema extends ZodObjectSchema, Definition extends DynamoDbTableDefinition<Schema['_output']>>(
    args: {
        shape: Schema
    } & Definition,
): DynamoDbTableType<ZodSchemaAsNode<Schema> extends ObjectType ? ZodSchemaAsNode<Schema> : never, Definition>
export function $table(args: { shape: ObjectType } & DynamoDbTableDefinition<ObjectType['infer']>) {
    const shapeRef = args.shape instanceof ObjectType ? args.shape : $ref(args.shape)
    return new DynamoDbTableType(shapeRef as ObjectType, args)
}
