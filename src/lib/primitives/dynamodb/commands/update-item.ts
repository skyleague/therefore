import type { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { replaceExtension } from '../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../cst/cst.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../../visitor/typescript/typescript-zod.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import type { ConditionBuilder } from '../expressions/condition.js'
import type { UpdateBuilder } from '../expressions/update.js'
import { dynamodbSymbols } from '../symbols.js'
import type { EntityAttributeFormatters, IndexDefinition } from '../table.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from './base.js'
import { DynamodbCommandSchemaBuilder } from './builder.js'

type Builders<StorageShape extends ObjectType> = {
    condition?: ConditionBuilder<StorageShape>
    update: UpdateBuilder<StorageShape>
}
type UpdateItemCommandOptions = Omit<OmitLegacyOptions<OmitExpressions<UpdateCommandInput>>, 'Key' | 'TableName'>

export interface DynamodbUpdateItemCommandOptions<
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
> {
    entity: DynamoDbEntityType<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>
    expressions: Builders<
        DynamoDbEntityType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >['storageShape']
    >
    commandOptions?: UpdateItemCommandOptions | undefined
}

export class DynamodbUpdateItemCommandType<
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
> extends DynamodbBaseCommandType<
    UpdateCommand,
    UpdateItemCommandOptions,
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
    public override _type = 'dynamodb:command:update-item' as const

    public constructor({
        entity,
        expressions,
        commandOptions = {},
    }: DynamodbUpdateItemCommandOptions<
        Entity,
        BaseShape,
        Pk,
        Sk,
        CreatedAt,
        UpdatedAt,
        EntityType,
        Indexes,
        AttributeFormatters
    >) {
        super({
            entity,
            commandOptions,
            schema: new DynamodbCommandSchemaBuilder({
                entity,
                inferKeySchema: true,

                condition: expressions?.condition,
                update: expressions?.update,
            }),
        })
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
                        commandInput: context.type(dynamodbSymbols.UpdateCommandInput()),
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
                const UpdateCommand = context.value(dynamodbSymbols.UpdateCommand())

                writer.writeLine(`const result = await this.table.client.send(new ${UpdateCommand}(command))`)
                if (this._commandOptions.ReturnValues === 'ALL_NEW') {
                    writer.writeLine(`const data = ${context.value(this.entity.storageShape)}.parse(result.Attributes ?? {})`)
                    writer.writeLine('return { ...data, $response: result }')
                } else if (this._commandOptions.ReturnValues === 'ALL_OLD') {
                    writer.write('if (result.Attributes !== undefined) ').block(() => {
                        writer.writeLine(`const data = ${context.value(this.entity.storageShape)}.parse(result.Attributes)`)
                        writer.writeLine('return { ...data, $response: result }')
                    })
                    writer.writeLine('return { right: null, $response: result }')
                } else if (
                    this._commandOptions.ReturnValues === 'UPDATED_NEW' ||
                    this._commandOptions.ReturnValues === 'UPDATED_OLD'
                ) {
                    writer.writeLine('return { right: data.Attributes ?? null, $response: result }')
                } else {
                    writer.writeLine('return { right: null, $response: result }')
                }
            },
        })
    }
}
