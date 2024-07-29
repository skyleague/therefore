import type { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
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
import { type UpdateBuilder, updateExpression } from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'

type Builders<Entity extends DynamoDbEntityType> = {
    condition?: ConditionBuilder<Entity['shape']>
    update: UpdateBuilder<Entity['shape']>
}
type CommandOptions = Omit<
    {
        [k in keyof UpdateCommandInput]?: UpdateCommandInput[k] extends infer S
            ? S extends string | undefined
                ? S
                : never
            : never
    },
    'Key'
>

export class DynamodbUpdateItemCommandType<Entity extends DynamoDbEntityType = DynamoDbEntityType> extends Node {
    public override _type = 'dynamodb:command:update-item' as const
    public override _canReference?: boolean = false
    public declare infer: UpdateCommand

    public entity: Entity
    public builders: Builders<Entity>

    public _condition: ReturnType<typeof conditionExpression> | undefined
    public _update: ReturnType<typeof updateExpression> | undefined
    public _input: ObjectType
    public _context: DynamodbExpressionContext<Entity['shape']>
    public _key: Record<string, string>
    public _commandOptions: Partial<UpdateCommandInput>

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

        this._key = Object.fromEntries(
            [entity.table.definition.pk, entity.table.definition.sk].filter(isDefined).map((k) => {
                let formatted = entity._attributeFormatters[k] ?? k
                for (const [, input] of formatted.matchAll(/\{(\w+)\}/g)) {
                    const schema = this._context.getShapeSchema({ key: input as string, shouldUnwrap: true })
                    formatted = formatted.replace(`{${input}}`, `$\{${input}\}`)
                    this._context.addInputSchema({ key: input as string, schema })
                }
                return [k, formatted]
            }),
        )
        this._condition = this.builders.condition
            ? conditionExpression({ build: this.builders.condition, context: this._context })
            : undefined
        this._update = this.builders.update
            ? updateExpression({
                  entity,
                  build: this.builders.update,
                  context: this._context,
              })
            : undefined

        let parentName: string | undefined
        this._input = $object(this._context._inputSchema)
        this._input._transform = {
            symbolName: (name) => `${parentName ?? name}Input`,
        }
        this._transform ??= {}
        this._transform.symbolName = (name) => {
            parentName = name
            return `${camelcase(name)}Command`
        }
        this._connections = [this._input]
        this._children = [this._input]

        if (entity._commands[commandName] !== undefined) {
            throw new Error(`Command with name ${commandName} already exists`)
        }
        entity._commands[commandName] = this as unknown as DynamodbUpdateItemCommandType
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.table.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const UpdateCommandInput = context.reference(dynamodbSymbols.UpdateCommandInput())

                    const commandWriter = createWriter()
                    commandWriter
                        .write(context.declare('const', node))
                        .write(' = ')
                        .write('(')
                        .block(() => {
                            commandWriter.writeLine('tableName,')
                            commandWriter.write('input: ').block(() => {
                                for (const key in this._input.shape) {
                                    commandWriter.writeLine(`${key},`)
                                }
                            })
                        })
                        .write(':')
                        .block(() => {
                            commandWriter.writeLine('tableName: string,')
                            commandWriter.writeLine(`input: ${context.reference(this._input)}`)
                        })
                        .write(`): ${UpdateCommandInput} => `)
                        .block(() => {
                            commandWriter.write('return').block(() => {
                                commandWriter.writeLine('TableName: tableName,')
                                commandWriter
                                    .writeLine('Key: ')
                                    .inlineBlock(() => {
                                        for (const [key, value] of Object.entries(this._key)) {
                                            commandWriter.write(`${key}: \`${value}\`,`)
                                        }
                                    })
                                    .write(',')
                                if (this._condition !== undefined) {
                                    commandWriter.writeLine(`ConditionExpression: ${JSON.stringify(this._condition.expression)},`)
                                }
                                if (this._update !== undefined) {
                                    commandWriter.writeLine(`UpdateExpression: ${JSON.stringify(this._update?.expression)},`)
                                }
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
                                if (Object.keys(this._commandOptions).length > 0) {
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

export function $updateItemCommand<Entity extends DynamoDbEntityType>(
    entity: Entity,
    commandName: string,
    builders: Builders<Entity>,
    commandOptions?: CommandOptions,
) {
    return new DynamodbUpdateItemCommandType<Entity>(entity, commandName, builders, commandOptions)
}
