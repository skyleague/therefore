import type { GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb'
import { replaceExtension } from '../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../cst/cst.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../../visitor/typescript/typescript-zod.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import type { ProjectionBuilder } from '../expressions/projection.js'
import { dynamodbSymbols } from '../symbols.js'
import type { EntityAttributeFormatters, IndexDefinition } from '../table.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from './base.js'
import { DynamodbCommandSchemaBuilder } from './builder.js'

type Builders<StorageShape extends ObjectType> = {
    projection?: ProjectionBuilder<StorageShape>
}

type GetCommandOptions = Omit<OmitLegacyOptions<OmitExpressions<GetCommandInput>>, 'Key' | 'TableName'>

export interface DynamodbGetItemCommandOptions<
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
    expressions?:
        | Builders<
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
        | undefined
    commandOptions?: GetCommandOptions | undefined
}

export class DynamodbGetItemCommandType<
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
    GetCommand,
    GetCommandOptions,
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
    public override _type = 'dynamodb:command:get-item' as const

    public constructor({
        entity,
        commandOptions = {},
        expressions = {},
    }: DynamodbGetItemCommandOptions<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>) {
        super({
            entity,
            commandOptions,
            schema: new DynamodbCommandSchemaBuilder({
                entity,
                inferKeySchema: true,

                projection: expressions?.projection,
            }),
        })
        this.entity = entity

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
                        commandInput: context.type(dynamodbSymbols.GetCommandInput()),
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
                const GetCommand = context.value(dynamodbSymbols.GetCommand())

                writer.writeLine(`const result = await this.table.client.send(new ${GetCommand}(command))`)
                writer.write('if (result.Item === undefined)').block(() => {
                    writer.writeLine('return { right: undefined, $response: result }')
                })
                const schema = this.schema.result ?? this.entity.storageShape
                if (this.entity.table.definition.validator === 'zod') {
                    writer
                        .writeLine(`const parsed = ${context.value(schema)}.safeParse(result.Item)`)
                        .write('if (parsed.success)')
                        .block(() => {
                            writer.writeLine('return { success: true, right: parsed.data, $response: result }')
                        })
                    writer.writeLine('return { success: false, left: parsed.error, $response: result }')
                } else {
                    writer.writeLine(`return { ...${context.value(schema)}.parse(result.Item), $response: result }`)
                }
            },
        })
    }
}
