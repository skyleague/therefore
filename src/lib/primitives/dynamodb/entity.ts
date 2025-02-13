import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../visitor/typescript/typescript-zod.js'
import { createWriter } from '../../writer.js'
import { $const } from '../const/const.js'
import { $object, type ObjectType, type ShapeToInfer } from '../object/object.js'
import type { DynamodbBaseCommandType } from './commands/base.js'
import { type DynamodbDeleteItemCommandOptions, DynamodbDeleteItemCommandType } from './commands/delete-item/command.js'
import { type DynamodbGetItemCommandOptions, DynamodbGetItemCommandType } from './commands/get-item/command.js'
import { type DynamodbPutItemCommandOptions, DynamodbPutItemCommandType } from './commands/put-item/command.js'
import { type DynamodbQueryCommandOptions, DynamodbQueryCommandType } from './commands/query/command.js'
import { type DynamodbScanCommandOptions, DynamodbScanCommandType } from './commands/scan/command.js'
import { type DynamodbUpdateItemCommandOptions, DynamodbUpdateItemCommandType } from './commands/update-item/command.js'
import { FormattedOperand } from './expressions/attributes.js'
import type { DynamodbExpressionContext } from './expressions/context.js'
import type { DynamoDbTableType } from './table.js'

export type EntityShape<Shape extends ObjectType, Table extends DynamoDbTableType> = ObjectType<
    Shape['shape'] & Table['shape']['shape']
>

export type ShapeFormatString<ShapeKey extends PropertyKey> = (
    | `${string}${ShapeKey & string}${string}`
    | `${string}${ShapeKey & string}`
    | `${ShapeKey & string}${string}`
    | ShapeKey
) &
    string

export class DynamoDbEntityType<
    Shape extends ObjectType = ObjectType,
    const EntityType extends string = string,
    Table extends DynamoDbTableType = DynamoDbTableType,
