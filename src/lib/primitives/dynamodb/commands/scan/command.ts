import type { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb'
import { isDefined, omitUndefined } from '@skyleague/axioms'
import camelcase from 'camelcase'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import { Node } from '../../../../cst/node.js'
import { createWriter } from '../../../../writer.js'
import { $object, type ObjectType } from '../../../object/object.js'
import type { DynamoDbEntityType } from '../../entity.js'
import { type ConditionBuilder, conditionExpression } from '../../expressions/condition.js'
import { DynamodbExpressionContext } from '../../expressions/context.js'
import { type ProjectionBuilder, projectionExpression } from '../../expressions/projection.js'
import {} from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'

type Builders<Entity extends DynamoDbEntityType> = {
    projection?: ProjectionBuilder<Entity['shape']>
    filter?: ConditionBuilder<Entity['shape']>
}

type CommandOptions = Omit<
    { [k in keyof ScanCommandInput]?: ScanCommandInput[k] extends string | number ? ScanCommandInput[k] : never },
    'TableName' | 'ProjectionExpression'
>

export class DynamodbScanCommandType<Entity extends DynamoDbEntityType = DynamoDbEntityType> extends Node {
    public override _type = 'dynamodb:command:scan' as const
    public override _canReference?: boolean = false
    public declare infer: ScanCommand

    public entity: Entity

    public builders: Builders<Entity>

    public _input: ObjectType
    public _projection: ReturnType<typeof projectionExpression> | undefined
    public _filter: ReturnType<typeof conditionExpression> | undefined
    public _context: DynamodbExpressionContext<Entity['shape']>
    public _result: ObjectType | undefined
    public _commandOptions: Partial<ScanCommandInput>

    public constructor(
        entity: Entity,
        commandName: string,
        builders: Builders<Entity>,
        commandOptions: CommandOptions | undefined,
    ) {
        super()
        this.entity = entity
        this.builders = builders
        this._context = new DynamodbExpressionContext(entity.shape)
        this._commandOptions = omitUndefined(commandOptions ?? {})

        let parentName: string | undefined

        if (builders.projection !== undefined) {
            this._projection = projectionExpression({ build: builders.projection, context: this._context })
            this._result = this._projection.schema
            this._result._transform = {
                symbolName: (name) => `${parentName ?? name}Result`,
            }
        }
        if (builders.filter !== undefined) {
            this._filter = conditionExpression({ build: builders.filter, context: this._context })
        }

        this._input = $object(this._context._inputSchema)
        this._input._transform = { symbolName: (name) => `${parentName ?? name}Input` }

        this._transform ??= {}
        this._transform.symbolName = (name) => {
            parentName = name
            return `${camelcase(name)}Command`
        }
        this._connections = [this._result ?? this.entity.shape, this._input].filter(isDefined)
        this._children = [this._result, this._input].filter(isDefined)

        if (entity._commands[commandName] !== undefined) {
            throw new Error(`Command with name ${commandName} already exists`)
        }
        entity._commands[commandName] = this as unknown as DynamodbScanCommandType
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.table.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const ScanCommandInput = context.reference(dynamodbSymbols.ScanCommandInput())

                    const commandWriter = createWriter()
                    commandWriter
                        .write(context.declare('const', node))
                        .write(' = ')
                        .write('(')
                        .block(() => {
                            commandWriter.writeLine('tableName,')
                            if (Object.keys(this._input.shape).length > 0) {
                                commandWriter.write('input: ').block(() => {
                                    for (const key of Object.keys(this._input.shape).sort()) {
                                        commandWriter.writeLine(`${key},`)
                                    }
                                })
                            }
                        })
                        .write(':')
                        .block(() => {
                            commandWriter.writeLine('tableName: string,')
                            if (Object.keys(this._input.shape).length > 0) {
                                commandWriter.writeLine(`input: ${context.reference(this._input)}`)
                            }
                        })
                        .write(`): ${ScanCommandInput} => `)
                        .block(() => {
                            commandWriter.write('return').block(() => {
                                commandWriter.writeLine('TableName: tableName,')

                                if (
                                    Object.keys(this._context._attributeValues).length > 0 ||
                                    Object.keys(this._context._attributeConstValues).length > 0
                                ) {
                                    commandWriter
                                        .writeLine('ExpressionAttributeValues: ')
                                        .block(() => {
                                            for (const [input, alias] of Object.entries(this._context._attributeValues)) {
                                                commandWriter.writeLine(`${JSON.stringify(alias)}: ${input},`)
                                            }
                                            for (const [alias, input] of Object.entries(this._context._attributeConstValues)) {
                                                commandWriter.writeLine(`${JSON.stringify(alias)}: ${input},`)
                                            }
                                        })
                                        .write(',')
                                }
                                if (Object.keys(this._context._attributeNames).length > 0) {
                                    commandWriter
                                        .writeLine('ExpressionAttributeNames: ')
                                        .block(() => {
                                            for (const [input, alias] of Object.entries(this._context._attributeNames)) {
                                                commandWriter.writeLine(`${JSON.stringify(alias)}: ${JSON.stringify(input)},`)
                                            }
                                        })
                                        .write(',')
                                }
                                if (this._projection !== undefined) {
                                    commandWriter.writeLine(
                                        `ProjectionExpression: ${JSON.stringify(this._projection.expression)},`,
                                    )
                                }
                                if (this._filter !== undefined) {
                                    commandWriter.writeLine(`FilterExpression: ${JSON.stringify(this._filter.expression)},`)
                                }

                                if (Object.entries(this._commandOptions).filter(([_, v]) => v !== undefined).length > 0) {
                                    commandWriter.blankLine().writeLine('// Extra options')
                                    for (const [key, value] of Object.entries(this._commandOptions)) {
                                        commandWriter.writeLine(
                                            `${key}: ${typeof value === 'string' ? JSON.stringify(value) : value},`,
                                        )
                                    }
                                }
                            })
                        })

                    return commandWriter.toString()
                },
            },
            ...(super._output ?? []),
        ]
    }
}

export function $scanCommand<Entity extends DynamoDbEntityType>(
    entity: Entity,
    commandName: string,
    builders: Builders<Entity>,
    commandOptions?: CommandOptions,
) {
    return new DynamodbScanCommandType<Entity>(entity, commandName, builders, commandOptions)
}
