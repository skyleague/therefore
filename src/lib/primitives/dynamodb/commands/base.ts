import { isDefined, omitUndefined } from '@skyleague/axioms'
import camelcase from 'camelcase'
import type CodeBlockWriter from 'code-block-writer'
import { Node } from '../../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import { createWriter } from '../../../writer.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import { dynamodbSymbols } from '../symbols.js'
import type { EntityAttributeFormatters, IndexDefinition } from '../table.js'
import type { DynamodbCommandSchemaBuilder } from './builder.js'
import { ddbSafeProperty } from './ddb-utils.js'

export type OmitLegacyOptions<Options> = Omit<
    Options,
    'ConditionalOperator' | 'Expected' | 'AttributesToGet' | 'KeyConditions' | 'QueryFilter' | 'ScanFilter' | 'AttributeUpdates'
>
export type OmitExpressions<Options> = Omit<
    Options,
    | 'KeyConditionExpression'
    | 'FilterExpression'
    | 'UpdateExpression'
    | 'ProjectionExpression'
    | 'ExpressionAttributeNames'
    | 'ExpressionAttributeValues'
    | 'ConditionExpression'
>

export abstract class DynamodbBaseCommandType<
    Infer,
    CommandOptions,
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
> extends Node {
    public override _canReference: false = false
    public declare infer: Infer

    public declare schema: DynamodbCommandSchemaBuilder<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>

    public entity: DynamoDbEntityType<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>

    public _commandOptions: Partial<CommandOptions>
    public _dynamodb = {
        needsGenerator: false,
    }

    public constructor({
        entity,
        commandOptions,
        schema,
    }: {
        entity: DynamoDbEntityType<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes, AttributeFormatters>
        commandOptions: Partial<CommandOptions>
        schema: DynamodbCommandSchemaBuilder<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>
    }) {
        super()

        this.entity = entity
        this.schema = schema
        this._commandOptions = omitUndefined({ ...commandOptions }) as Partial<CommandOptions>

        this._transform ??= {}
        const commandTransform = (name: string) => `${camelcase(name)}Command`
        this._transform['type:source'] = commandTransform
        this._transform['value:source'] = commandTransform

        this._children = [this.entity.storageShape]

        if (entity._commands[this._id] !== undefined) {
            throw new Error(`Command with name ${this._id} already exists`)
        }
        entity._commands[this._id] = this

        const args = this.schema.arguments
        if (args !== undefined) {
            this._connections ??= []
            this._connections.push(args)
        }

        const result = this.schema.result
        if (result !== undefined) {
            this._connections ??= []
            this._connections.push(result)
        }
    }

    public _buildHandler({
        context,
        command,
    }: { context: TypescriptTypeWalkerContext; command: (writer: CodeBlockWriter) => void }) {
        const DynamoDBServiceException = context.type(dynamodbSymbols.DynamoDBServiceException())

        const writer = createWriter()

        writer.write(`public async ${this._dynamodb.needsGenerator ? '*' : ''}${context.value(this)}(`)

        const args = this.schema.arguments
        const $input = isDefined(args) && Object.keys(args.shape).length > 0 ? context.type(args) : undefined
        if (isDefined($input)) {
            writer.write(`args: ${$input}`)
        }

        writer.write(')').block(() => {
            writer
                .write(`const command = ${context.value(this)}({`)
                .write('tableName: this.table.tableName,')
                .conditionalWrite(isDefined($input), 'args,')
                .write('})')
                .blankLine()

                .write('try ')
                .block(() => command(writer))
                .write('catch (error) ')
                .block(() => {
                    writer.write(this._dynamodb.needsGenerator ? 'yield' : 'return').inlineBlock(() => {
                        writer
                            .writeLine('success: false,')
                            .writeLine(`left: error as ${DynamoDBServiceException}, `)
                            .conditionalWriteLine(this._dynamodb.needsGenerator, "status: 'error' as const, ")
                            .writeLine('$response: error,')
                    })
                })
        })

        return writer.toString()
    }

    public writeCommand({
        context,
        commandInput,
        prefix,
        command,
    }: {
        context: TypescriptTypeWalkerContext
        commandInput: string
        prefix?: (writer: CodeBlockWriter) => void
        command: (writer: CodeBlockWriter) => void
    }) {
        const writer = createWriter()
        writer.write(`${context.declare('const', this)} = (`)
        const args = this.schema.arguments
        if (isDefined(args) && Object.values(args.shape).filter(isDefined).length > 0) {
            writer
                .inlineBlock(() => {
                    writer
                        .write('tableName,')
                        .write('args: ')
                        .inlineBlock(() => {
                            writer.write(
                                Object.keys(args.shape)
                                    .map((x) => {
                                        const safeKey = ddbSafeProperty(x)
                                        if (safeKey.changed) {
                                            return `'${safeKey.original}': ${safeKey.property}`
                                        }
                                        return x
                                    })
                                    .join(','),
                            )
                        })
                })
                .write(':')
                .inlineBlock(() => {
                    writer.write('tableName: string;').write('args: ').write(context.type(args))
                })
        } else {
            writer
                .inlineBlock(() => {
                    writer.write('tableName,')
                })
                .write(':')
                .inlineBlock(() => {
                    writer.write('tableName: string;')
                })
        }

        writer.write(`) : ${commandInput} => `).block(() => {
            if (prefix !== undefined) {
                prefix(writer)
            }
            writer
                .blankLine()
                .write('return')
                .block(() => {
                    writer.writeLine('TableName: tableName,')

                    command(writer)
                })
        })

        return writer.toString()
    }

    public asValidator(node: Node) {
        node.validator({
            type: this.entity.table.definition.validator,
        })
    }

    public abstract buildHandler(context: TypescriptTypeWalkerContext): string

    /**
     * @deprecated
     */
    public options(options: Partial<CommandOptions>) {
        this._commandOptions = omitUndefined({
            ...this._commandOptions,
            ...options,
        }) as Partial<CommandOptions>
        return this
    }
}
