import type { GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import type { TypescriptWalkerContext } from '../../../../visitor/typescript/typescript.js'
import { createWriter } from '../../../../writer.js'
import type { DynamoDbEntityType } from '../../entity.js'
import {} from '../../expressions/condition.js'
import type { ProjectionBuilder } from '../../expressions/projection.js'
import {} from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from '../base.js'

type Builders<Entity extends DynamoDbEntityType> = {
    projection?: ProjectionBuilder<Entity['shape']>
}

type CommandOptions = Omit<OmitLegacyOptions<OmitExpressions<GetCommandInput>>, 'Key' | 'TableName'>

export interface DynamodbGetItemCommandOptions<Entity extends DynamoDbEntityType> {
    entity: Entity
    expressions?: Builders<Entity> | undefined
    commandOptions?: CommandOptions | undefined
}

export class DynamodbGetItemCommandType<Entity extends DynamoDbEntityType = DynamoDbEntityType> extends DynamodbBaseCommandType<
    GetCommand,
    CommandOptions,
    Entity
> {
    public override _type = 'dynamodb:command:get-item' as const

    public constructor({ entity, commandOptions = {}, expressions = {} }: DynamodbGetItemCommandOptions<Entity>) {
        super({ entity, commandOptions })
        this.entity = entity

        this._builder.addKey(this.entity)
        this._builder.addProjectionExpression(expressions?.projection)
        this._builder.addInput(this._builder.context._inputSchema)
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.command.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const self = this
                    return this._builder.writeCommand({
                        node,
                        context,
                        commandInput: context.reference(dynamodbSymbols.GetCommandInput()),
                        commandLines: function* () {
                            yield self._builder.writeKey()
                            yield self._builder.writeProjectionExpression()
                            yield self._builder.writeAttributeNames()
                            yield self._builder.writeAttributeValues()
                            yield ''
                            yield self._builder.writeCommandOptions(self._commandOptions)
                        },
                    })
                },
            },
            ...(super._output ?? []),
        ]
    }

    public override buildHandler(context: TypescriptWalkerContext): string {
        const self = this
        return this._buildHandler({
            context,
            commandLines: function* () {
                const GetCommand = context.value(dynamodbSymbols.GetCommand())

                const writer = createWriter()

                writer.writeLine(`const result = await this.table.client.send(new ${GetCommand}(command))`)
                writer.write('if (result.Item === undefined)').block(() => {
                    writer.writeLine('return { right: null, $response: result }')
                })
                writer.writeLine(
                    `return { ...${context.value(self._builder.result ?? self.entity.shape)}.parse(result.Item), $response: result }`,
                )

                yield writer.toString()
            },
        })
    }
}

export function $getItemCommand<Entity extends DynamoDbEntityType>(args: DynamodbGetItemCommandOptions<Entity>) {
    return new DynamodbGetItemCommandType<Entity>(args)
}
