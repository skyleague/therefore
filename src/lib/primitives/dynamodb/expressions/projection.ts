import type { Node } from '../../../cst/node.js'
import { $object, type ObjectType } from '../../object/object.js'
import { PathOperand } from './attributes.js'
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
            projection.map((x) => x.image).join(', '),
            $object(
                Object.fromEntries(projection.map((x) => [x._context.lookupAttributeName({ path: x.image }), x.shape])),
            ).validator(),
        )
    }
}

export type ProjectionBuilder<T extends ObjectType> = (args: {
    existing: { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> }
    context: DynamodbExpressionContext<T>
}) => ProjectionExpression

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

            return new PathOperand(path, key, context.getShapeSchema({ key, shouldUnwrap: false }), context)
        },
    })
    const expression = build({ existing, context })
    const projection = Projection.from(expression)

    return {
        expression: projection.expression,
        schema: projection.schema,
    }
}
