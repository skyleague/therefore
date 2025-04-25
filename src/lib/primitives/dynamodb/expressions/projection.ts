import type { Node } from '../../../cst/node.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamodbCommandSchemaBuilder } from '../commands/builder.js'
import { PathOperand } from './attributes.js'

type ProjectionExpression = [PathOperand<Node>, ...PathOperand<Node>[]]

interface Projection {
    stored: string
    result: ObjectType
}

export type ProjectionBuilder<T extends ObjectType> = (args: {
    stored: { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> }
}) => ProjectionExpression

export function projectionExpression<T extends ObjectType>({
    build,
    schema,
}: {
    build: ProjectionBuilder<T>
    schema: DynamodbCommandSchemaBuilder<T>
}): Projection {
    const stored = new Proxy({} as { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = schema.attributeName({ key })

            return new PathOperand({
                image: path,
                originalKey: key,
                schema: schema as DynamodbCommandSchemaBuilder,

                shape: schema.entity.storageShape.shape[key],

                // schema: context.getShapeSchema({ key, shouldUnwrap: false }),
            })
        },
    })
    const expression = build({ stored })

    return {
        stored: expression.map((x) => x.image).join(', '),
        result: schema.entity.storageShape.pick(...expression.map((x) => x.originalKey)),
        // schema: {},
        // $object(
        //     Object.fromEntries(expression.map((x) => [context.lookupAttributeName({ path: x.image }), x.shape])),
        // ).validator(),
    }
}
