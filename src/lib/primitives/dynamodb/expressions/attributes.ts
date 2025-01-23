import type { ConstExpr } from '@skyleague/axioms'
import type { Node } from '../../../cst/node.js'
import type { DynamodbExpressionContext } from './context.js'

export class FormattedOperand {
    public image: string
    public _originalKey: string
    public _inputKeys: string[]
    public _context: DynamodbExpressionContext
    public constructor(image: string, originalKey: string, inputKeys: string[], context: DynamodbExpressionContext) {
        this.image = image
        this._context = context
        this._inputKeys = inputKeys
        this._originalKey = originalKey
    }
}

export class ValueOperand {
    public image: string
    public _inputKey: string
    public _context: DynamodbExpressionContext
    public constructor(image: string, inputKey: string, context: DynamodbExpressionContext) {
        this.image = image
        this._context = context
        this._inputKey = inputKey
    }

    public setSchema(schema: Node) {
        this._context.addInputSchema({ key: this._inputKey, schema })
    }
}

export class PathOperand<Shape extends Node> {
    public image: string
    public originalKey: string
    public shape: Shape
    public _context: DynamodbExpressionContext
    public constructor(image: string, originalKey: string, shape: Shape, context: DynamodbExpressionContext) {
        this.image = image
        this.originalKey = originalKey
        this.shape = shape
        this._context = context
    }

    public _ref<S extends Node>(value: DynamodbOperand<S> | undefined): string {
        if (value === undefined) {
            throw new Error('operand is required')
        }
        if (value instanceof ValueOperand) {
            value.setSchema(this.shape)
            return value.image
        }
        if (value instanceof FormattedOperand) {
            return this._context.addConstValue({ value, inputKey: value._originalKey })
        }
        if (value instanceof PathOperand) {
            return value.image
        }
        return this._context.addConstValue({ value, inputKey: this.originalKey })
    }
}

export type DynamodbOperand<Shape extends Node> =
    | PathOperand<Shape>
    | ValueOperand
    | FormattedOperand
    | ConstExpr<string | number | boolean>
