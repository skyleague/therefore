import type { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { isDefined } from '@skyleague/axioms'
import { replaceExtension } from '../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../cst/cst.js'
import type { Node } from '../../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../../visitor/typescript/typescript-zod.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType, StorageShapeType } from '../entity.js'
import { Condition, type ConditionBuilder } from '../expressions/condition.js'
import type { ProjectionBuilder } from '../expressions/projection.js'
import { dynamodbSymbols } from '../symbols.js'
import type { EntityAttributeFormatters, IndexDefinition } from '../table.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from './base.js'
import { DynamodbCommandSchemaBuilder } from './builder.js'

// type Builders<
//     StorageShape extends ObjectType,
//     Pk extends keyof StorageShape & string,
//     Sk extends (keyof StorageShape & string) | undefined,
// > = {
//     key?: ConditionBuilder<ObjectType<Pick<StorageShape['shape'], NonNullable<Pk | Sk>>>>
//     projection?: ProjectionBuilder<StorageShape>
//     filter?: ConditionBuilder<StorageShape>
// }

// type IndexesOf<Entity extends DynamoDbEntityType> = NonNullable<Entity['table']['definition']['indexes']>
// type GetIndex<Entity extends DynamoDbEntityType, ChosenIndex extends keyof IndexesOf<Entity>> = IndexesOf<Entity>[ChosenIndex]

export type IndexPick<
    StorageShape extends ObjectType,
    Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined,
    ChosenIndex extends keyof NonNullable<Indexes>,
> = (
    (Indexes & {})[ChosenIndex] extends {
        projectionType: 'INCLUDE'
        nonKeyAttributes: infer NonKeyAttributes extends (keyof StorageShape['shape'])[]
        pk: infer Pk extends keyof StorageShape['shape']
        sk?: infer Sk extends keyof StorageShape['shape']
    }
        ? Pick<StorageShape['shape'], NonKeyAttributes[number] | Pk | Sk>
        : (Indexes & {})[ChosenIndex] extends {
                projectionType: 'KEYS_ONLY'
                pk: infer Pk extends keyof StorageShape['shape']
                sk?: infer Sk extends keyof StorageShape['shape']
            }
          ? Pick<StorageShape['shape'], Pk | Sk | NonNullable<Pk | Sk>>
          : StorageShape['shape']
) extends infer Picked extends Record<string, Node>
    ? ObjectType<Picked>
    : never

// type IndexBuilders<
//     Entity extends ObjectType,
//     BaseShape extends ObjectType,
//     Pk extends keyof Entity['shape'] & string,
//     Sk extends (keyof Entity['shape'] & string) | undefined,
//     CreatedAt extends (keyof Entity['shape'] & string) | undefined,
//     UpdatedAt extends (keyof Entity['shape'] & string) | undefined,
//     EntityType extends (keyof Entity['shape'] & string) | undefined,
//     Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined,
//     ChosenIndex extends keyof NonNullable<Indexes>,
// > = {
//     key?: ConditionBuilder<
//         ObjectType<
//             Pick<Entity['storageShape']['shape'], NonNullable<Indexes[ChosenIndex]['pk'] | Indexes[ChosenIndex]['sk']> & string>
//         >
//     >
//     projection?: ProjectionBuilder<IndexPick<Entity, ChosenIndex>>
//     filter?: ConditionBuilder<IndexPick<Entity, ChosenIndex>>
// }

export type QueryCommandOptions = Omit<OmitLegacyOptions<OmitExpressions<QueryCommandInput>>, 'TableName'>

export interface DynamodbQueryCommandOptions<
    Entity extends ObjectType = ObjectType,
    BaseShape extends ObjectType = ObjectType,
    Pk extends keyof Entity['shape'] & string = keyof Entity['shape'] & string,
    Sk extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    CreatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    UpdatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    EntityType extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
    AttributeFormatters extends EntityAttributeFormatters<Entity, BaseShape, Sk> | undefined =
        | EntityAttributeFormatters<Entity, BaseShape, Sk>
        | undefined,
    ChosenIndex extends keyof NonNullable<Indexes> | undefined = undefined,
> {
    entity: DynamoDbEntityType<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>
    expressions?:
        | ([ChosenIndex] extends [string]
              ? {
                    key?: ConditionBuilder<
                        ObjectType<
                            Pick<
                                StorageShapeType<Entity, BaseShape>['shape'],
                                NonNullable<
                                    | (Indexes & {})[ChosenIndex]['pk']
                                    | ('sk' extends keyof (Indexes & {})[ChosenIndex] ? (Indexes & {})[ChosenIndex]['sk'] : never)
                                > &
                                    string
                            >
                        >,
                        AttributeFormatters
                    >
                    projection?: ProjectionBuilder<IndexPick<StorageShapeType<Entity, BaseShape>, Indexes, ChosenIndex>>
                    filter?: ConditionBuilder<
                        IndexPick<StorageShapeType<Entity, BaseShape>, Indexes, ChosenIndex>,
                        AttributeFormatters
                    >
                }
              : {
                    key?: ConditionBuilder<
                        ObjectType<Pick<StorageShapeType<Entity, BaseShape>['shape'], NonNullable<Pk | Sk>>>,
                        AttributeFormatters
                    >
                    projection?: ProjectionBuilder<StorageShapeType<Entity, BaseShape>>
                    filter?: ConditionBuilder<StorageShapeType<Entity, BaseShape>, AttributeFormatters>
                })
        | undefined
    commandOptions?: QueryCommandOptions | undefined
    scope: 'entity' | 'table'
    index?: ChosenIndex
}

export class DynamodbQueryCommandType<
    Entity extends ObjectType = ObjectType,
    BaseShape extends ObjectType = ObjectType,
    const Pk extends keyof Entity['shape'] & string = keyof Entity['shape'] & string,
    const Sk extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const CreatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const UpdatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const EntityType extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
    const AttributeFormatters extends EntityAttributeFormatters<Entity, BaseShape, Sk> | undefined =
        | EntityAttributeFormatters<Entity, BaseShape, Sk>
        | undefined,
    ChosenIndex extends (keyof NonNullable<Indexes> & string) | undefined = undefined,
> extends DynamodbBaseCommandType<
    QueryCommand,
    QueryCommandOptions,
    Entity,
    BaseShape,
    Pk,
    Sk,
    CreatedAt,
    UpdatedAt,
    EntityType,
    Indexes,
    AttributeFormatters
> {
    public override _type = 'dynamodb:command:query' as const
    public _scope: 'entity' | 'table'
    public _index: ChosenIndex | undefined

    public constructor({
        expressions,
        commandOptions = {},
        entity,
        scope,
        index,
    }: DynamodbQueryCommandOptions<
        Entity,
        BaseShape,
        Pk,
        Sk,
        CreatedAt,
        UpdatedAt,
        EntityType,
        Indexes,
        AttributeFormatters,
        ChosenIndex
    >) {
        super({
            entity,
            commandOptions,
            schema: new DynamodbCommandSchemaBuilder({
                entity,
                inferKeySchema: false,
                indexKey: index,

                projection: expressions?.projection,
                filter: expressions?.filter,
                keyCondition: ({ stored, args, formatters }) => {
                    const condition = expressions?.key?.({ stored, args, formatters })
                    const expression = isDefined(condition) ? Condition.from(condition) : undefined
                    // biome-ignore lint/style/noNonNullAssertion: index must exist if it is defined
                    const pk = index === undefined ? entity.table.definition.pk : entity.table.definition.indexes![index].pk
                    if (expression?.comparands.includes(pk)) {
                        return expression
                    }

                    const formatted = entity.asFormattedOperand(pk)
                    const pkCondition = stored[pk as keyof typeof stored].eq(formatted)

                    return isDefined(expression) ? Condition.from({ and: [pkCondition, expression] }) : pkCondition
                },
            }),
        })
        this._scope = scope
        this._index = index
        this._dynamodb.needsGenerator = true

        // this._builder.addIndexResult(entity, entity.table.definition.indexes?.[index as string])

        if (this._scope !== 'table') {
            this.asValidator(this.schema.result ?? this.entity.storageShape)
        }
    }

    public override get _output(): (
        | TypescriptOutput<TypescriptTypeWalkerContext>
        | TypescriptOutput<TypescriptZodWalkerContext>
        | GenericOutput
    )[] {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.command.ts'),
                type: 'typescript',
                subtype: undefined,
                isTypeOnly: false,
                definition: (node, context) => {
                    node._attributes.typescript['value:path'] = context.targetPath
                    node._attributes.typescript['type:path'] = context.targetPath

                    return this.writeCommand({
                        context,
                        commandInput: context.type(dynamodbSymbols.QueryCommandInput()),
                        command: (writer) => {
                            if (isDefined(this._index)) {
                                writer.writeLine(`IndexName: ${JSON.stringify(this._index)},`)
                            }
                            this.schema.writeCommand({ writer, commandOptions: this._commandOptions })
                        },
                    })
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
        ]
    }

    public override buildHandler(context: TypescriptTypeWalkerContext): string {
        return this._buildHandler({
            context,
            command: (writer) => {
                const paginateQuery = context.value(dynamodbSymbols.paginateQuery())

                writer
                    .write(`for await (const page of ${paginateQuery}({ client: this.table.client }, command))`)
                    .inlineBlock(() => {
                        writer
                            .blankLine()
                            .write('for (const item of (page.Items ?? [])) ')
                            .inlineBlock(() => {
                                if (this._scope === 'table') {
                                    writer.writeLine('yield { right: item, status: "success" as const, $response: page }')
                                } else {
                                    const schema = this.schema.result ?? this.entity.storageShape
                                    writer.writeLine(
                                        `yield { ...${context.value(schema)}.parse(item), status: 'success' as const, $response: page }`,
                                    )
                                }
                            })
                    })
            },
        })
    }
}
