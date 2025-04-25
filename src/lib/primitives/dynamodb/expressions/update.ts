import type { Node } from '../../../cst/node.js'
import { $number, type NumberType } from '../../number/number.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamodbCommandSchemaBuilder } from '../commands/builder.js'
import type { DynamoDbEntityType } from '../entity.js'
import { type DynamodbOperand, PathOperand, ValueOperand } from './attributes.js'

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
    public constructor(operand: UpdatePathOperand<Node>, value: DynamodbOperand | MathOperand | undefined) {
        super(`${operand.image} = ${operand._ref(value)}`)
    }
}

class RemoveAction extends UpdateAction {
    public constructor(operand: UpdatePathOperand<Node>) {
        super(operand.image)
    }
}

class UpdatePathOperand<Shape extends Node> extends PathOperand<Shape> {
    public override _ref(value: DynamodbOperand | MathOperand | undefined): string {
        if (value instanceof MathOperand) {
            return value.image
        }

        return super._ref(value)
    }
    public set(value: DynamodbOperand | MathOperand | undefined) {
        return new SetAction(this, value)
    }

    public remove() {
        return new RemoveAction(this)
    }

    public plus(value: DynamodbOperand | MathOperand | undefined) {
        return new MathOperand({
            expression: `${this.image} + ${this._ref(value)}`,
            originalKey: this.originalKey,
            schema: this.schema,
        })
    }

    public minus(value: DynamodbOperand | MathOperand | undefined) {
        return new MathOperand({
            expression: `${this.image} - ${this._ref(value)}`,
            originalKey: this.originalKey,
            schema: this.schema,
        })
    }

    public ifNotExists(value: DynamodbOperand | MathOperand | undefined) {
        return new UpdatePathOperand({
            image: `if_not_exists(${this.image}, ${this._ref(value)})`,
            originalKey: this.originalKey,
            schema: this.schema,

            shape: this.shape,
        })
    }

    public listAppend(value: DynamodbOperand<Node> | MathOperand | undefined) {
        return new ListAppend({
            operand: this,
            value,
        })
    }
}

class ListAppend<Shape extends Node> extends UpdatePathOperand<Shape> implements UpdateAction {
    public _image: string
    get action() {
        return `${this._image} = ${this.image}`
    }
    public constructor({
        operand,
        value,
    }: {
        operand: UpdatePathOperand<Shape>
        value: DynamodbOperand<Node> | MathOperand | undefined
    }) {
        super({
            image: `list_append(${operand.image}, ${operand._ref(value)})`,
            originalKey: operand.originalKey,
            schema: operand.schema,

            shape: operand.shape,
        })
        this._image = operand.image
    }
}

class MathOperand extends PathOperand<NumberType> {
    public constructor({
        expression,
        originalKey,
        schema,
    }: {
        expression: string
        originalKey: string
        schema: DynamodbCommandSchemaBuilder
    }) {
        super({
            image: expression,
            originalKey,
            schema,
            shape: $number(),
        })
    }
    public override _ref<S extends Node>(value: DynamodbOperand<S> | MathOperand | undefined): string {
        if (value instanceof MathOperand) {
            return value.image
        }

        return super._ref(value)
    }

    public plus(value: DynamodbOperand<NumberType>) {
        return new MathOperand({
            expression: `${this.image} + ${this._ref(value)}`,
            originalKey: this.originalKey,
            schema: this.schema,
            // _context: this._context,
        })
    }

    public minus(value: DynamodbOperand<NumberType>) {
        return new MathOperand({
            expression: `${this.image} - ${this._ref(value)}`,
            originalKey: this.originalKey,
            schema: this.schema,
        })
    }
}

export type UpdateBuilder<T extends ObjectType> = (args: {
    stored: {
        [k in keyof T['infer']]-?: UpdatePathOperand<T['shape'][k]>
    }
    args: Record<string, ValueOperand>
}) =>
    | UpdateAction[]
    | {
          [k in keyof T['infer']]?: DynamodbOperand<T['shape'][k]> | MathOperand | RemoveAction | undefined
      }

export function updateExpression<T extends ObjectType>({
    entity,
    build,
    schema,
}: {
    entity: DynamoDbEntityType<NoInfer<T>>
    build: UpdateBuilder<T>
    schema: DynamodbCommandSchemaBuilder<T>
}) {
    const stored = new Proxy({} as { [k in keyof T['infer']]-?: UpdatePathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = schema.attributeName({ key })

            return new UpdatePathOperand({
                image: path,
                originalKey: key,
                schema: schema as DynamodbCommandSchemaBuilder,

                shape: schema.entity.storageShape.shape[key],

                // shape: _context.getShapeSchema({ key, shouldUnwrap: true }),
            })
        },
    })
    const args = new Proxy({} as Record<string, Exclude<ValueOperand, undefined>>, {
        get: (_, key: string) => {
            return ValueOperand.from({ shapeKey: key, schema })
        },
    })
    let expression = build({ stored, args })
    expression = Array.isArray(expression)
        ? expression
        : Object.entries(expression).map(([key, value]): UpdateAction => {
              if (value === undefined) {
                  throw new Error(`value for ${key} is undefined`)
              }
              if (value instanceof RemoveAction) {
                  return stored[key as keyof T['infer']].remove()
              }
              return stored[key as keyof T['infer']].set(value)
          })

    if (entity.table.definition.createdAt !== undefined) {
        expression.push(
            // biome-ignore lint/style/noNonNullAssertion: must be defined
            stored[entity.table.definition.createdAt]!.set(
                // biome-ignore lint/style/noNonNullAssertion: must be defined
                stored[entity.table.definition.createdAt]!.ifNotExists(() => new Date().toISOString()),
            ),
        )
    }
    if (entity.table.definition.updatedAt !== undefined) {
        // biome-ignore lint/style/noNonNullAssertion: must be defined
        expression.push(stored[entity.table.definition.updatedAt]!.set(() => new Date().toISOString()))
    }

    if (entity.table.definition.entityType !== undefined) {
        expression.push(
            // biome-ignore lint/style/noNonNullAssertion: must be defined
            stored[entity.table.definition.entityType]!.set(
                // biome-ignore lint/style/noNonNullAssertion: must be defined
                stored[entity.table.definition.entityType]!.ifNotExists(entity.entityType),
            ),
        )
    }
    return {
        expression: Update.from(expression).expression,
    }
}
