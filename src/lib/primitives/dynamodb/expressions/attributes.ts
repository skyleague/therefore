import type { ConstExpr } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import { ArrayType } from '../../array/array.js'
import type { ObjectType } from '../../object/object.js'
import type { DynamodbCommandSchemaBuilder } from '../commands/builder.js'

export type RefArgs = { schema: DynamodbCommandSchemaBuilder<any>; shape: Node }

export class FormattedOperand<Shape extends ObjectType = ObjectType> {
    public image!: string
    public _originalKey: string
    public _inputKeys: string[] = []

    public _formatter: ((keys: Record<keyof Shape['shape'], string>) => string) | undefined

    private constructor({ originalKey }: { originalKey: string }) {
        this._originalKey = originalKey
    }

    public _ref({ schema }: RefArgs) {
        for (const key of this._inputKeys) {
            schema._usedAttributes.add(key)
        }
        return schema.referenceValue({ value: this, inputKey: this._originalKey })
    }

    public static from<Shape extends ObjectType = ObjectType>(
        attribute: string,
        formatter: ((keys: Record<keyof Shape['shape'], string>) => string) | undefined,
    ) {
        const operand = new FormattedOperand({ originalKey: attribute })
        operand._formatter = formatter
        const shapeProxy = new Proxy({} as Record<keyof Shape['shape'], string>, {
            get: (_, key: string) => {
                operand._inputKeys.push(key)
                return `\${${key}}`
            },
        })
        if (formatter === undefined) {
            operand.image = attribute
            const _activateKeyAttribute = shapeProxy[attribute]
        } else {
            const formatted = formatter(shapeProxy)
            operand.image = operand._inputKeys.length > 0 ? `\`${formatted}\`` : `'${formatted}'`
        }
        return operand
    }
}

export class ValueOperand {
    public image: string

    public shapeKey: string

    protected constructor(image: string, shapeKey: string) {
        this.image = image
        this.shapeKey = shapeKey
    }

    public _ref({ schema, shape }: RefArgs) {
        return schema.setArgumentValue({ key: this.shapeKey, operand: this, value: shape })
    }

    static from({ shapeKey, schema }: { shapeKey: string; schema: DynamodbCommandSchemaBuilder }) {
        const attribute = schema.attributeValue({ key: shapeKey })

        return new ValueOperand(attribute, shapeKey)
    }
}

export class PathOperand<Shape extends Node> {
    public image: string
    public originalKey: string
    public schema: DynamodbCommandSchemaBuilder

    public shape: Shape

    public constructor({
        image,
        originalKey,
        schema,
        shape,
    }: {
        image: string
        originalKey: string
        schema: DynamodbCommandSchemaBuilder
        shape: Shape
    }) {
        this.image = image
        this.originalKey = originalKey
        this.schema = schema
        this.shape = shape
    }

    public _ref(value: DynamodbOperand | undefined, { element = false }: { element?: boolean } = {}): string {
        if (value === undefined) {
            throw new Error('operand is required')
        }
        if (value instanceof FormattedOperand) {
            return value._ref({ schema: this.schema, shape: this.shape })
        }
        if (value instanceof ValueOperand) {
            if (element) {
                if (this.shape instanceof ArrayType) {
                    return value._ref({ schema: this.schema, shape: this.shape.element })
                }
            }
            return value._ref({ schema: this.schema, shape: this.shape })
        }
        if (value instanceof PathOperand) {
            return value.image
        }
        return this.schema.referenceValue({ value, inputKey: this.originalKey })
    }
}

export type DynamodbOperand<_ extends Node = Node> =
    | PathOperand<_>
    | ValueOperand
    | FormattedOperand
    | ConstExpr<string | number | boolean>
