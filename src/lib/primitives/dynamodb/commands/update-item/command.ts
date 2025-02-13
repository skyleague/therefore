import type { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import type { TypescriptTypeWalkerContext } from '../../../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../../../visitor/typescript/typescript-zod.js'
import { createWriter } from '../../../../writer.js'
import type { DynamoDbEntityType } from '../../entity.js'
import type { ConditionBuilder } from '../../expressions/condition.js'
import type { UpdateBuilder } from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from '../base.js'

type Builders<Entity extends DynamoDbEntityType> = {
    condition?: ConditionBuilder<Entity['shape']>
    update: UpdateBuilder<Entity['shape']>
}
type CommandOptions = Omit<OmitLegacyOptions<OmitExpressions<UpdateCommandInput>>, 'Key' | 'TableName'>

export interface DynamodbUpdateItemCommandOptions<Entity extends DynamoDbEntityType> {
    entity: Entity
    expressions: Builders<Entity>
    commandOptions?: CommandOptions | undefined
}

export class DynamodbUpdateItemCommandType<
    Entity extends DynamoDbEntityType = DynamoDbEntityType,
> extends DynamodbBaseCommandType<UpdateCommand, CommandOptions, Entity> {
    public override _type = 'dynamodb:command:update-item' as const

    public constructor({ entity, expressions, commandOptions = {} }: DynamodbUpdateItemCommandOptions<Entity>) {
        super({ entity, commandOptions })

        this._builder.addKey(entity)
        this._builder.addConditionExpression(expressions?.condition)
        this._builder.addUpdateExpression(expressions?.update, entity)
        this._builder.addInput(this._builder.context._inputSchema)
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

                    const self = this
                    return this._builder.writeCommand({
                        node,
                        context,
                        commandInput: context.type(dynamodbSymbols.UpdateCommandInput()),
                        commandLines: function* () {
                            yield self._builder.writeKey()
                            yield self._builder.writeUpdateExpression()
                            yield self._builder.writeConditionExpression()
                            yield self._builder.writeAttributeNames()
                            yield self._builder.writeAttributeValues()
                            yield ''
                            yield self._builder.writeCommandOptions(self._commandOptions)
                        },
                    })
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
        ]
    }

    public override buildHandler(context: TypescriptTypeWalkerContext): string {
        const self = this
        return this._buildHandler({
            context,
            commandLines: function* () {
                const UpdateCommand = context.value(dynamodbSymbols.UpdateCommand())
                const writer = createWriter()

                writer.writeLine(`const result = await this.table.client.send(new ${UpdateCommand}(command))`)
                if (self._commandOptions.ReturnValues === 'ALL_NEW') {
                    writer.writeLine(`const data = ${context.value(self.entity.shape)}.parse(result.Attributes ?? {})`)
                    writer.writeLine('return { ...data, $response: result }')
                } else if (self._commandOptions.ReturnValues === 'ALL_OLD') {
                    writer.write('if (result.Attributes !== undefined) ').block(() => {
                        writer.writeLine(`const data = ${context.value(self.entity.shape)}.parse(result.Attributes)`)
                        writer.writeLine('return { ...data, $response: result }')
                    })
                    writer.writeLine('return { right: null, $response: result }')
                } else if (
                    self._commandOptions.ReturnValues === 'UPDATED_NEW' ||
                    self._commandOptions.ReturnValues === 'UPDATED_OLD'
                ) {
                    writer.writeLine('return { right: data.Attributes ?? null, $response: result }')
                } else {
                    writer.writeLine('return { right: null, $response: result }')
                }

                yield writer.toString()
            },
        })
    }
}
