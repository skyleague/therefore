import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import { createWriter } from '../../writer.js'
import { $const } from '../const/const.js'
import { $object, type ObjectType, type ShapeToInfer } from '../object/object.js'
import type { DynamodbBaseCommandType } from './commands/base.js'
import { $deleteItemCommand, type DynamodbDeleteItemCommandOptions } from './commands/delete-item/command.js'
import { $getItemCommand, type DynamodbGetItemCommandOptions } from './commands/get-item/command.js'
import { $putItemCommand, type DynamodbPutItemCommandOptions } from './commands/put-item/command.js'
import {
    $queryCommand,
    $queryIndexCommand,
    $queryTableCommand,
    $queryTableIndexCommand,
    type DynamodbQueryCommandOptions,
} from './commands/query/command.js'
import {
    $scanCommand,
    $scanIndexCommand,
    $scanTableCommand,
    $scanTableIndexCommand,
    type DynamodbScanCommandOptions,
} from './commands/scan/command.js'
import { $updateItemCommand, type DynamodbUpdateItemCommandOptions } from './commands/update-item/command.js'
import { FormattedOperand } from './expressions/attributes.js'
import type { DynamodbExpressionContext } from './expressions/context.js'
import type { DynamoDbTableType } from './table.js'

type EntityShape<Shape extends ObjectType, Table extends DynamoDbTableType> = ObjectType<Shape['shape'] & Table['shape']['shape']>

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
    public shape: EntityShape<Shape, Table>
    public declare infer: ShapeToInfer<(typeof this.shape)['shape']>
    public _attributeFormatters: Record<string, string> = {}
    public _commands: Record<string, DynamodbBaseCommandType<unknown, unknown>> = {}

    public constructor({
        table,
        entityType,
        shape,
        keyFormatters,
        attributeFormatters,
    }: {
        table: Table
        entityType: EntityType
        shape: Shape
        keyFormatters: Record<string, ShapeFormatString<EntityShape<Shape, Table>>>
        attributeFormatters: Record<string, ShapeFormatString<EntityShape<Shape, Table>>>
    }) {
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
            return `${name}EntityClient`.replace(/EntityEntityClient$/, 'EntityClient')
        }

        this._transform
        this.shape._transform ??= {}
        this.shape._transform.symbolName = (name) => `${parentName ?? name}Entity`.replace(/EntityEntity$/, 'Entity')
        this._connections = [this.shape]
        this._children = [this.shape]

        this._attributeFormatters = {
            ...attributeFormatters,
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
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.client.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const entityWriter = createWriter()
                    entityWriter.write(context.declare('class', node)).block(() => {
                        entityWriter.writeLine(`public entityType = '${this.entityType}' as const`)
                        entityWriter.writeLine(`public table: ${context.reference(this.table)}`)

                        entityWriter
                            .newLine()
                            .write('public constructor({')
                            .write('table')
                            .write('} : {')
                            .write(`table: ${context.reference(this.table)}`)
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
            },
            ...(super._output ?? []),
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
        return $getItemCommand({ entity: this as unknown as Entity, expressions })
    }

    public putItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions?:
            | DynamodbPutItemCommandOptions<Entity>['expressions']
            | Pick<DynamodbPutItemCommandOptions<Entity>, 'expressions' | 'overrides'>,
    ) {
        if (typeof expressions === 'object' && ('expressions' in expressions || 'overrides' in expressions)) {
            return $putItemCommand({ entity: this as unknown as Entity, ...expressions })
        }
        return $putItemCommand({ entity: this as unknown as Entity, expressions: expressions as never })
    }

    public deleteItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbDeleteItemCommandOptions<Entity>['expressions'],
    ) {
        return $deleteItemCommand({ entity: this as unknown as Entity, expressions })
    }

    public query<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbQueryCommandOptions<Entity, undefined>['expressions'],
    ) {
        return $queryCommand({ entity: this as unknown as Entity, expressions })
    }

    public queryIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbQueryCommandOptions<Entity, Index>['expressions']) {
        return $queryIndexCommand({ entity: this as unknown as Entity, expressions, index })
    }

    public queryTable<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbQueryCommandOptions<Entity, undefined>['expressions'],
    ) {
        return $queryTableCommand({ entity: this as unknown as Entity, expressions })
    }

    public queryTableIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbQueryCommandOptions<Entity, Index>['expressions']) {
        return $queryTableIndexCommand({ entity: this as unknown as Entity, expressions, index })
    }

    public scan<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbScanCommandOptions<Entity, undefined>['expressions'],
    ) {
        return $scanCommand({ entity: this as unknown as Entity, expressions })
    }

    public scanIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbScanCommandOptions<Entity, Index>['expressions']) {
        return $scanIndexCommand({ entity: this as unknown as Entity, expressions, index })
    }

    public scanTable<Entity extends DynamoDbEntityType = typeof this>(
        expressions?: DynamodbScanCommandOptions<Entity, undefined>['expressions'],
    ) {
        return $scanTableCommand({ entity: this as unknown as Entity, expressions })
    }

    public scanTableIndex<
        Index extends keyof NonNullable<Entity['table']['definition']['indexes']>,
        Entity extends DynamoDbEntityType = typeof this,
    >(index: Index, expressions?: DynamodbScanCommandOptions<Entity, Index>['expressions']) {
        return $scanTableIndexCommand({ entity: this as unknown as Entity, expressions, index })
    }

    public updateItem<Entity extends DynamoDbEntityType = typeof this>(
        expressions: DynamodbUpdateItemCommandOptions<Entity>['expressions'],
    ) {
        return $updateItemCommand({ entity: this as unknown as Entity, expressions })
    }
}

export function $entity<Shape extends ObjectType, const EntityType extends string, Table extends DynamoDbTableType>({
    table,
    entityType,
    shape,
    keyFormatters,
    attributeFormatters = {},
}: {
    table: Table
    entityType: EntityType
    shape: Shape
    keyFormatters: Record<
        Table['definition']['pk'] | NonNullable<Table['definition']['sk']>,
        ShapeFormatString<EntityShape<Shape, Table>>
    >
    attributeFormatters?: Record<string, ShapeFormatString<EntityShape<Shape, Table>>>
}) {
    return new DynamoDbEntityType<Shape, EntityType, Table>({ table, entityType, shape, keyFormatters, attributeFormatters })
}
