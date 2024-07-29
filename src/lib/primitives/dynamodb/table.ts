import { replaceExtension } from '../../../common/template/path.js'
import type { GenericOutput, TypescriptOutput } from '../../cst/cst.js'
import { Node } from '../../cst/node.js'
import { createWriter } from '../../writer.js'
import type { ObjectType, ShapeToInfer } from '../object/object.js'
import { dynamodbSymbols } from './symbols.js'

export interface DynamoDbTableDefinition<
    Entity extends ObjectType = ObjectType,
    Pk extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'pk',
    CreatedAt extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'createdAt',
    UpdatedAt extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'updatedAt',
    EntityType extends keyof Entity['infer'] & string = keyof Entity['infer'] & string, //'entityType',
> {
    pk: Pk
    sk?: string
    tableName?: string
    createdAt?: CreatedAt
    updatedAt?: UpdatedAt
    entityType?: EntityType
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
                targetPath: ({ _sourcePath: sourcePath }) => replaceExtension(sourcePath, '.table.ts'),
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
                            .newLine()
                            .write('public constructor(')
                            .inlineBlock(() => {
                                tableWriter.writeLine('client')
                            })
                            .write(':')
                            .inlineBlock(() => {
                                tableWriter.writeLine(`client: ${DynamoDBDocument}`)
                            })
                            .write(')')
                            .block(() => {
                                tableWriter.writeLine('this.client = client')
                            })
                    })

                    return tableWriter.toString()
                },
            },
            ...(super._output ?? []),
        ]
    }
}

export function $table<Shape extends ObjectType, const Definition extends DynamoDbTableDefinition<Shape>>(
    shape: Shape,
    definition: Definition,
) {
    return new DynamoDbTableType<Shape, Definition>(shape, definition)
}