> extends Node {
    public override _type = 'dynamodb:entity' as const
    public override _canReference?: boolean = false
    public table: Table
    public entityType: EntityType
    public shape: EntityShape<Shape, Table>
    public declare infer: ShapeToInfer<(typeof this.shape)['shape']>
    public _attributeFormatters: Record<string, string> = {}
    public _commands: Record<string, DynamodbBaseCommandType<unknown, unknown>> = {}

    public constructor({
        table,
        entityType,
        shape,
        formatters,
    }: {
        table: Table
        entityType: EntityType
        shape: Shape
        formatters?: Record<string, string>
    }) {
        super()
        this.table = table
        this.entityType = entityType
        this.shape = table.shape
            .merge(shape)
            .merge($object({ [this.table.definition.entityType]: $const(entityType) }) as ObjectType)
            .validator({ type: this.table.definition.validator })
        this._connections = [this.shape]
        this._attributeFormatters = {
            ...formatters,
        }
    }

    public override get _output(): (
        | TypescriptOutput<TypescriptTypeWalkerContext>
        | TypescriptOutput<TypescriptZodWalkerContext>
        | GenericOutput
    )[] {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.client.ts'),
                type: 'typescript',
                subtype: undefined,
                isTypeOnly: false,
                definition: (node, context) => {
                    node._attributes.typescript['type:path'] = context.targetPath

                    this._transform = {
                        'type:source': (name) => `${name}EntityClient`.replace(/EntityEntityClient$/i, 'EntityClient'),
                    }

                    const entityTransform = (name: string) => `${name}Entity`.replace(/EntityEntity$/i, 'Entity')
                    this.shape._transform = {
                        'value:source': entityTransform,
                        'type:source': entityTransform,
                    }

                    const entityWriter = createWriter()
                    entityWriter.write(context.declare('class', node)).block(() => {
                        entityWriter.writeLine(`public entityType = '${this.entityType}' as const`)
                        entityWriter.writeLine(`public table: ${context.type(this.table)}`)

                        entityWriter
                            .newLine()
                            .write('public constructor({')
                            .write('table')
                            .write('} : {')
                            .write(`table: ${context.type(this.table)}`)
                            .write('})')
                            .block(() => {
                                entityWriter.writeLine('this.table = table')
                            })

                        for (const command of Object.values(this._commands).sort()) {
                            entityWriter.blankLine().writeLine(command.buildHandler(context))
                        }
                    })

                    return entityWriter.toString()
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
        ]
    }

    public formatAttribute(key: string, context: DynamodbExpressionContext) {
        let formatted = this._attributeFormatters[key] ?? `${key}`
        const inputKeys: string[] = []
        for (const [, input] of formatted.matchAll(/\{(\w+)\}/g)) {
            const schema = context.getShapeSchema({ key: input as string, shouldUnwrap: true })
            formatted = formatted.replace(`{${input}}`, `$\{${input}\}`)
            context.addInputSchema({ key: input as string, schema })
            inputKeys.push(input as string)
        }

        return new FormattedOperand(formatted, key, inputKeys, context)
    }

    public getItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbGetItemCommandOptions<Entity>['expressions'],
    ) {
        return new DynamodbGetItemCommandType<Entity>({ entity: this as unknown as Entity, expressions })
    }

    public putItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions?:
            | DynamodbPutItemCommandOptions<Entity>['expressions']
            | Pick<DynamodbPutItemCommandOptions<Entity>, 'expressions' | 'overrides'>,
    ) {
        if (typeof expressions === 'object' && ('expressions' in expressions || 'overrides' in expressions)) {
            return new DynamodbPutItemCommandType<Entity>({ entity: this as unknown as Entity, ...expressions })
        }
        return new DynamodbPutItemCommandType<Entity>({ entity: this as unknown as Entity, expressions: expressions as never })
    }

    public deleteItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbDeleteItemCommandOptions<Entity>['expressions'],
    ) {
        return new DynamodbDeleteItemCommandType<Entity>({ entity: this as unknown as Entity, expressions })
    }

    public query<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbQueryCommandOptions<Entity, undefined>['expressions'],
    ) {
        return new DynamodbQueryCommandType<Entity, undefined>({
            entity: this as unknown as Entity,
            expressions,
            scope: 'entity',
        })
    }

    public queryIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbQueryCommandOptions<Entity, Index>['expressions']) {
        return new DynamodbQueryCommandType<Entity, Index>({
            entity: this as unknown as Entity,
            expressions,
            index,
            scope: 'entity',
        })
    }

    public queryTable<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbQueryCommandOptions<Entity, undefined>['expressions'],
    ) {
        return new DynamodbQueryCommandType<Entity, undefined>({ entity: this as unknown as Entity, expressions, scope: 'table' })
    }

    public queryTableIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbQueryCommandOptions<Entity, Index>['expressions']) {
        return new DynamodbQueryCommandType<Entity, Index>({
            entity: this as unknown as Entity,
            expressions,
            index,
            scope: 'table',
        })
    }

    public scan<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbScanCommandOptions<Entity, undefined>['expressions'],
    ) {
        return new DynamodbScanCommandType<Entity, undefined>({ entity: this as unknown as Entity, expressions, scope: 'entity' })
    }

    public scanIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbScanCommandOptions<Entity, Index>['expressions']) {
        return new DynamodbScanCommandType<Entity, Index>({
            entity: this as unknown as Entity,
            expressions,
            index,
            scope: 'entity',
        })
    }

    public scanTable<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbScanCommandOptions<Entity, undefined>['expressions'],
    ) {
        return new DynamodbScanCommandType<Entity, undefined>({ entity: this as unknown as Entity, expressions, scope: 'table' })
    }

    public scanTableIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbScanCommandOptions<Entity, Index>['expressions']) {
        return new DynamodbScanCommandType<Entity, Index>({
            entity: this as unknown as Entity,
            expressions,
            index,
            scope: 'table',
        })
    }

    public updateItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions: DynamodbUpdateItemCommandOptions<Entity>['expressions'],
    ) {
        return new DynamodbUpdateItemCommandType<Entity>({ entity: this as unknown as Entity, expressions })
    }
}
