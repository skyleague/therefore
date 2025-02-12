import { isDefined } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../../visitor/typescript/typescript-type.js'
import { createWriter } from '../../../writer.js'
import { $object, ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import type { FormattedOperand } from '../expressions/attributes.js'
import { type ConditionBuilder, conditionExpression } from '../expressions/condition.js'
import type { DynamodbExpressionContext } from '../expressions/context.js'
import { type ProjectionBuilder, projectionExpression } from '../expressions/projection.js'
import { type UpdateBuilder, updateExpression } from '../expressions/update.js'
import type { IndexDefinition } from '../table.js'

export class DynamodbCommandBuilder {
    public context: DynamodbExpressionContext
    public input: ObjectType | undefined
    public result: ObjectType | undefined
    public key: Record<string, FormattedOperand> | undefined
    public projection: ReturnType<typeof projectionExpression> | undefined
    public condition: ReturnType<typeof conditionExpression> | undefined
    public filter: ReturnType<typeof conditionExpression> | undefined
    public keyCondition: ReturnType<typeof conditionExpression> | undefined
    public update: ReturnType<typeof updateExpression> | undefined

    public constructor({
        context,
    }: {
        context: DynamodbExpressionContext
    }) {
        this.context = context
    }

    public addKey(entity: DynamoDbEntityType) {
        this.key = Object.fromEntries(
            [entity.table.definition.pk, entity.table.definition.sk]
                .filter(isDefined)
                .map((k) => [k, entity.formatAttribute(k, this.context)]),
        )
        return this.key
    }

    public addInput(input: ObjectType | Record<string, Node>) {
        this.input = input instanceof ObjectType ? input : $object(input)

        this.input._transform ??= {}
        this.input._transform['type:source'] = (name) => `${name}Input`
        this.input._transform['value:source'] = (name) => `${name}Input`

        this.context.command._connections ??= []
        this.context.command._connections.push(this.input)

        return this.input
    }

    public addResult(result: ObjectType | Record<string, Node>) {
        this.result = result instanceof ObjectType ? result : $object(result)

        this.result._transform ??= {}
        this.result._transform['type:source'] = (name) => `${name}Result`
        this.result._transform['value:source'] = (name) => `${name}Result`

        this.context.command._connections ??= []
        this.context.command._connections.push(this.result)

        return this.result
    }

    public addIndexResult<Entity extends DynamoDbEntityType, Index extends IndexDefinition<string, string[], string | undefined>>(
        entity: Entity,
        index: Index | undefined,
    ) {
        if (this.result !== undefined || index === undefined || index.projectionType === 'ALL') {
            return
        }

        const { pk: _pk, sk: _sk } = entity.table.definition
        const { pk, sk } = index
        const keys = [pk, sk, _pk, _sk]
        if (index.projectionType === 'INCLUDE') {
            keys.push(...index.nonKeyAttributes)
        }

        this.addResult(
            Object.fromEntries(
                [...new Set(keys.filter(isDefined))]
                    .sort()
                    .map((key) => [key, this.context.getShapeSchema({ key, shouldUnwrap: false })]),
            ),
        )
    }

    public addProjectionExpression<Shape extends ObjectType>(build: ProjectionBuilder<Shape> | undefined) {
        if (isDefined(build)) {
            this.projection = projectionExpression({ build, context: this.context as never })
            return this.addResult(this.projection.schema)
        }

        return undefined
    }

    public addConditionExpression<Entity extends DynamoDbEntityType>(build: ConditionBuilder<Entity['shape']> | undefined) {
        if (isDefined(build)) {
            this.condition = conditionExpression({ build, context: this.context })
        }
    }

    public addFilterExpression<Entity extends DynamoDbEntityType>(build: ConditionBuilder<Entity['shape']> | undefined) {
        if (isDefined(build)) {
            this.filter = conditionExpression({ build, context: this.context })
        }
    }

    public addKeyConditionExpression<Entity extends DynamoDbEntityType>(
        build:
            | ConditionBuilder<
                  ObjectType<
                      Pick<
                          Entity['shape']['shape'],
                          NonNullable<Entity['table']['definition']['pk'] | Entity['table']['definition']['sk']>
                      >
                  >
              >
            | undefined,
    ) {
        if (isDefined(build)) {
            this.keyCondition = conditionExpression({ build, context: this.context as never })
        }
    }

    public addUpdateExpression<Entity extends DynamoDbEntityType>(
        build: UpdateBuilder<Entity['shape']> | undefined,
        entity: Entity,
    ) {
        if (isDefined(build)) {
            this.update = updateExpression({ entity, build, context: this.context })
        }
    }

    public writeKey() {
        const writer = createWriter()
        writer
            .writeLine('Key: ')
            .inlineBlock(() => {
                for (const [key, value] of Object.entries(this.key ?? {})) {
                    writer.write(`${key}: \`${value.image}\`,`)
                }
            })
            .write(',')

        return writer.toString()
    }

    public writeAttributeValues() {
        if (Object.keys(this.context._attributeValues).length > 0 || Object.keys(this.context._attributeConstValues).length > 0) {
            const writer = createWriter()
            writer
                .writeLine('ExpressionAttributeValues: ')
                .block(() => {
                    for (const [input, alias] of Object.entries(this.context._attributeValues)) {
                        writer.writeLine(`${JSON.stringify(alias)}: ${input},`)
                    }
                    for (const [alias, input] of Object.entries(this.context._attributeConstValues)) {
                        writer.writeLine(`${JSON.stringify(alias)}: ${input},`)
                    }
                })
                .write(',')

            return writer.toString()
        }

        return undefined
    }

    public writeAttributeNames() {
        if (Object.keys(this.context._attributeNames).length > 0) {
            const writer = createWriter()
            writer
                .writeLine('ExpressionAttributeNames: ')
                .block(() => {
                    for (const [input, alias] of Object.entries(this.context._attributeNames)) {
                        writer.writeLine(`${JSON.stringify(alias)}: ${JSON.stringify(input)},`)
                    }
                })
                .write(',')

            return writer.toString()
        }

        return undefined
    }

    public writeProjectionExpression() {
        if (this.projection !== undefined) {
            return `ProjectionExpression: ${JSON.stringify(this.projection.expression)},`
        }

        return undefined
    }

    public writeConditionExpression() {
        if (this.condition !== undefined) {
            return `ConditionExpression: ${JSON.stringify(this.condition.expression)},`
        }

        return undefined
    }

    public writeKeyConditionExpression() {
        if (this.keyCondition !== undefined) {
            return `KeyConditionExpression: ${JSON.stringify(this.keyCondition.expression)},`
        }

        return undefined
    }

    public writeFilterExpression() {
        if (this.filter !== undefined) {
            return `FilterExpression: ${JSON.stringify(this.filter.expression)},`
        }

        return undefined
    }

    public writeUpdateExpression() {
        if (this.update !== undefined) {
            return `UpdateExpression: ${JSON.stringify(this.update?.expression)},`
        }

        return undefined
    }

    public writeCommandOptions(commandOptions: Record<string, unknown>) {
        const filteredOptions = Object.entries(commandOptions).filter(([_, v]) => v !== undefined)
        if (filteredOptions.length > 0) {
            const writer = createWriter()
            writer.writeLine('// Extra options')
            for (const [key, value] of filteredOptions) {
                writer.writeLine(`${key}: ${typeof value === 'string' ? JSON.stringify(value) : value},`)
            }

            return writer.toString().trim()
        }

        return undefined
    }

    public writeCommand({
        node,
        context,
        commandInput,
        prefixLines,
        commandLines,
    }: {
        node: Node
        context: TypescriptTypeWalkerContext
        commandInput: string
        prefixLines?: () => Generator<string | undefined>
        commandLines: () => Generator<string | undefined>
    }) {
        const writer = createWriter()
        writer.write(`${context.declare('const', node)} = (`)
        const input = this.input
        if (isDefined(input) && Object.values(input.shape).filter(isDefined).length > 0) {
            writer
                .inlineBlock(() => {
                    writer
                        .write('tableName,')
                        .write('input: ')
                        .inlineBlock(() => {
                            for (const key in input.shape) {
                                writer.write(`${key},`)
                            }
                        })
                })
                .write(':')
                .inlineBlock(() => {
                    writer.write('tableName: string;').write('input: ').write(context.type(input))
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
            for (const line of prefixLines?.() ?? []) {
                if (isDefined(line)) {
                    writer.writeLine(line)
                }
            }
            writer
                .blankLine()
                .write('return')
                .block(() => {
                    writer.writeLine('TableName: tableName,')

                    for (const line of commandLines()) {
                        if (isDefined(line)) {
                            writer.writeLine(line)
                        }
                    }
                })
        })

        return writer.toString()
    }
}
