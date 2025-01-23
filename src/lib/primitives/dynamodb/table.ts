import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import { createWriter } from '../../writer.js'
import type { ObjectType, ShapeToInfer } from '../object/object.js'
import { $entity } from './entity.js'
import { dynamodbSymbols } from './symbols.js'

export type IndexDefinition<Pk extends string, NonKeyAttributes extends string[], Sk extends string | undefined = undefined> =
    | {
          pk: Pk
          sk?: Sk
          projectionType: 'INCLUDE'
          nonKeyAttributes: NonKeyAttributes
      }
    | {
          pk: Pk
          sk?: Sk
          projectionType: 'KEYS_ONLY' | 'ALL'
      }
export interface DynamoDbTableDefinition<
    Entity extends ObjectType = ObjectType,
    Pk extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'pk',
    Sk extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'sk',
    CreatedAt extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'createdAt',
    UpdatedAt extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'updatedAt',
    EntityType extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'entityType',
    Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
> {
    pk: Pk
    sk?: Sk
    tableName?: string
    createdAt?: CreatedAt
    updatedAt?: UpdatedAt
    entityType?: EntityType
    indexes?: Indexes
}

export class DynamoDbTableType<
    Shape extends ObjectType = ObjectType,
    Definition extends DynamoDbTableDefinition<Shape> = DynamoDbTableDefinition<Shape>,
> extends Node {
    public override _type = 'dynamodb:table' as const
    public override _canReference?: boolean = false
    public definition: Omit<Definition, 'createdAt' | 'updatedAt' | 'entityType'> &
        Required<Pick<Definition, 'createdAt' | 'updatedAt' | 'entityType'>>

    public shape: Shape
    public declare infer: ShapeToInfer<Shape['shape']>
    public declare inferredDefinition: Definition

    public constructor(shape: Shape, definition: Definition) {
        super()
        this.definition = {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            entityType: 'entityType',
            ...definition,
        }
        this.shape = shape
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return [
            {
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.client.ts'),
                type: 'typescript',
                definition: (node, context) => {
                    const DynamoDBDocument = context.reference(dynamodbSymbols.DynamoDBDocument())

                    const tableWriter = createWriter()
                    tableWriter.write(context.declare('class', node)).block(() => {
                        if (this.definition.tableName) {
                            tableWriter.writeLine(`public tableName = '${this.definition.tableName}' as const`)
                        } else {
                            tableWriter.writeLine('public tableName: string')
                        }

                        tableWriter.newLine().writeLine(`public client: ${DynamoDBDocument}`)

                        tableWriter
                            .blankLine()
                            .write('public constructor({')
                            .write('client,')
                            .conditionalWrite(this.definition.tableName === undefined, 'tableName,')
                            .write('} : {')
                            .write(`client: ${DynamoDBDocument};`)
                            .conditionalWrite(this.definition.tableName === undefined, 'tableName: string;')
                            .write('})')
                            .block(() => {
                                tableWriter.writeLine('this.client = client')
                                tableWriter.conditionalWrite(
                                    this.definition.tableName === undefined,
                                    'this.tableName = tableName',
                                )
                            })
                    })

                    return tableWriter.toString()
                },
            },
            ...(super._output ?? []),
        ]
    }

    public entity<Shape extends ObjectType, const EntityType extends string>(
        args: Omit<Parameters<typeof $entity<Shape, EntityType, typeof this>>[0], 'table'>,
    ) {
        return $entity({ table: this, ...args })
    }
}

export function $table<Shape extends ObjectType, const Definition extends DynamoDbTableDefinition<Shape>>(
    shape: Shape,
    definition: Definition,
) {
    return new DynamoDbTableType<Shape, Definition>(shape, definition)
}
