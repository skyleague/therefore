import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../visitor/typescript/typescript-zod.js'
import { createWriter } from '../../writer.js'
import { $const } from '../const/const.js'
import { $object, type ObjectType, type ShapeToInfer } from '../object/object.js'
import type { DynamodbBaseCommandType } from './commands/base.js'
import { type DynamodbDeleteItemCommandOptions, DynamodbDeleteItemCommandType } from './commands/delete-item.js'
import { type DynamodbGetItemCommandOptions, DynamodbGetItemCommandType } from './commands/get-item.js'
import { type DynamodbPutItemCommandOptions, DynamodbPutItemCommandType } from './commands/put-item.js'
import { type DynamodbQueryCommandOptions, DynamodbQueryCommandType } from './commands/query.js'
import { type DynamodbScanCommandOptions, DynamodbScanCommandType } from './commands/scan.js'
import { type DynamodbUpdateItemCommandOptions, DynamodbUpdateItemCommandType } from './commands/update-item.js'
import { FormattedOperand } from './expressions/attributes.js'
import type { DynamoDbTableType, EntityAttributeFormatters } from './table.js'
import type { IndexDefinition } from './table.js'

export type StorageShapeType<Entity extends ObjectType, BaseShape extends ObjectType> = ObjectType<
    Entity['shape'] & BaseShape['shape']
>

export class DynamoDbEntityType<
    Entity extends ObjectType = ObjectType,
    BaseShape extends ObjectType = ObjectType,
    const Pk extends keyof Entity['shape'] & string = keyof Entity['shape'] & string,
    const Sk extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const CreatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const UpdatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const EntityType extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined =
        | Record<string, IndexDefinition<string, string[], string | undefined>>
        | undefined,
    const AttributeFormatters extends EntityAttributeFormatters<Entity, BaseShape, Sk> | undefined =
        | EntityAttributeFormatters<Entity, BaseShape, Sk>
        | undefined,
> extends Node {
    public override _type = 'dynamodb:entity' as const
    public override _canReference?: boolean = false
    public table: DynamoDbTableType<BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>
    public entityType: EntityType
    public attributes: Entity
    public storageShape: StorageShapeType<Entity, BaseShape>
    public declare infer: ShapeToInfer<(typeof this.storageShape)['shape']>
    public _attributeFormatters: AttributeFormatters = {} as AttributeFormatters
    public _commands: Record<
        string,
        DynamodbBaseCommandType<unknown, unknown, Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>
    > = {}

    public constructor({
        table,
        entityType,
        shape,
        formatters,
    }: {
        table: DynamoDbTableType<BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>
        entityType: EntityType
        shape: Entity
        formatters?: AttributeFormatters
    }) {
        super()
        this.table = table
        this.entityType = entityType

        this.attributes = shape.validator({ type: this.table.definition.validator })
        this.storageShape = (
            this.table.definition.entityType
                ? table.shape
                      .merge(shape)
                      .merge($object({ [this.table.definition.entityType]: $const(entityType) }) as ObjectType)
                : table.shape.merge(shape)
        ).validator({ type: this.table.definition.validator })

        this._connections = [this.storageShape]

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

                    this.storageShape._transform = {
                        'value:source': entityTransform,
                        'type:source': entityTransform,
                    }

                    // if the entity was defined seperately from the schema file we need to import it under the original name
                    if (this.attributes._name === undefined) {
                        this.attributes._transform = {
                            'value:source': entityTransform,
                            'type:source': entityTransform,
                        }
                    }

                    const entityWriter = createWriter()
                    entityWriter.write(context.declare('class', node)).block(() => {
                        entityWriter.conditionalWriteLine(
                            this.entityType !== undefined,
                            `public entityType = '${this.entityType}' as const`,
                        )
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

    /**
     * @deprecated
     */
    public asFormattedOperand(key: string) {
        return FormattedOperand.from(key, this._attributeFormatters[key])
    }

    // public formatAttribute(key: string) {
    //     let formatted = this._attributeFormatters[key] ?? `${key}`
    //     const inputKeys: string[] = []
    //     for (const [, input] of formatted.matchAll(/\{(\w+)\}/g)) {
    //         // const schema = context.getShapeSchema({ key: input as string, shouldUnwrap: true })
    //         formatted = formatted.replace(`{${input}}`, `$\{${input}\}`)
    //         // context.addInputSchema({ key: input as string, schema })
    //         inputKeys.push(input as string)
    //     }

    //     return new FormattedOperand(formatted, key, inputKeys)
    // }

    public getItem(
        expressions?: DynamodbGetItemCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >['expressions'],
    ) {
        return new DynamodbGetItemCommandType<Entity, BaseShape, Pk, Sk, CreatedAt, UpdatedAt, EntityType, Indexes>({
            entity: this,
            expressions,
        })
    }

    public putItem(
        expressions?: DynamodbPutItemCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >['expressions'],
    ) {
        return new DynamodbPutItemCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >({
            entity: this,
            expressions: expressions as never,
        })
    }

    public deleteItem(
        expressions?: DynamodbDeleteItemCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >['expressions'],
    ) {
        return new DynamodbDeleteItemCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >({
            entity: this,
            expressions,
        })
    }

    public query(
        expressions?: DynamodbQueryCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >['expressions'],
    ) {
        return new DynamodbQueryCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >({
            entity: this,
            expressions,
            scope: 'entity',
        })
    }

    public queryIndex<ChosenIndex extends keyof NonNullable<Indexes> & string>(
        index: ChosenIndex,
        expressions?: DynamodbQueryCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >['expressions'],
    ) {
        return new DynamodbQueryCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >({
            entity: this,
            expressions,
            index,
            scope: 'entity',
        })
    }

    public queryTable(
        expressions?: DynamodbQueryCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >['expressions'],
    ) {
        return new DynamodbQueryCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >({
            entity: this,
            expressions,
            scope: 'table',
        })
    }

    public queryTableIndex<ChosenIndex extends keyof NonNullable<Indexes> & string>(
        index: ChosenIndex,
        expressions?: DynamodbQueryCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >['expressions'],
    ) {
        return new DynamodbQueryCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >({
            entity: this,
            expressions,
            index,
            scope: 'table',
        })
    }

    public scan(
        expressions?: DynamodbScanCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >['expressions'],
    ) {
        return new DynamodbScanCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >({
            entity: this,
            expressions,
            scope: 'entity',
        })
    }

    public scanIndex<ChosenIndex extends keyof NonNullable<Indexes> & string>(
        index: ChosenIndex,
        expressions?: DynamodbScanCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >['expressions'],
    ) {
        return new DynamodbScanCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >({
            entity: this,
            expressions,
            index,
            scope: 'entity',
        })
    }

    public scanTable(
        expressions?: DynamodbScanCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >['expressions'],
    ) {
        return new DynamodbScanCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            undefined
        >({
            entity: this,
            expressions,
            scope: 'table',
        })
    }

    public scanTableIndex<ChosenIndex extends keyof NonNullable<Indexes> & string>(
        index: ChosenIndex,
        expressions?: DynamodbScanCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >['expressions'],
    ) {
        return new DynamodbScanCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters,
            ChosenIndex
        >({
            entity: this,
            expressions,
            index,
            scope: 'table',
        })
    }

    public updateItem(
        expressions: DynamodbUpdateItemCommandOptions<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >['expressions'],
    ) {
        return new DynamodbUpdateItemCommandType<
            Entity,
            BaseShape,
            Pk,
            Sk,
            CreatedAt,
            UpdatedAt,
            EntityType,
            Indexes,
            AttributeFormatters
        >({
            entity: this,
            expressions,
        })
    }
}
