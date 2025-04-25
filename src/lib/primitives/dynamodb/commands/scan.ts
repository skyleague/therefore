import type { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb'
import { replaceExtension } from '../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../cst/cst.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../../visitor/typescript/typescript-zod.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType, StorageShapeType } from '../entity.js'
import type { ConditionBuilder } from '../expressions/condition.js'
import type { ProjectionBuilder } from '../expressions/projection.js'
import { dynamodbSymbols } from '../symbols.js'
import type { EntityAttributeFormatters, IndexDefinition } from '../table.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from './base.js'
import { DynamodbCommandSchemaBuilder } from './builder.js'
import type { IndexPick } from './query.js'

// type Builders<Entity extends DynamoDbEntityType> = {
//     projection?: ProjectionBuilder<Entity['storageShape']>
//     filter?: ConditionBuilder<Entity['storageShape']>
// }

// type IndexesOf<Entity extends DynamoDbEntityType> = NonNullable<Entity['table']['definition']['indexes']>
// type GetIndex<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>> = IndexesOf<Entity>[Index]

// type IndexBuilders<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>> = {
//     projection?: ProjectionBuilder<IndexPick<Entity, Index>>
//     filter?: ConditionBuilder<IndexPick<Entity, Index>>
// }

export type ScanCommandOptions = Omit<OmitLegacyOptions<OmitExpressions<ScanCommandInput>>, 'TableName'>

export interface DynamodbScanCommandOptions<
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
                    projection?: ProjectionBuilder<IndexPick<StorageShapeType<Entity, BaseShape>, Indexes, ChosenIndex>>
                    filter?: ConditionBuilder<IndexPick<StorageShapeType<Entity, BaseShape>, Indexes, ChosenIndex>>
                }
              : {
                    projection?: ProjectionBuilder<StorageShapeType<Entity, BaseShape>>
                    filter?: ConditionBuilder<StorageShapeType<Entity, BaseShape>>
                })
        | undefined
    commandOptions?: ScanCommandOptions | undefined
    scope: 'entity' | 'table'
    index?: ChosenIndex
}

export class DynamodbScanCommandType<
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
    ScanCommand,
    ScanCommandOptions,
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
    public override _type = 'dynamodb:command:scan' as const
    public _scope: 'entity' | 'table'
    public _index: ChosenIndex | undefined

    public constructor({
        expressions,
        commandOptions = {},
        entity,
        index,
        scope,
    }: DynamodbScanCommandOptions<
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
            }),
        })
        this._scope = scope
        this._index = index
        this._dynamodb.needsGenerator = true

        // this._builder.addIndexResult(entity, entity.table.definition.indexes?.[index as string])

        this.asValidator(this.schema.result ?? this.entity.storageShape)
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
                        commandInput: context.type(dynamodbSymbols.ScanCommandInput()),
                        command: (writer) => {
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
                const paginateScan = context.value(dynamodbSymbols.paginateScan())

                writer.write(`for await (const page of ${paginateScan}({ client: this.table.client }, command))`).block(() => {
                    writer.write('for (const item of (page.Items ?? [])) ').block(() => {
                        const schema = this.schema.result ?? this.entity.storageShape
                        if (this.entity.table.definition.validator === 'zod') {
                            writer
                                .writeLine(`const parsed = ${context.value(schema)}.safeParse(item)`)
                                .write('if (parsed.success)')
                                .block(() => {
                                    writer.writeLine('yield { success: true, right: parsed.data, $response: page }')
                                })
                                .write('else')
                                .block(() => {
                                    writer.writeLine('yield { success: false, left: parsed.error, $response: page }')
                                })
                        } else {
                            writer.writeLine(`yield { ...${context.value(schema)}.parse(item), $response: page }`)
                        }
                    })
                })
            },
        })
    }
}
