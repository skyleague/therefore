import { evaluate, mapValues } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamodbCommandSchemaBuilder } from '../commands/builder.js'
import type { StorageShapeType } from '../entity.js'
import type { IndexDefinition } from '../table.js'
import { type DynamodbOperand, type FormattedOperand, PathOperand, ValueOperand } from './attributes.js'

type ConditionExpression =
    | Condition
    | { and: [ConditionExpression, ConditionExpression, ...ConditionExpression[]] }
    | { or: [ConditionExpression, ConditionExpression, ...ConditionExpression[]] }

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

    public contains(value: ValueOperand | FormattedOperand | undefined) {
        return new Condition(`contains(${this.image}, ${this._ref(value, { element: true })})`, [this.originalKey])
    }

    public size() {
        return new ValueOperand(`size(${this.image})`, '_')
    }
}

export type ConditionBuilder<T extends ObjectType, AttributeFormatters> = (args: {
    stored: { [k in keyof T['infer']]-?: ConditionPathOperand<T['shape'][k]> }
    args: { [k in keyof T['infer']]: ValueOperand } & { [key: string]: ValueOperand }
    formatters: AttributeFormatters
}) => ConditionExpression

export function conditionExpression<
    Entity extends ObjectType = ObjectType,
    BaseShape extends ObjectType = ObjectType,
    const Pk extends keyof Entity['shape'] & string = keyof Entity['shape'] & string,
    const Sk extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const CreatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const UpdatedAt extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const EntityType extends (keyof Entity['shape'] & string) | undefined = (keyof Entity['shape'] & string) | undefined,
    const Indexes extends Record<string, IndexDefinition<string, string[], string | undefined>> | undefined = Record<
        string,
        IndexDefinition<string, string[], string | undefined>
    >,
    const AttributeFormatters extends Record<string, (keys: Record<string, string>) => string> | undefined =
        | Record<string, (keys: Record<string, string>) => string>
        | undefined,
>({
    build,
    schema,
}: {
    build: ConditionBuilder<StorageShapeType<Entity, BaseShape>, AttributeFormatters>
    schema: DynamodbCommandSchemaBuilder<
        Entity,
        BaseShape,
        Pk,
        Sk,
        CreatedAt,
        UpdatedAt,
        EntityType,
        Indexes,
        AttributeFormatters
    >
}) {
    const stored = new Proxy({} as { [k in keyof Entity['infer']]-?: ConditionPathOperand<Entity['shape'][k]> }, {
        get: (_, key: string) => {
            const path = schema.attributeName({ key })

            return new ConditionPathOperand({
                image: path,
                originalKey: key,
                schema: schema as DynamodbCommandSchemaBuilder,

                shape: schema.entity.storageShape.shape[key],
                // shape: _context.getShapeSchema({ key, shouldUnwrap: true }),
            })
        },
    })
    const args = new Proxy({} as Record<string, ValueOperand> & { [key: string]: ValueOperand }, {
        get: (_, key: string) => {
            return ValueOperand.from({ shapeKey: key, schema })
        },
    })
    const expression = Condition.from(
        build({
            stored,
            args,
            formatters: mapValues(schema.entity._attributeFormatters ?? {}, (f, key) => schema.entity._attributeFormatters[key]),
        }),
    )
    return {
        expression: expression.expression,
        comparands: expression.comparands,
    }
}
