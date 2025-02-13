import { isDefined, omitUndefined } from '@skyleague/axioms'
import camelcase from 'camelcase'
import { Node } from '../../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import { createWriter } from '../../../writer.js'
import type { DynamoDbEntityType } from '../entity.js'
import { DynamodbExpressionContext } from '../expressions/context.js'
import { dynamodbSymbols } from '../symbols.js'
import { DynamodbCommandBuilder } from './builder.js'

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
    Entity extends DynamoDbEntityType = DynamoDbEntityType,
> extends Node {
    public override _canReference: false = false
    public declare infer: Infer

    public entity: Entity
    public _builder: DynamodbCommandBuilder
    public _commandOptions: Partial<CommandOptions>
    public _dynamodb = {
        needsGenerator: false,
    }

    public constructor({ entity, commandOptions }: { entity: Entity; commandOptions: Partial<CommandOptions> }) {
        super()

        // let parentName: string | undefined

        this.entity = entity
        this._commandOptions = omitUndefined({ ...commandOptions }) as Partial<CommandOptions>
        this._builder = new DynamodbCommandBuilder({
            context: new DynamodbExpressionContext(entity, this),
        })

        this._transform ??= {}
        const commandTransform = (name: string) => `${camelcase(name)}Command`
        this._transform['type:source'] = commandTransform
        this._transform['value:source'] = commandTransform

        this._children = [this.entity.shape]

        if (entity._commands[this._id] !== undefined) {
            throw new Error(`Command with name ${this._id} already exists`)
        }
        entity._commands[this._id] = this
    }

    public _buildHandler({
        context,
        commandLines,
    }: { context: TypescriptTypeWalkerContext; commandLines: () => Generator<string> }) {
        const DynamoDBServiceException = context.type(dynamodbSymbols.DynamoDBServiceException())

        const writer = createWriter()

        writer.write(`public async ${this._dynamodb.needsGenerator ? '*' : ''}${context.value(this)}(`)

        const $input =
            isDefined(this._builder.input) && Object.keys(this._builder.input.shape).length > 0
                ? context.type(this._builder.input)
                : undefined

        if (isDefined($input)) {
            writer.write(`input: ${$input}`)
        }

        writer.write(')').block(() => {
            writer
                .write(`const command = ${context.value(this)}({`)
                .write('tableName: this.table.tableName,')
                .conditionalWrite(isDefined($input), 'input,')
                .write('})')
                .blankLine()

            writer
                .write('try ')
                .block(() => {
                    for (const line of commandLines()) {
                        writer.writeLine(line)
                    }
                })
                .write('catch (error) ')
                .block(() => {
                    writer
                        .write(this._dynamodb.needsGenerator ? 'yield' : 'return')
                        .write(' {')
                        .write(`left: error as ${DynamoDBServiceException}, `)
                        .conditionalWrite(this._dynamodb.needsGenerator, "status: 'error' as const, ")
                        .write('$response: error,')
                        .write('}')
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

    public options(options: Partial<CommandOptions>) {
        this._commandOptions = omitUndefined({
            ...this._commandOptions,
            ...options,
        }) as Partial<CommandOptions>
        return this
    }
}
