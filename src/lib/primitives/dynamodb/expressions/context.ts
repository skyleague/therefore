import type { Node } from '../../../cst/node.js'
import { $nullable, NullableType } from '../../nullable/nullable.js'
import type { ObjectType } from '../../object/object.js'
import { $optional, OptionalType } from '../../optional/optional.js'
import { isReservedWord } from '../reserved.js'

function unwrap(s: Node): Node {
    if (s instanceof OptionalType) {
        return unwrap(s.unwrap())
    }
    if (s instanceof NullableType) {
        return unwrap(s.unwrap())
    }
    return s
}

export class FormattedConstOperand {
    public operand: string
    public constructor(operand: string) {
        this.operand = operand
    }
}

export class DynamodbExpressionContext<Shape extends ObjectType = ObjectType> {
    public _attributeNames: Record<string, string>
    public _attributeValues: Record<string, string>
    public _attributeConstValues: Record<string, unknown>
    public _inputSchema: Record<string, Node>
    public shape: Shape

    public constructor(shape: Shape) {
        this._attributeNames = {}
        this._attributeValues = {}
        this._attributeConstValues = {}
        this._inputSchema = {}
        this.shape = shape
    }

    public addConstValue({ value }: { value: unknown }): string {
        const constValue =
            value instanceof Function
                ? `(${value.toString()})()`
                : value instanceof FormattedConstOperand
                  ? value.operand
                  : JSON.stringify(value)
        const [existing] = Object.entries(this._attributeConstValues).find(([, v]) => v === constValue) ?? []
        if (existing) {
            return existing
        }
        const image = `:const${Object.keys(this._attributeConstValues).length}`
        this._attributeConstValues[image] = constValue
        return image
    }

    public addInputSchema({ key, schema }: { key: string; schema: Node }): void {
        const existing = this._inputSchema[key]
        if (existing === undefined) {
            this._inputSchema[key] = schema
            return
        }

        if (unwrap(existing)._type === unwrap(schema)._type) {
            if (existing._type === 'optional' && schema._type === 'nullable') {
                this._inputSchema[key] = $optional(schema)
                return
            }

            if (existing._type === 'nullable' && schema._type === 'optional') {
                this._inputSchema[key] = $nullable(schema)
                return
            }

            if (
                (existing._type === 'nullable' && schema._type === 'nullable') ||
                (existing._type === 'optional' && schema._type === 'optional')
            ) {
                this._inputSchema[key] = schema
                return
            }

            this._inputSchema[key] = unwrap(schema)
            return
        }

        throw new Error(
            `Schema for key ${key} is already defined with a different type (existing: ${existing._type}, new: ${schema._type})`,
        )
    }

    public getShapeSchema({ key, shouldUnwrap }: { key: string; shouldUnwrap: boolean }): Node {
        const schema = this.shape.shape[key]
        if (schema === undefined) {
            throw new Error(`Shape key ${key} not found in ${this.shape}`)
        }
        if (shouldUnwrap) {
            return unwrap(schema)
        }

        return schema
    }

    public attributeName({ key }: { key: string }): string {
        let path = key
        if (isReservedWord(key)) {
            path = this._attributeNames[path] ??= `#${key}`
        }
        return path
    }

    public lookupAttributeName({ path }: { path: string }): string {
        const key = Object.entries(this._attributeNames).find(([, v]) => v === path)?.[0]
        return key ?? path
    }

    public attributeValue({ key }: { key: string }): string {
        this._attributeValues[key] = `:${key}`
        return this._attributeValues[key]
    }
}
