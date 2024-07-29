import type { ConstExpr } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import { $number, type NumberType } from '../../number/number.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import type { DynamodbExpressionContext } from './context.js'

class Update {
    public expression: string
    public constructor(expression: string) {
        this.expression = expression
    }

    public static from(update: UpdateAction[]): Update {
        const expressions: string[] = []

        const setActions = update.filter((a) => a instanceof SetAction || a instanceof ListAppend)
        if (setActions.length > 0) {
            expressions.push(`SET ${setActions.map((a) => a.action).join(', ')}`)
        }

        const removeActions = update.filter((a) => a instanceof RemoveAction)
        if (removeActions.length > 0) {
            expressions.push(`REMOVE ${removeActions.map((a) => a.action).join(', ')}`)
        }

        return new Update(expressions.join(' '))
    }
}

class UpdateAction {
    public action: string
    public constructor(expression: string) {
        this.action = expression
    }
}
class SetAction extends UpdateAction {
    public constructor(operand: PathOperand<Node>, value: Operand<Node> | MathOperand | undefined) {
        super(`${operand.image} = ${operand._ref(value)}`)
    }
}

class RemoveAction extends UpdateAction {
    public constructor(operand: PathOperand<Node>) {
        super(operand.image)
    }
}
// class OptionalOperand<Shape extends Node> extends PathOperand<Shape> {
//     public operand: PathOperand<Shape>
//     public constructor(operand: PathOperand<Shape>) {
//         this.operand = operand
//     }
// }

type Operand<Shape extends Node> = PathOperand<Shape> | ValueOperand | ConstExpr<string | number | boolean>
class PathOperand<Shape extends Node> {
    public image: string
    public shape: Shape

    public _context: DynamodbExpressionContext
    public constructor(operand: string, shape: Shape, context: DynamodbExpressionContext) {
        this.image = operand
        this.shape = shape
        this._context = context
    }

    public _ref(value: Operand<Node> | MathOperand | undefined): string {
        if (value === undefined) {
            throw new Error('operand is required')
        }
        if (value instanceof ValueOperand) {
            value.setSchema(this.shape)
            return value.image
        }
        if (value instanceof MathOperand) {
            return value.image
        }
        if (value instanceof PathOperand) {
            return value.image
        }

        return this._context.addConstValue({ value })
    }

    public set(value: Operand<Node> | MathOperand | undefined) {
        return new SetAction(this, value)
    }

    public remove() {
        return new RemoveAction(this)
    }

    public plus(value: Operand<NumberType> | MathOperand | undefined) {
        return new MathOperand(`${this.image} + ${this._ref(value)}`, this._context)
    }

    public minus(value: Operand<NumberType> | MathOperand | undefined) {
        return new MathOperand(`${this.image} - ${this._ref(value)}`, this._context)
    }

    public ifNotExists(value: Operand<Node> | MathOperand | undefined) {
        return new PathOperand(`if_not_exists(${this.image}, ${this._ref(value)})`, this.shape, this._context)
    }

    public listAppend(value: Operand<Node> | MathOperand | undefined) {
        return new ListAppend(this, value, this._context)
    }
}

class ListAppend<Shape extends Node> extends PathOperand<Shape> implements UpdateAction {
    public _image: string
    get action() {
        return `${this._image} = ${this.image}`
    }
    public constructor(
        operand: PathOperand<Shape>,
        value: Operand<Node> | MathOperand | undefined,
        context: DynamodbExpressionContext,
    ) {
        super(`list_append(${operand.image}, ${operand._ref(value)})`, operand.shape, context)
        this._image = operand.image
    }
}

class ValueOperand {
    public image: string
    public _inputKey: string
    public _context: DynamodbExpressionContext
    public constructor(operand: string, inputKey: string, context: DynamodbExpressionContext) {
        this.image = operand
        this._context = context
        this._inputKey = inputKey
    }

    public setSchema(schema: Node) {
        this._context.addInputSchema({ key: this._inputKey, schema })
    }
}

class MathOperand {
    public image: string
    public _context: DynamodbExpressionContext
    public constructor(expression: string, context: DynamodbExpressionContext) {
        this.image = expression
        this._context = context
    }

    public _ref(value: Operand<Node> | MathOperand | undefined): string {
        if (value === undefined) {
            throw new Error('operand is required')
        }
        if (value instanceof ValueOperand) {
            value.setSchema($number())
            return value.image
        }
        if (value instanceof MathOperand) {
            return value.image
        }
        if (value instanceof PathOperand) {
            return value.image
        }

        return this._context.addConstValue({ value })
    }

    public plus(value: Operand<NumberType>) {
        return new MathOperand(`${this.image} + ${this._ref(value)}`, this._context)
    }

    public minus(value: Operand<NumberType>) {
        return new MathOperand(`${this.image} - ${this._ref(value)}`, this._context)
    }
}

export type UpdateBuilder<T extends ObjectType> = (
    existing: {
        [k in keyof T['infer']]-?: PathOperand<T['shape'][k]>
    },
    input: Record<string, ValueOperand>,
) =>
    | UpdateAction[]
    | {
          [k in keyof T['infer']]?: Operand<T['shape'][k]> | MathOperand | RemoveAction | undefined
      }

export function updateExpression<T extends ObjectType>({
    entity,
    build,
    context,
}: {
    entity: DynamoDbEntityType<NoInfer<T>>
    build: UpdateBuilder<T>
    context: DynamodbExpressionContext<NoInfer<T>>
}) {
    const existing = new Proxy({} as { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = context.attributeName({ key })

            return new PathOperand(path, context.getShapeSchema({ key, shouldUnwrap: true }), context)
        },
    })
    const input = new Proxy({} as Record<string, Exclude<ValueOperand, undefined>>, {
        get: (_, key: string) => {
            return new ValueOperand(context.attributeValue({ key }), key, context)
        },
    })
    let expression = build(existing, input)
    expression = Array.isArray(expression)
        ? expression
        : Object.entries(expression).map(([key, value]): UpdateAction => {
              if (value === undefined) {
                  throw new Error(`value for ${key} is undefined`)
              }
              if (value instanceof RemoveAction) {
                  return existing[key as keyof T['infer']].remove()
              }
              return existing[key as keyof T['infer']].set(value)
          })

    if (entity.table.definition.createdAt !== undefined) {
        expression.push(
            // biome-ignore lint/style/noNonNullAssertion: must be defined
            existing[entity.table.definition.createdAt]!.set(
                // biome-ignore lint/style/noNonNullAssertion: must be defined
                existing[entity.table.definition.createdAt]!.ifNotExists(() => new Date().toISOString()),
            ),
        )
    }
    if (entity.table.definition.updatedAt !== undefined) {
        // biome-ignore lint/style/noNonNullAssertion: must be defined
        expression.push(existing[entity.table.definition.updatedAt]!.set(() => new Date().toISOString()))
    }
    expression.push(
        // biome-ignore lint/style/noNonNullAssertion: must be defined
        existing[entity.table.definition.entityType]!.set(
            // biome-ignore lint/style/noNonNullAssertion: must be defined
            existing[entity.table.definition.entityType]!.ifNotExists(entity.entityType),
        ),
    )
    return {
        expression: Update.from(expression).expression,
    }
}
