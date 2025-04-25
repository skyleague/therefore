import type { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb'
import { isDefined, isString } from '@skyleague/axioms'
import { replaceExtension } from '../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../cst/cst.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../../visitor/typescript/typescript-zod.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import type { ConditionBuilder } from '../expressions/condition.js'
import { dynamodbSymbols } from '../symbols.js'
import type { EntityAttributeFormatters, IndexDefinition } from '../table.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from './base.js'
import { DynamodbCommandSchemaBuilder } from './builder.js'
import { ddbSafeProperty } from './ddb-utils.js'

type Builders<StorageShape extends ObjectType> = {
    condition?: ConditionBuilder<StorageShape>
}

export type PutCommandOptions = Omit<OmitLegacyOptions<OmitExpressions<PutCommandInput>>, 'Key' | 'TableName' | 'Item'>

export interface DynamodbPutItemCommandOptions<
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
    commandOptions?: PutCommandOptions | undefined
}

export class DynamodbPutItemCommandType<
    const Entity extends ObjectType = ObjectType,
    const BaseShape extends ObjectType = ObjectType,
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
    PutCommand,
    PutCommandOptions,
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
    public override _type = 'dynamodb:command:put-item' as const

    public constructor({
        entity,
        expressions,
        commandOptions = {},
    }: DynamodbPutItemCommandOptions<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>) {
        super({
            commandOptions,
            entity,
            schema: new DynamodbCommandSchemaBuilder({
                entity,
                inferKeySchema: true,
                condition: expressions?.condition,
                createArguments: (schema) => {
                    const ommitted = new Set(
                        [
                            ...schema.definedSchemaKeys,
                            entity.table.definition.entityType,
                            // entity.table.definition.createdAt,
                            // entity.table.definition.updatedAt,
                        ].filter((x) => isDefined(x) && isString(x)),
                    ).difference(new Set(schema.schemaKeyInputFields))
                    const value: ObjectType<any> = entity.storageShape.omit(...ommitted)

                    const partialKeys = [entity.table.definition.createdAt, entity.table.definition.updatedAt].filter(
                        (x) => isDefined(x) && isString(x),
                    )
                    return partialKeys.length > 0
                        ? value.partial(...partialKeys).required(...schema.schemaKeyInputFields)
                        : value.required(...schema.schemaKeyInputFields)
                },
            }),
        })
    }

    public override get _output():
        | (TypescriptOutput<TypescriptTypeWalkerContext> | TypescriptOutput<TypescriptZodWalkerContext> | GenericOutput)[]
        | undefined {
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
                        commandInput: context.type(dynamodbSymbols.PutCommandInput()),
                        prefix: (writer) => {
                            if (
                                this.entity.table.definition.createdAt !== undefined ||
                                this.entity.table.definition.updatedAt !== undefined
                            ) {
                                writer.writeLine('const _now = new Date().toISOString()')
                            }
                        },
                        command: (writer) => {
                            this.schema.writeCommand({ writer, commandOptions: this._commandOptions, writeKey: false })

                            const hasOptionalValues = Object.values(this.schema.arguments?.shape ?? {}).some(
                                (s) => s._type === 'optional',
                            )

                            writer
                                .write('Item: ')
                                .conditionalWrite(hasOptionalValues, 'Object.fromEntries(Object.entries(')
                                .inlineBlock(() => {
                                    writer.writeLine('// Key elements')
                                    for (const [key, value] of Object.entries(this.schema.keySchema ?? {})) {
                                        writer.writeLine(`${key}: ${value.image},`)
                                    }
                                    if (this.entity.table.definition.entityType !== undefined) {
                                        writer.writeLine(
                                            `${this.entity.table.definition.entityType}: '${this.entity.entityType}',`,
                                        )
                                    }
                                    if (this.entity.table.definition.createdAt !== undefined) {
                                        writer.writeLine(
                                            `${this.entity.table.definition.createdAt}: ${this.entity.table.definition.createdAt} ?? _now,`,
                                        )
                                    }
                                    if (this.entity.table.definition.updatedAt !== undefined) {
                                        writer.writeLine(
                                            `${this.entity.table.definition.updatedAt}: ${this.entity.table.definition.updatedAt} ?? _now,`,
                                        )
                                    }

                                    writer.blankLine().writeLine('// Other properties')
                                    const keySchemaKeys = Object.keys(this.schema.keySchema ?? {})
                                    for (const key of Object.keys(this.schema.arguments?.shape ?? {}).sort()) {
                                        if (
                                            key === this.entity.table.definition.createdAt ||
                                            key === this.entity.table.definition.updatedAt ||
                                            keySchemaKeys.includes(key)
                                        ) {
                                            continue
                                        }
                                        const safeKey = ddbSafeProperty(key)
                                        if (safeKey.changed) {
                                            writer.writeLine(`'${safeKey.original}': ${safeKey.property},`)
                                        } else {
                                            writer.writeLine(`${key},`)
                                        }
                                    }
                                })
                                .conditionalWrite(hasOptionalValues, ').filter(([,v])=>v!==undefined))')
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
                const PutCommand = context.value(dynamodbSymbols.PutCommand())

                writer.writeLine(`const result = await this.table.client.send(new ${PutCommand}(command))`)
                if (this._commandOptions.ReturnValues === 'ALL_OLD') {
                    writer.write('if (result.Item !== undefined) ').block(() => {
                        writer.writeLine(`const data = ${context.value(this.entity.storageShape)}.parse(result.Item)`)
                        writer.writeLine('return { ...data, $response: result }')
                    })
                } else {
                    writer.writeLine('return { right: undefined, $response: result }')
                }
            },
        })
    }
}
