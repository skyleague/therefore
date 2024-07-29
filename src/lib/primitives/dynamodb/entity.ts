import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import { createWriter } from '../../writer.js'
import { $const } from '../const/const.js'
import { $object, type ObjectType, type ShapeToInfer } from '../object/object.js'
import { DynamodbGetItemCommandType } from './commands/get-item/command.js'
import { DynamodbPutItemCommandType } from './commands/put-item/command.js'
import { DynamodbQueryCommandType } from './commands/query/command.js'
import { DynamodbScanCommandType } from './commands/scan/command.js'
import { DynamodbUpdateItemCommandType } from './commands/update-item/command.js'
import { dynamodbSymbols } from './symbols.js'
import type { DynamoDbTableType } from './table.js'

type ShapeFormatString<Shape extends ObjectType> =
    | `${string}${keyof Shape['shape'] & string}${string}`
    | `${string}${keyof Shape['shape'] & string}`
    | `${keyof Shape['shape'] & string}${string}`
    | (keyof Shape['shape'] & string)

export class DynamoDbEntityType<
    Shape extends ObjectType = ObjectType,
    const EntityType extends string = string,
    Table extends DynamoDbTableType = DynamoDbTableType,
> extends Node {
    public override _type = 'dynamodb:entity' as const
    public override _canReference?: boolean = false
    public table: Table
    public entityType: EntityType
    // public shape: ObjectType<
    //     Shape['shape'] & Table['shape']['shape'] & Record<(typeof this.table)['definition']['entityType'], ConstType<EntityType>>
    // >
    public shape: ObjectType<Shape['shape'] & Table['shape']['shape']>
    public declare infer: ShapeToInfer<(typeof this.shape)['shape']>
    public _attributeFormatters: Record<string, string> = {}
    public _commands: Record<
        string,
        | DynamodbUpdateItemCommandType
        | DynamodbGetItemCommandType
        | DynamodbPutItemCommandType
        | DynamodbScanCommandType
        | DynamodbQueryCommandType
    > = {}

    public constructor(
        table: Table,
        entityType: EntityType,
        shape: Shape,
        keyFormatters: Record<string, ShapeFormatString<Shape>>,
    ) {
        super()
        this.table = table
        this.entityType = entityType
        this.shape = table.shape
            .merge(shape)
            .merge($object({ [this.table.definition.entityType]: $const(entityType) }) as ObjectType)
            .validator() as typeof this.shape

        let parentName: string | undefined

        this._transform ??= {}
        this._transform.symbolName = (name) => {
            parentName = name
            return `${name}EntityClient`
        }

        this._transform
        this.shape._transform ??= {}
        this.shape._transform.symbolName = (name) => `${parentName ?? name}Entity`
        this._connections = [this.shape]
        this._children = [this.shape]

        this._attributeFormatters = {
            ...keyFormatters,
        }
        Object.defineProperty(this, '_connections', {
            get: () => [this.shape, ...Object.values(this._commands)],
        })
        Object.defineProperty(this, '_children', {
            get: () => [this.shape, ...Object.values(this._commands)],
        })
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.table.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const UpdateCommand = context.value(dynamodbSymbols.UpdateCommand())
                    const GetCommand = context.value(dynamodbSymbols.GetCommand())
                    const PutCommand = context.value(dynamodbSymbols.PutCommand())
                    const _ScanCommand = context.value(dynamodbSymbols.ScanCommand())
                    const paginateScan = context.value(dynamodbSymbols.paginateScan())
                    const _QueryCommand = context.value(dynamodbSymbols.QueryCommand())
                    const paginateQuery = context.value(dynamodbSymbols.paginateQuery())
                    const DynamoDBServiceException = context.reference(dynamodbSymbols.DynamoDBServiceException())

                    const entityWriter = createWriter()
                    entityWriter.write(context.declare('class', node)).block(() => {
                        entityWriter.writeLine(`public entityType = '${this.entityType}' as const`)
                        entityWriter.writeLine(`public table: ${context.reference(this.table)}`)

                        entityWriter
                            .newLine()
                            .write('public constructor(')
                            .inlineBlock(() => {
                                entityWriter.writeLine('table')
                            })
                            .write(':')
                            .inlineBlock(() => {
                                entityWriter.writeLine(`table: ${context.reference(this.table)}`)
                            })
                            .write(')')
                            .block(() => {
                                entityWriter.writeLine('this.table = table')
                            })

                        for (const [operationId, command] of Object.entries(this._commands).sort()) {
                            entityWriter
                                .blankLine()
                                .write(
                                    `public async ${command instanceof DynamodbScanCommandType || command instanceof DynamodbQueryCommandType ? '*' : ''}${operationId}(`,
                                )

                            if (Object.keys(command._input.shape).length > 0) {
                                entityWriter
                                    .inlineBlock(() => {
                                        entityWriter.write('input')
                                    })
                                    .write(':')
                                    .inlineBlock(() => {
                                        entityWriter.write(`input: ${context.reference(command._input)}`)
                                    })
                            }

                            entityWriter.write(')').block(() => {
                                entityWriter
                                    .write(`const command = ${context.reference(command)}(`)
                                    .inlineBlock(() => {
                                        entityWriter.write('tableName: this.table.tableName,')
                                        if (Object.keys(command._input.shape).length > 0) {
                                            entityWriter.write('input,')
                                        }
                                    })
                                    .write(')')

                                entityWriter
                                    .writeLine('try ')
                                    .block(() => {
                                        if (command instanceof DynamodbUpdateItemCommandType) {
                                            entityWriter.write(
                                                `const result = await this.table.client.send(new ${UpdateCommand}(command))`,
                                            )

                                            if (command._commandOptions.ReturnValues === 'ALL_NEW') {
                                                entityWriter.writeLine(
                                                    `const data = ${context.value(this.shape)}.parse(result.Attributes ?? {})`,
                                                )
                                                entityWriter.writeLine('return { ...data, $response: result }')
                                            } else if (command._commandOptions.ReturnValues === 'ALL_OLD') {
                                                entityWriter.write('if (result.Attributes !== undefined) ').block(() => {
                                                    entityWriter.writeLine(
                                                        `const data = ${context.value(this.shape)}.parse(result.Attributes)`,
                                                    )
                                                    entityWriter.writeLine('return { ...data, $response: result }')
                                                })
                                                entityWriter.writeLine('return { right: null, $response: result }')
                                            } else if (
                                                command._commandOptions.ReturnValues === 'UPDATED_NEW' ||
                                                command._commandOptions.ReturnValues === 'UPDATED_OLD'
                                            ) {
                                                entityWriter.writeLine(
                                                    'return { right: data.Attributes ?? null, $response: result }',
                                                )
                                            } else {
                                                entityWriter.writeLine('return { right: null, $response: result }')
                                            }
                                        } else if (command instanceof DynamodbGetItemCommandType) {
                                            entityWriter.writeLine(
                                                `const result = await this.table.client.send(new ${GetCommand}(command))`,
                                            )
                                            entityWriter.write('if (result.Item === undefined)').block(() => {
                                                entityWriter.writeLine('return { right: null, $response: result }')
                                            })
                                            entityWriter.writeLine(
                                                `return { ...${context.value(command._result ?? this.shape)}.parse(result.Item), $response: result }`,
                                            )
                                        } else if (command instanceof DynamodbPutItemCommandType) {
                                            entityWriter.writeLine(
                                                `const result = await this.table.client.send(new ${PutCommand}(command))`,
                                            )
                                            if (command._commandOptions.ReturnValues === 'ALL_OLD') {
                                                entityWriter.write('if (result.Item !== undefined) ').block(() => {
                                                    entityWriter.writeLine(
                                                        `const data = ${context.value(this.shape)}.parse(result.Item)`,
                                                    )
                                                    entityWriter.writeLine('return { ...data, $response: result }')
                                                })
                                            } else {
                                                entityWriter.writeLine('return { right: null, $response: result }')
                                            }
                                        } else if (command instanceof DynamodbScanCommandType) {
                                            entityWriter
                                                .write(
                                                    `for await (const page of ${paginateScan}({ client: this.table.client }, command))`,
                                                )
                                                .block(() => {
                                                    entityWriter.writeLine(
                                                        `const items = (page.Items ?? []).map(x => ${context.value(command._result ?? this.shape)}.parse(x))`,
                                                    )
                                                    entityWriter.writeLine(
                                                        'const rights = items.filter(x => "right" in x).map(x=>x.right)',
                                                    )
                                                    entityWriter.writeLine(
                                                        'const lefts = items.filter(x => "left" in x).map(x=>x.left)',
                                                    )
                                                    entityWriter
                                                        .blankLine()
                                                        .writeLine('if (lefts.length > 0)')
                                                        .block(() => {
                                                            entityWriter.writeLine(
                                                                'yield { left: rights, validationErrors: lefts, $response: page }',
                                                            )
                                                        })
                                                        .writeLine('else')
                                                        .block(() => {
                                                            entityWriter.writeLine('yield { right: rights, $response: page }')
                                                        })
                                                })
                                        } else if (command instanceof DynamodbQueryCommandType) {
                                            entityWriter
                                                .write(
                                                    `for await (const page of ${paginateQuery}({ client: this.table.client }, command))`,
                                                )
                                                .block(() => {
                                                    entityWriter.writeLine(
                                                        `const items = (page.Items ?? []).map(x => ${context.value(command._result ?? this.shape)}.parse(x))`,
                                                    )
                                                    entityWriter.writeLine(
                                                        'const rights = items.filter(x => "right" in x).map(x=>x.right)',
                                                    )
                                                    entityWriter.writeLine(
                                                        'const lefts = items.filter(x => "left" in x).map(x=>x.left)',
                                                    )
                                                    entityWriter
                                                        .blankLine()
                                                        .writeLine('if (lefts.length > 0)')
                                                        .block(() => {
                                                            entityWriter.writeLine(
                                                                'yield { left: rights, validationErrors: lefts, $response: page }',
                                                            )
                                                        })
                                                        .writeLine('else')
                                                        .block(() => {
                                                            entityWriter.writeLine('yield { right: rights, $response: page }')
                                                        })
                                                })
                                        }
                                    })
                                    .write('catch (error) ')
                                    .block(() => {
                                        entityWriter.writeLine(
                                            `${command instanceof DynamodbScanCommandType || command instanceof DynamodbQueryCommandType ? 'yield' : 'return'} { left: error as ${DynamoDBServiceException}, $response: error }`,
                                        )
                                    })
                            })
                        }
                    })

                    return entityWriter.toString()
                },
            },
            ...(super._output ?? []),
        ]
    }

    public getItem<const Method extends string>(_method: Method) {}
}

export function $entity<Shape extends ObjectType, const EntityType extends string, Table extends DynamoDbTableType>(
    table: Table,
    entityType: EntityType,
    shape: Shape,
    keyFormatters: Record<Table['definition']['pk'] | NonNullable<Table['definition']['sk']>, ShapeFormatString<Shape>>,
) {
    return new DynamoDbEntityType<Shape, EntityType, Table>(table, entityType, shape, keyFormatters)
}
