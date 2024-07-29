import { type ConstExpr, evaluate } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import type { ObjectType } from '../../object/object.js'
import type { OptionalType } from '../../optional/optional.js'
import type { DynamodbExpressionContext, FormattedConstOperand } from './context.js'

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

type Operand<Shape extends Node> =
    | (Shape extends OptionalType<infer S> ? Operand<S> : PathOperand<Shape>)
    | ValueOperand
    | ConstExpr<string | number | boolean | FormattedConstOperand>
class PathOperand<Shape extends Node> {
    public operand: string
    public originalKey: string
    public shape: Shape
    public _context: DynamodbExpressionContext
    public constructor(operand: string, originalKey: string, shape: Shape, context: DynamodbExpressionContext) {
        this.operand = operand
        this.originalKey = originalKey
        this.shape = shape
        this._context = context
    }

    public _ref(value: Operand<Shape> | undefined): string {
        if (value === undefined) {
            throw new Error('operand is required')
        }
        if (value instanceof ValueOperand) {
            value.setSchema(this.shape)
            return value.operand
        }
        if (value instanceof PathOperand) {
            return value.operand
        }
        return this._context.addConstValue({ value })
    }

    public eq(value: Operand<Shape> | undefined) {
        return new Condition(`${this.operand} = ${this._ref(value)}`, [this.originalKey])
    }

    public gt(value: Operand<Shape> | undefined) {
        return new Condition(`${this.operand} > ${this._ref(value)}`, [this.originalKey])
    }

    public lt(value: Operand<Shape> | undefined) {
        return new Condition(`${this.operand} < ${this._ref(value)}`, [this.originalKey])
    }

    public gte(value: Operand<Shape> | undefined) {
        return new Condition(`${this.operand} >= ${this._ref(value)}`, [this.originalKey])
    }

    public lte(value: Operand<Shape> | undefined) {
        return new Condition(`${this.operand} <= ${this._ref(value)}`, [this.originalKey])
    }

    public neq(value: Operand<Shape> | undefined) {
        return new Condition(`${this.operand} <> ${this._ref(value)}`, [this.originalKey])
    }

    public between(a: Operand<Shape>, b: Operand<Shape>) {
        return new Condition(`${this.operand} BETWEEN ${this._ref(a)} AND ${this._ref(b)}`, [this.originalKey])
    }

    public in(values: Operand<Shape>[]) {
        return new Condition(`${this.operand} IN (${values.map((v) => this._ref(v)).join(', ')})`, [this.originalKey])
    }

    public beginsWith(value: Operand<Shape> | undefined) {
        return new Condition(`begins_with(${this.operand}, ${this._ref(value)})`, [this.originalKey])
    }

    public exists() {
        return new Condition(`attribute_exists(${this.operand})`, [this.originalKey])
    }

    public notExists() {
        return new Condition(`attribute_not_exists(${this.operand})`, [this.originalKey])
    }

    public hasType(type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL') {
        return new Condition(`attribute_type(${this.operand}, ${type})`, [this.originalKey])
    }

    public contains(value: ValueOperand) {
        return new Condition(`contains(${this.operand}, ${this._ref(value)})`, [this.originalKey])
    }

    public size() {
        return new ValueOperand(`size(${this.operand})`, '_', this._context)
    }
}

class ValueOperand {
    public operand: string
    public _inputKey: string
    public _context: DynamodbExpressionContext
    public constructor(operand: string, inputKey: string, context: DynamodbExpressionContext) {
        this.operand = operand
        this._context = context
        this._inputKey = inputKey
    }

    public setSchema(schema: Node) {
        this._context.addInputSchema({ key: this._inputKey, schema })
    }
}

export type ConditionBuilder<T extends ObjectType> = (
    existing: { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> },
    input: Record<string, ValueOperand>,
) => ConditionExpression

export function conditionExpression<T extends ObjectType>({
    build,
    context,
}: {
    build: ConditionBuilder<T>
    context: DynamodbExpressionContext<NoInfer<T>>
}) {
    const existing = new Proxy({} as { [k in keyof T['infer']]-?: PathOperand<T['shape'][k]> }, {
        get: (_, key: string) => {
            const path = context.attributeName({ key })

            return new PathOperand(path, key, context.getShapeSchema({ key, shouldUnwrap: true }), context)
        },
    })
    const input = new Proxy({} as Record<string, Exclude<ValueOperand, undefined>>, {
        get: (_, key: string) => {
            return new ValueOperand(context.attributeValue({ key }), key, context)
        },
    })
    const expression = Condition.from(build(existing, input))
    return {
        expression: expression.expression,
        comparands: expression.comparands,
    }
}
