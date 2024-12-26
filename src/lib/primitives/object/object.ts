import type { Simplify } from '@skyleague/axioms/types'
import type { GenericOutput, ThereforeExpr, TypescriptOutput } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'
import { EnumType } from '../enum/enum.js'

import { evaluate, mapValues, omit, pick } from '@skyleague/axioms'
import type { ArbitrarySize, ConstExpr } from '@skyleague/axioms'
import { $optional, OptionalType } from '../optional/optional.js'

export type ObjectShape<Shape extends Record<string, Node> = Record<string, Node>> = {
    [K in keyof Shape]: ConstExpr<Shape[K]>
}

type UndefinedToOptional<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
}

type _ShapeToInferred<Shape> = Simplify<Omit<Shape, keyof UndefinedToOptional<Shape>> & UndefinedToOptional<Shape>>

export type ShapeToInfer<Shape extends Record<string, Node>> = _ShapeToInferred<{
    [K in keyof Shape]: Shape[K]['infer']
}>
type _ShapeToInput<Shape> = Simplify<Omit<Shape, keyof UndefinedToOptional<Shape>> & UndefinedToOptional<Shape>>
export type ShapeToInput<Shape extends Record<string, Node>> = _ShapeToInferred<{
    [K in keyof Shape]: Shape[K]['input']
}>

export type ShapeToPartial<Shape extends Record<string, Node>, Keys extends [...(keyof Shape)[]]> = Keys extends { length: 0 }
    ? {
          [K in keyof Shape]: OptionalType<Shape[K]>
      }
    : {
          [K in keyof Shape]: [K] extends Keys ? OptionalType<Shape[K]> : Shape[K]
      }

export type ShapeToRequired<Shape extends Record<string, Node>, Keys extends [...(keyof Shape)[]]> = Keys extends { length: 0 }
    ? {
          [K in keyof Shape]: Shape[K] extends OptionalType<infer T> ? T : Shape[K]
      }
    : {
          [K in keyof Shape]: [K] extends Keys ? (Shape[K] extends OptionalType<infer T> ? T : Shape[K]) : Shape[K]
      }

export interface ObjectOptions {
    /**
     * Throw an error if the object has unknown additional properties.
     *
     * @default false
     */
    strict?: boolean | undefined

    arbitrary?:
        | {
              size?: ArbitrarySize
          }
        | undefined
}

export class ObjectType<Shape extends Record<string, Node> = Record<string, Node>> extends NodeTrait {
    public override _type = 'object' as const
    public declare _children: Node[]
    public _options: ObjectOptions

    public shape!: {
        [K in keyof Shape]: Shape[K]
    }

    protected declare element?: Node | undefined
    protected declare patternProperties?: Record<string, Node> | undefined
    public override _isCommutative = false
    public declare infer: ShapeToInfer<Shape>
    public declare input: ShapeToInput<Shape>

    public constructor(shape: ObjectShape<Shape>, options: SchemaOptions<ObjectOptions, ShapeToInfer<Shape>>) {
        super(options)
        this._options = options
        this._from({ shape })
    }

    public strict(strict = true): this {
        const clone = ObjectType._clone(this)
        clone._options.strict = strict
        return clone
    }

    public keyof(): EnumType<(keyof Shape)[]> {
        return new EnumType(Object.keys(this.shape), {})
    }

    public extend<Extra extends Record<string, Node>>(extra: ObjectShape<Extra>): ObjectType<Simplify<Shape & Extra>> {
        const clone = ObjectType._clone(this)
        clone._from({
            shape: {
                ...this.shape,
                ...extra,
            },
        })
        return clone as unknown as ObjectType<Simplify<Shape & Extra>>
    }

    public merge<Other extends ObjectType>(other: Other): ObjectType<Simplify<Shape & Other['shape']>> {
        return this.extend(other.shape) as ObjectType<Simplify<Shape & Other['shape']>>
    }

    public pick<Key extends keyof Shape>(...properties: Key[]): ObjectType<Simplify<Pick<Shape, Key>>> {
        const clone = ObjectType._clone(this)
        clone._from({ shape: pick(this.shape, properties) as unknown as Shape })
        return clone as unknown as ObjectType<Simplify<Pick<Shape, Key>>>
    }

    public omit<Key extends keyof Shape>(...properties: Key[]): ObjectType<Simplify<Omit<Shape, Key>>> {
        const clone = ObjectType._clone(this)
        clone._from({ shape: omit(this.shape, properties) as unknown as Shape })
        return clone as unknown as ObjectType<Simplify<Omit<Shape, Key>>>
    }

    public partial<Keys extends (keyof Shape)[]>(...properties: Keys): ObjectType<ShapeToPartial<Shape, Keys>> {
        return new ObjectType(
            mapValues(this.shape, (p, property) =>
                properties.length === 0 || properties.includes(property) ? $optional(p) : p,
            ) as Record<string, Node>,
            {
                ...this._options,
            },
        ) as unknown as ObjectType<ShapeToPartial<Shape, Keys>>
    }

    public required<Keys extends (keyof Shape)[]>(...properties: Keys): ObjectType<ShapeToRequired<Shape, Keys>> {
        return new ObjectType(
            mapValues(this.shape, (p, property) => {
                if (properties.length === 0 || properties.includes(property)) {
                    let field = p
                    while (field instanceof OptionalType) {
                        field = field.unwrap()
                    }
                    return field
                }
                return p
            }) as Record<string, Node>,
            {
                ...this._options,
            },
        ) as unknown as ObjectType<ShapeToRequired<Shape, Keys>>
    }

    public override get _output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                subtype: 'ajv',
                isTypeOnly: true,
                definition: (node, context) => {
                    if (node._type === 'object' && !hasOptionalPrimitive(node) && !hasNullablePrimitive(node)) {
                        return `${context.declare('interface', node)} ${context.render(node)}`
                    }
                    return `${context.declare('type', node)} = ${context.render(node)}`
                },
            },
            {
                type: 'typescript',
                subtype: 'zod',
                isTypeOnly: false,
                definition: (node, context) => {
                    return `${context.declare('const', node)} = ${context.render(node)}`
                },
            },
        ]
    }

    public _from({
        shape = this.shape,
        recordType = this.element,
        patternProperties = this.patternProperties,
    }: {
        shape?: ObjectShape<Shape>
        recordType?: ThereforeExpr | undefined
        patternProperties?: Record<string, ThereforeExpr> | undefined
    }) {
        this.shape = mapValues(shape, (node) => {
            return evaluate(node as ConstExpr<Shape[string]>)
        }) as unknown as typeof this.shape

        if (recordType) {
            this.element = evaluate(recordType)
        }
        if (patternProperties) {
            this.patternProperties = mapValues(patternProperties, (x) => evaluate(x))
        }

        this._children = [
            ...Object.values<Node>(this.shape),
            ...Object.values(this.patternProperties ?? {}),
            ...(this.element !== undefined ? [this.element] : []),
        ]
    }
}

/**
 * Create a new `ObjectType` instance with the given options.
 *
 * ### Example
 * ```ts
 * $object({
 *   foo: $string
 *   bar: $integer
 * })
 * ```
 *
 * @param properties - Key value pairs that define the object.
 * @param options - Additional options to pass to the number.
 *
 * @group Primitives
 */
export function $object<Shape extends Record<string, Node>>(
    properties: ObjectShape<Shape>,
    options: SchemaOptions<ObjectOptions, NoInfer<ShapeToInfer<Shape>>> = {},
): ObjectType<Shape> {
    return new ObjectType<Shape>(properties, options)
}
