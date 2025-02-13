import { evaluate } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import type { ObjectType } from '../../object/object.js'
import { type DynamodbOperand, type FormattedOperand, PathOperand, ValueOperand } from './attributes.js'
import type { DynamodbExpressionContext } from './context.js'

type ConditionExpression =
    | Condition
    | { and: [ConditionExpression, ...ConditionExpression[]] }
    | { or: [ConditionExpression, ...ConditionExpression[]] }
export class Condition {
    public expression: string
    public comparands: string[]
    public constructor(expression: string, comparands: string[]) {
        this.expression = expression
        this.comparands = comparands
    }

    public not() {
        return new Condition(`NOT (${evaluate(this.expression)})`, this.comparands)
    }

    public static from(condition: ConditionExpression): Condition {
        if ('and' in condition) {
            if (condition.and.length === 1) {
                return Condition.from(condition.and[0])
            }
            return new AndCondition(condition.and.map(Condition.from))
        }
        if ('or' in condition) {
            if (condition.or.length === 1) {
                return Condition.from(condition.or[0])
            }
            return new OrCondition(condition.or.map(Condition.from))
        }
        return condition
    }
}

class AndCondition extends Condition {
    public constructor(conditions: Condition[]) {
        super(
            conditions
                .map(evaluate)
                .map((c) => (c instanceof AndCondition || c instanceof OrCondition ? `(${c.expression})` : c.expression))
                .join(' AND '),
            conditions.flatMap((x) => x.comparands),
        )
    }
}

class OrCondition extends Condition {
    public constructor(conditions: Condition[]) {
        super(
            conditions
                .map(evaluate)
                .map((c) => (c instanceof OrCondition || c instanceof AndCondition ? `(${c.expression})` : c.expression))
                .join(' OR '),
            conditions.flatMap((x) => x.comparands),
        )
    }
}

class ConditionPathOperand<Shape extends Node> extends PathOperand<Shape> {
    public eq(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`${this.image} = ${this._ref(value)}`, [this.originalKey])
    }

    public gt(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`${this.image} > ${this._ref(value)}`, [this.originalKey])
    }

    public lt(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`${this.image} < ${this._ref(value)}`, [this.originalKey])
    }

    public gte(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`${this.image} >= ${this._ref(value)}`, [this.originalKey])
    }

    public lte(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`${this.image} <= ${this._ref(value)}`, [this.originalKey])
    }

    public neq(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`${this.image} <> ${this._ref(value)}`, [this.originalKey])
    }

    public between(a: DynamodbOperand<Shape>, b: DynamodbOperand<Shape>) {
        return new Condition(`${this.image} BETWEEN ${this._ref(a)} AND ${this._ref(b)}`, [this.originalKey])
    }

    public in(values: DynamodbOperand<Shape>[]) {
        return new Condition(`${this.image} IN (${values.map((v) => this._ref(v)).join(', ')})`, [this.originalKey])
    }

    public beginsWith(value: DynamodbOperand<Shape> | undefined) {
        return new Condition(`begins_with(${this.image}, ${this._ref(value)})`, [this.originalKey])
    }

    public exists() {
        return new Condition(`attribute_exists(${this.image})`, [this.originalKey])
    }

    public notExists() {
        return new Condition(`attribute_not_exists(${this.image})`, [this.originalKey])
    }

    public hasType(type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL') {
        return new Condition(`attribute_type(${this.image}, ${type})`, [this.originalKey])
    }

    public contains(value: ValueOperand | FormattedOperand) {
        return new Condition(`contains(${this.image}, ${this._ref(value)})`, [this.originalKey])
    }

    public size() {
        return new ValueOperand(`size(${this.image})`, '_', this._context)
    }
}

export type ConditionBuilder<T extends ObjectType> = (args: {
    existing: { [k in keyof T['infer']]-?: ConditionPathOperand<T['shape'][k]> }
    input: Record<string, ValueOperand>
    context: DynamodbExpressionContext<T>
}) => ConditionExpression

export function conditionExpression<T extends ObjectType>({
    build,
    context,
}: {
    build: ConditionBuilder<T>
    context: DynamodbExpressionContext<NoInfer<T>>
}) {
    const existing = new Proxy({} as { [k in keyof T['infer']]-?: ConditionPathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = context.attributeName({ key })

            return new ConditionPathOperand(path, key, context.getShapeSchema({ key, shouldUnwrap: true }), context)
        },
    })
    const input = new Proxy({} as Record<string, Exclude<ValueOperand, undefined>>, {
        get: (_, key: string) => {
            return new ValueOperand(context.attributeValue({ key }), key, context)
        },
    })
    const expression = Condition.from(build({ existing, input, context }))
    return {
        expression: expression.expression,
        comparands: expression.comparands,
    }
}
