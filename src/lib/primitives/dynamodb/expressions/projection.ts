import type { Node } from '../../../cst/node.js'
import { $object, type ObjectType } from '../../object/object.js'
import type { DynamodbExpressionContext } from './context.js'

type ProjectionExpression = [PathOperand<Node>, ...PathOperand<Node>[]]
class Projection {
    public expression: string
    public schema: ObjectType

    public constructor(expression: string, schema: ObjectType) {
        this.expression = expression
        this.schema = schema
    }

    public static from(projection: ProjectionExpression): Projection {
        return new Projection(
            projection.map((x) => x.operand).join(', '),
            $object(
                Object.fromEntries(projection.map((x) => [x._context.lookupAttributeName({ path: x.operand }), x.shape])),
            ).validator(),
        )
    }
}

class PathOperand<Shape extends Node> {
    public operand: string
    public shape: Shape
    public _context: DynamodbExpressionContext
    public constructor(operand: string, shape: Shape, context: DynamodbExpressionContext) {
        this.operand = operand
        this.shape = shape
        this._context = context
    }
}

export type ProjectionBuilder<T extends ObjectType> = (
    existing: { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> },
    // input: Record<string, ValueOperand>,
) => ProjectionExpression

export function projectionExpression<T extends ObjectType>({
    build,
    context,
}: {
    build: ProjectionBuilder<T>
    context: DynamodbExpressionContext<NoInfer<T>>
}) {
    const existing = new Proxy({} as { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = context.attributeName({ key })

            return new PathOperand(path, context.getShapeSchema({ key, shouldUnwrap: true }), context)
        },
    })
    const expression = build(existing)
    const projection = Projection.from(expression)

    return {
        expression: projection.expression,
        schema: projection.schema,
    }
}
