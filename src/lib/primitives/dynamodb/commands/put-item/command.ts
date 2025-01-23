import type { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb'
import { omit } from '@skyleague/axioms'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import type { Node } from '../../../../cst/node.js'
import type { TypescriptWalkerContext } from '../../../../visitor/typescript/typescript.js'
import { createWriter } from '../../../../writer.js'
import { $string } from '../../../string/string.js'
import type { DynamoDbEntityType } from '../../entity.js'
import type { ConditionBuilder } from '../../expressions/condition.js'
import { dynamodbSymbols } from '../../symbols.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from '../base.js'

type Builders<Entity extends DynamoDbEntityType> = {
    condition?: ConditionBuilder<Entity['shape']>
}

type CommandOptions = Omit<OmitLegacyOptions<OmitExpressions<PutCommandInput>>, 'Key' | 'TableName' | 'Item'>

export interface DynamodbPutItemCommandOptions<Entity extends DynamoDbEntityType> {
    entity: Entity
    overrides?: Partial<Entity['infer']>
    expressions?: Builders<Entity> | undefined
    commandOptions?: CommandOptions | undefined
}

export class DynamodbPutItemCommandType<Entity extends DynamoDbEntityType = DynamoDbEntityType> extends DynamodbBaseCommandType<
    PutCommand,
    CommandOptions,
    Entity
> {
    public override _type = 'dynamodb:command:put-item' as const
    public _overrides: Partial<Entity['infer']>

    public constructor({ entity, expressions, overrides, commandOptions = {} }: DynamodbPutItemCommandOptions<Entity>) {
        super({ commandOptions, entity })
        this._overrides = { ...overrides } as Partial<Entity['infer']>

        this._builder.addKey(entity)

        for (const [key, value] of Object.entries(this.entity.shape.shape)) {
            if (
                key === entity.table.definition.pk ||
                key === entity.table.definition.sk ||
                key === entity.table.definition.entityType ||
                key === entity.table.definition.createdAt ||
                key === entity.table.definition.updatedAt
            ) {
                continue
            }
            this._builder.context.addInputSchema({ key, schema: value })
        }

        if (entity.table.definition.createdAt !== undefined) {
            this._builder.context.addInputSchema({ key: entity.table.definition.createdAt, schema: $string().optional() })
        }
        if (entity.table.definition.updatedAt !== undefined) {
            this._builder.context.addInputSchema({ key: entity.table.definition.updatedAt, schema: $string().optional() })
        }

        this._builder.addConditionExpression(expressions?.condition)

        this._builder.addInput(
            omit(this._builder.context._inputSchema, Object.keys(this._overrides)) as unknown as Record<string, Node>,
        )
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
                        commandInput: context.reference(dynamodbSymbols.PutCommandInput()),
                        prefixLines: function* () {
                            if (
                                self.entity.table.definition.createdAt !== undefined ||
                                self.entity.table.definition.updatedAt !== undefined
                            ) {
                                yield 'const _now = new Date().toISOString()'
                                for (const [key, value] of Object.entries(self._overrides)) {
                                    yield `const ${key} = ${JSON.stringify(value)}`
                                }
                            }
                        },
                        commandLines: function* () {
                            yield self._builder.writeConditionExpression()

                            const hasOptionalValues = Object.values(self._builder.input?.shape ?? {}).some(
                                (s) => s._type === 'optional',
                            )

                            const itemWriter = createWriter()
                            itemWriter
                                .write('Item: ')
                                .conditionalWrite(hasOptionalValues, 'Object.fromEntries(Object.entries(')
                                .block(() => {
                                    itemWriter.writeLine('// Key elements')
                                    for (const [key, value] of Object.entries(self._builder.key ?? {})) {
                                        itemWriter.writeLine(`${key}: \`${value.image}\`,`)
                                    }
                                    itemWriter.writeLine(
                                        `${self.entity.table.definition.entityType}: '${self.entity.entityType}',`,
                                    )
                                    if (self.entity.table.definition.createdAt !== undefined) {
                                        itemWriter.writeLine(
                                            `${self.entity.table.definition.createdAt}: ${self.entity.table.definition.createdAt} ?? _now,`,
                                        )
                                    }
                                    if (self.entity.table.definition.updatedAt !== undefined) {
                                        itemWriter.writeLine(
                                            `${self.entity.table.definition.updatedAt}: ${self.entity.table.definition.updatedAt} ?? _now,`,
                                        )
                                    }

                                    if (Object.keys(self._overrides).length > 0) {
                                        itemWriter.blankLine().writeLine('// Explicit properties')
                                        for (const key in self._overrides) {
                                            itemWriter.writeLine(`${key},`)
                                        }
                                    }

                                    itemWriter.blankLine().writeLine('// Other properties')
                                    for (const key of Object.keys(self._builder.input?.shape ?? {}).sort()) {
                                        if (
                                            key === self.entity.table.definition.createdAt ||
                                            key === self.entity.table.definition.updatedAt
                                        ) {
                                            continue
                                        }
                                        itemWriter.writeLine(`${key},`)
                                    }
                                })
                                .conditionalWrite(hasOptionalValues, ').filter(([,v])=>v!==undefined))')

                            yield itemWriter.toString()
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
                const PutCommand = context.value(dynamodbSymbols.PutCommand())
                const writer = createWriter()

                writer.writeLine(`const result = await this.table.client.send(new ${PutCommand}(command))`)
                if (self._commandOptions.ReturnValues === 'ALL_OLD') {
                    writer.write('if (result.Item !== undefined) ').block(() => {
                        writer.writeLine(`const data = ${context.value(self.entity.shape)}.parse(result.Item)`)
                        writer.writeLine('return { ...data, $response: result }')
                    })
                } else {
                    writer.writeLine('return { right: null, $response: result }')
                }

                yield writer.toString()
            },
        })
    }
}

export function $putItemCommand<Entity extends DynamoDbEntityType>(args: DynamodbPutItemCommandOptions<Entity>) {
    return new DynamodbPutItemCommandType<Entity>(args)
}
