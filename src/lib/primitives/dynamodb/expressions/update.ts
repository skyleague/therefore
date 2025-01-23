import type { Node } from '../../../cst/node.js'
import { $number, type NumberType } from '../../number/number.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamoDbEntityType } from '../entity.js'
import { type DynamodbOperand, PathOperand, ValueOperand } from './attributes.js'
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
    public constructor(operand: UpdatePathOperand<Node>, value: DynamodbOperand<Node> | MathOperand | undefined) {
        super(`${operand.image} = ${operand._ref(value)}`)
    }
}

class RemoveAction extends UpdateAction {
    public constructor(operand: UpdatePathOperand<Node>) {
        super(operand.image)
    }
}

class UpdatePathOperand<Shape extends Node> extends PathOperand<Shape> {
    public override _ref<S extends Node>(value: DynamodbOperand<S> | MathOperand | undefined): string {
        if (value instanceof MathOperand) {
            return value.image
        }

        return super._ref(value)
    }
    public set(value: DynamodbOperand<Node> | MathOperand | undefined) {
        return new SetAction(this, value)
    }

    public remove() {
        return new RemoveAction(this)
    }

    public plus(value: DynamodbOperand<NumberType> | MathOperand | undefined) {
        return new MathOperand(`${this.image} + ${this._ref(value)}`, this.originalKey, this._context)
    }

    public minus(value: DynamodbOperand<NumberType> | MathOperand | undefined) {
        return new MathOperand(`${this.image} - ${this._ref(value)}`, this.originalKey, this._context)
    }

    public ifNotExists(value: DynamodbOperand<Node> | MathOperand | undefined) {
        return new UpdatePathOperand(
            `if_not_exists(${this.image}, ${this._ref(value)})`,
            this.originalKey,
            this.shape,
            this._context,
        )
    }

    public listAppend(value: DynamodbOperand<Node> | MathOperand | undefined) {
        return new ListAppend(this, value, this._context)
    }
}

class ListAppend<Shape extends Node> extends UpdatePathOperand<Shape> implements UpdateAction {
    public _image: string
    get action() {
        return `${this._image} = ${this.image}`
    }
    public constructor(
        operand: UpdatePathOperand<Shape>,
        value: DynamodbOperand<Node> | MathOperand | undefined,
        context: DynamodbExpressionContext,
    ) {
        super(`list_append(${operand.image}, ${operand._ref(value)})`, operand.originalKey, operand.shape, context)
        this._image = operand.image
    }
}

class MathOperand extends PathOperand<NumberType> {
    public constructor(expression: string, originalKey: string, context: DynamodbExpressionContext) {
        super(expression, originalKey, $number(), context)
    }

    public override _ref<S extends Node>(value: DynamodbOperand<S> | MathOperand | undefined): string {
        if (value instanceof MathOperand) {
            return value.image
        }

        return super._ref(value)
    }

    public plus(value: DynamodbOperand<NumberType>) {
        return new MathOperand(`${this.image} + ${this._ref(value)}`, this.originalKey, this._context)
    }

    public minus(value: DynamodbOperand<NumberType>) {
        return new MathOperand(`${this.image} - ${this._ref(value)}`, this.originalKey, this._context)
    }
}

export type UpdateBuilder<T extends ObjectType> = (args: {
    existing: {
        [k in keyof T['infer']]-?: UpdatePathOperand<T['shape'][k]>
    }
    input: Record<string, ValueOperand>
    context: DynamodbExpressionContext<T>
}) =>
    | UpdateAction[]
    | {
          [k in keyof T['infer']]?: DynamodbOperand<T['shape'][k]> | MathOperand | RemoveAction | undefined
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
    const existing = new Proxy({} as { [k in keyof T['infer']]-?: UpdatePathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = context.attributeName({ key })

            return new UpdatePathOperand(path, key, context.getShapeSchema({ key, shouldUnwrap: true }), context)
        },
    })
    const input = new Proxy({} as Record<string, Exclude<ValueOperand, undefined>>, {
        get: (_, key: string) => {
            return new ValueOperand(context.attributeValue({ key }), key, context)
        },
    })
    let expression = build({ existing, input, context })
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
