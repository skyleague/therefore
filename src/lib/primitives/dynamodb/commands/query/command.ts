import type { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { isDefined } from '@skyleague/axioms'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import type { Node } from '../../../../cst/node.js'
import type { TypescriptWalkerContext } from '../../../../visitor/typescript/typescript.js'
import { createWriter } from '../../../../writer.js'
import type { ObjectType } from '../../../object/object.js'
import type { DynamoDbEntityType } from '../../entity.js'
import { Condition, type ConditionBuilder } from '../../expressions/condition.js'
import type { ProjectionBuilder } from '../../expressions/projection.js'
import {} from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from '../base.js'

type Builders<Entity extends DynamoDbEntityType> = {
    key?: ConditionBuilder<
        ObjectType<
            Pick<Entity['shape']['shape'], NonNullable<Entity['table']['definition']['pk'] | Entity['table']['definition']['sk']>>
        >
    >
    projection?: ProjectionBuilder<Entity['shape']>
    filter?: ConditionBuilder<Entity['shape']>
}

type IndexesOf<Entity extends DynamoDbEntityType> = NonNullable<Entity['table']['definition']['indexes']>
type GetIndex<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>> = IndexesOf<Entity>[Index]
type IndexPick<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>> = (
    GetIndex<Entity, Index> extends {
        projectionType: 'INCLUDE'
        nonKeyAttributes: infer NonKeyAttributes extends (keyof Entity['shape']['shape'])[]
        pk: infer Pk extends keyof Entity['shape']['shape']
        sk?: infer Sk extends keyof Entity['shape']['shape']
    }
        ? Pick<Entity['shape']['shape'], NonKeyAttributes[number] | Pk | Sk>
        : GetIndex<Entity, Index> extends {
                projectionType: 'KEYS_ONLY'
                pk: infer Pk extends keyof Entity['shape']['shape']
                sk?: infer Sk extends keyof Entity['shape']['shape']
            }
          ? Pick<
                Entity['shape']['shape'],
                Pk | Sk | NonNullable<Entity['table']['definition']['pk'] | Entity['table']['definition']['sk']>
            >
          : Entity['shape']['shape']
) extends infer Picked extends Record<string, Node>
    ? ObjectType<Picked>
    : never
type IndexBuilders<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>> = {
    key?: ConditionBuilder<
        ObjectType<
            Pick<Entity['shape']['shape'], NonNullable<IndexesOf<Entity>[Index]['pk'] | IndexesOf<Entity>[Index]['sk']> & string>
        >
    >
    projection?: ProjectionBuilder<IndexPick<Entity, Index>>
    filter?: ConditionBuilder<IndexPick<Entity, Index>>
}

type CommandOptions = Omit<OmitLegacyOptions<OmitExpressions<QueryCommandInput>>, 'TableName'>

export interface DynamodbQueryCommandOptions<
    Entity extends DynamoDbEntityType,
    Index extends keyof IndexesOf<Entity> | undefined,
> {
    entity: Entity
    expressions?: (Index extends string ? IndexBuilders<Entity, Index> : Builders<Entity>) | undefined
    commandOptions?: CommandOptions | undefined
    scope: 'entity' | 'table'
    index?: Index
}

export class DynamodbQueryCommandType<
    Entity extends DynamoDbEntityType = DynamoDbEntityType,
    Index extends keyof IndexesOf<Entity> | undefined = undefined,
> extends DynamodbBaseCommandType<QueryCommand, CommandOptions, Entity> {
    public override _type = 'dynamodb:command:query' as const
    public _scope: 'entity' | 'table'
    public _index: Index | undefined

    public constructor({ expressions, commandOptions = {}, entity, scope, index }: DynamodbQueryCommandOptions<Entity, Index>) {
        super({ entity, commandOptions })
        this._scope = scope
        this._index = index
        this._dynamodb.needsGenerator = true

        this._builder.addProjectionExpression(expressions?.projection as never)
        this._builder.addFilterExpression(expressions?.filter as never)
        this._builder.addKeyConditionExpression<Entity>(({ existing, input, context }) => {
            const condition = expressions?.key?.({ existing, input, context })
            const expression = isDefined(condition) ? Condition.from(condition) : undefined
            // biome-ignore lint/style/noNonNullAssertion: index must exist if it is defined
            const pk = index === undefined ? entity.table.definition.pk : entity.table.definition.indexes![index].pk
            if (expression?.comparands.includes(pk)) {
                return expression
            }

            const formatted = entity.formatAttribute(pk, context)
            const pkCondition = existing[pk as keyof typeof existing].eq(formatted)

            return isDefined(expression) ? Condition.from({ and: [pkCondition, expression] }) : pkCondition
        })

        this._builder.addIndexResult(entity, entity.table.definition.indexes?.[index as string])
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
                        commandInput: context.reference(dynamodbSymbols.QueryCommandInput()),
                        commandLines: function* () {
                            if (isDefined(self._index)) {
                                yield `IndexName: ${JSON.stringify(self._index)},`
                            }
                            yield self._builder.writeKeyConditionExpression()
                            yield self._builder.writeFilterExpression()
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
                const paginateQuery = context.value(dynamodbSymbols.paginateQuery())
                const writer = createWriter()

                writer.write(`for await (const page of ${paginateQuery}({ client: this.table.client }, command))`).block(() => {
                    writer
                        .blankLine()
                        .write('for (const item of (page.Items ?? [])) ')
                        .block(() => {
                            if (self._scope === 'table') {
                                writer.writeLine('yield { right: item, status: "success" as const, $response: page }')
                            } else {
                                writer.writeLine(
                                    `yield { ...${context.value(self._builder.result ?? self.entity.shape)}.parse(item), status: 'success' as const, $response: page }`,
                                )
                            }
                        })
                })

                yield writer.toString()
            },
        })
    }
}

export function $queryCommand<Entity extends DynamoDbEntityType>(
    args: Omit<DynamodbQueryCommandOptions<Entity, undefined>, 'scope'>,
) {
    return new DynamodbQueryCommandType<Entity, undefined>({ ...args, scope: 'entity' })
}

export function $queryIndexCommand<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>>(
    args: Omit<DynamodbQueryCommandOptions<Entity, Index>, 'scope' | 'index'> & { index: Index },
) {
    return new DynamodbQueryCommandType<Entity, Index>({ ...args, scope: 'entity' })
}

export function $queryTableCommand<Entity extends DynamoDbEntityType>(
    args: Omit<DynamodbQueryCommandOptions<Entity, undefined>, 'scope'>,
) {
    return new DynamodbQueryCommandType<Entity, undefined>({ ...args, scope: 'table' })
}

export function $queryTableIndexCommand<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>>(
    args: Omit<DynamodbQueryCommandOptions<Entity, Index>, 'scope' | 'index'> & { index: Index },
) {
    return new DynamodbQueryCommandType<Entity, Index>({ ...args, scope: 'table' })
}
