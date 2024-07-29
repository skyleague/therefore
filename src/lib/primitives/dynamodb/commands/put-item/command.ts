import type { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb'
import { isDefined, omitUndefined } from '@skyleague/axioms'
import camelcase from 'camelcase'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import { Node } from '../../../../cst/node.js'
import { createWriter } from '../../../../writer.js'
import { $object, type ObjectType } from '../../../object/object.js'
import { $string } from '../../../string/string.js'
import type { DynamoDbEntityType } from '../../entity.js'
import {} from '../../expressions/condition.js'
import { DynamodbExpressionContext } from '../../expressions/context.js'
import type { projectionExpression } from '../../expressions/projection.js'
import {} from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'

// type Builders<Entity extends DynamoDbEntityType> = {
//     projection: ProjectionBuilder<Entity['shape']>
// }

type CommandOptions = Omit<
    { [k in keyof PutCommandInput]?: PutCommandInput[k] extends string | number ? PutCommandInput[k] : never },
    'TableName'
>

export class DynamodbPutItemCommandType<Entity extends DynamoDbEntityType = DynamoDbEntityType> extends Node {
    public override _type = 'dynamodb:command:put-item' as const
    public override _canReference?: boolean = false
    public declare infer: PutCommand

    public entity: Entity

    // public builders: Builders<Entity>

    public _input: ObjectType
    public _projection: ReturnType<typeof projectionExpression> | undefined
    public _context: DynamodbExpressionContext<Entity['shape']>
    public _key: Record<string, string>
    public _commandOptions: Partial<PutCommandInput>

    public constructor(
        entity: Entity,
        commandName: string,
        // builders: Builders<Entity>,
        commandOptions: CommandOptions | undefined,
    ) {
        super()
        this.entity = entity
        // this.builders = builders
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
            this._context.addInputSchema({ key, schema: value })
        }

        if (entity.table.definition.createdAt !== undefined) {
            this._context.addInputSchema({ key: entity.table.definition.createdAt, schema: $string().optional() })
        }
        if (entity.table.definition.updatedAt !== undefined) {
            this._context.addInputSchema({ key: entity.table.definition.updatedAt, schema: $string().optional() })
        }

        let parentName: string | undefined

        this._input = $object(this._context._inputSchema)
        this._input._transform = { symbolName: (name) => `${parentName ?? name}Input` }

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
        entity._commands[commandName] = this as unknown as DynamodbPutItemCommandType
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.table.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const PutCommandInput = context.reference(dynamodbSymbols.PutCommandInput())

                    const commandWriter = createWriter()
                    commandWriter
                        .write(context.declare('const', node))
                        .write(' = ')
                        .write('(')
                        .block(() => {
                            commandWriter.writeLine('tableName,')
                            commandWriter.write('input: ').block(() => {
                                for (const key of Object.keys(this._input.shape).sort()) {
                                    commandWriter.writeLine(`${key},`)
                                }
                            })
                        })
                        .write(':')
                        .block(() => {
                            commandWriter.writeLine('tableName: string,')
                            commandWriter.writeLine(`input: ${context.reference(this._input)}`)
                        })
                        .write(`): ${PutCommandInput} => `)
                        .block(() => {
                            if (
                                this.entity.table.definition.createdAt !== undefined ||
                                this.entity.table.definition.updatedAt !== undefined
                            ) {
                                commandWriter.writeLine('const _now = new Date().toISOString()')
                            }
                            commandWriter.write('return').block(() => {
                                commandWriter.writeLine('TableName: tableName,')

                                const hasOptionalValues = Object.values(this._input.shape).some((s) => s._type === 'optional')
                                commandWriter
                                    .write('Item: ')
                                    .write(hasOptionalValues ? 'Object.fromEntries(Object.entries(' : '')
                                    .block(() => {
                                        commandWriter.writeLine('// Key elements')
                                        for (const [key, value] of Object.entries(this._key)) {
                                            commandWriter.writeLine(`${key}: \`${value}\`,`)
                                        }
                                        commandWriter.writeLine(
                                            `${this.entity.table.definition.entityType}: '${this.entity.entityType}',`,
                                        )
                                        if (this.entity.table.definition.createdAt !== undefined) {
                                            commandWriter.writeLine(
                                                `${this.entity.table.definition.createdAt}: ${this.entity.table.definition.createdAt} ?? _now,`,
                                            )
                                        }
                                        if (this.entity.table.definition.updatedAt !== undefined) {
                                            commandWriter.writeLine(
                                                `${this.entity.table.definition.updatedAt}: ${this.entity.table.definition.updatedAt} ?? _now,`,
                                            )
                                        }

                                        commandWriter.blankLine().writeLine('// Other properties')
                                        for (const key of Object.keys(this._input.shape).sort()) {
                                            if (
                                                key === this.entity.table.definition.createdAt ||
                                                key === this.entity.table.definition.updatedAt
                                            ) {
                                                continue
                                            }
                                            commandWriter.writeLine(`${key},`)
                                        }
                                    })
                                    .write(hasOptionalValues ? ').filter(([,v])=>v!==undefined))' : '')

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

export function $putItemCommand<Entity extends DynamoDbEntityType>(
    entity: Entity,
    commandName: string,
    // builders: Builders<Entity>,
    commandOptions?: CommandOptions,
) {
    return new DynamodbPutItemCommandType<Entity>(entity, commandName, /*builders,*/ commandOptions)
}
