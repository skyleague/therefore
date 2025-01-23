import type { ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb'
import { replaceExtension } from '../../../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../../../cst/cst.js'
import type { Node } from '../../../../cst/node.js'
import type { TypescriptWalkerContext } from '../../../../visitor/typescript/typescript.js'
import { createWriter } from '../../../../writer.js'
import type { ObjectType } from '../../../object/object.js'
import type { DynamoDbEntityType } from '../../entity.js'
import type { ConditionBuilder } from '../../expressions/condition.js'
import type { ProjectionBuilder } from '../../expressions/projection.js'
import {} from '../../expressions/update.js'
import { dynamodbSymbols } from '../../symbols.js'
import { DynamodbBaseCommandType, type OmitExpressions, type OmitLegacyOptions } from '../base.js'

type Builders<Entity extends DynamoDbEntityType> = {
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
    projection?: ProjectionBuilder<IndexPick<Entity, Index>>
    filter?: ConditionBuilder<IndexPick<Entity, Index>>
}

type CommandOptions = Omit<OmitLegacyOptions<OmitExpressions<ScanCommandInput>>, 'TableName'>

export interface DynamodbScanCommandOptions<
    Entity extends DynamoDbEntityType,
    Index extends keyof IndexesOf<Entity> | undefined,
> {
    entity: Entity
    expressions?: (Index extends string ? IndexBuilders<Entity, Index> : Builders<Entity>) | undefined
    commandOptions?: CommandOptions | undefined
    scope: 'entity' | 'table'
    index?: Index
}

export class DynamodbScanCommandType<
    Entity extends DynamoDbEntityType = DynamoDbEntityType,
    Index extends keyof IndexesOf<Entity> | undefined = undefined,
> extends DynamodbBaseCommandType<ScanCommand, CommandOptions, Entity> {
    public override _type = 'dynamodb:command:scan' as const
    public _scope: 'entity' | 'table'
    public _index: Index | undefined

    public constructor({ expressions, commandOptions = {}, entity, index, scope }: DynamodbScanCommandOptions<Entity, Index>) {
        super({ entity, commandOptions })
        this._scope = scope
        this._index = index
        this._dynamodb.needsGenerator = true

        this._builder.addProjectionExpression(expressions?.projection as never)
        this._builder.addFilterExpression(expressions?.filter as never)

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
                        commandInput: context.reference(dynamodbSymbols.ScanCommandInput()),
                        commandLines: function* () {
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
                const paginateScan = context.value(dynamodbSymbols.paginateScan())
                const writer = createWriter()

                writer.write(`for await (const page of ${paginateScan}({ client: this.table.client }, command))`).block(() => {
                    writer.write('for (const item of (page.Items ?? [])) ').block(() => {
                        writer.writeLine(
                            `yield { ...${context.value(self._builder.result ?? self.entity.shape)}.parse(item), status: 'success' as const, $response: page }`,
                        )
                    })
                })

                yield writer.toString()
            },
        })
    }
}

export function $scanCommand<Entity extends DynamoDbEntityType>(
    args: Omit<DynamodbScanCommandOptions<Entity, undefined>, 'scope' | 'index'>,
) {
    return new DynamodbScanCommandType<Entity, undefined>({ ...args, scope: 'entity' })
}
export function $scanIndexCommand<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>>(
    args: Omit<DynamodbScanCommandOptions<Entity, Index>, 'scope' | 'index'> & { index: Index },
) {
    return new DynamodbScanCommandType<Entity, Index>({ ...args, scope: 'entity' })
}

export function $scanTableCommand<Entity extends DynamoDbEntityType>(
    args: Omit<DynamodbScanCommandOptions<Entity, undefined>, 'scope' | 'index'>,
) {
    return new DynamodbScanCommandType<Entity, undefined>({ ...args, scope: 'table' })
}

export function $scanTableIndexCommand<Entity extends DynamoDbEntityType, Index extends keyof IndexesOf<Entity>>(
    args: Omit<DynamodbScanCommandOptions<Entity, Index>, 'scope' | 'index'> & { index: Index },
) {
    return new DynamodbScanCommandType<Entity, Index>({ ...args, scope: 'table' })
}
