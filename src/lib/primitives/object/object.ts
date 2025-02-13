import type { Simplify } from '@skyleague/axioms/types'
import type { GenericOutput, ThereforeExpr, TypescriptOutput } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { NodeTrait } from '../../cst/mixin.js'
import type { Node } from '../../cst/node.js'
import type { SchemaOptions } from '../base.js'
import { EnumType, type _KeyOfType } from '../enum/enum.js'

import { evaluate, mapValues, omit, pick } from '@skyleague/axioms'
import type { ArbitrarySize, ConstExpr } from '@skyleague/axioms'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import type { TypescriptZodWalkerContext } from '../../visitor/typescript/typescript-zod.js'
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
    protected declare key?: Node | undefined
    protected declare patternProperties?: Record<string, Node> | undefined

    protected declare _omitted?:
        | {
              mask: (keyof Shape)[]
              origin: ObjectType
          }
        | undefined
    protected declare _picked?:
        | {
              mask: (keyof Shape)[]
              origin: ObjectType
          }
        | undefined
    protected declare _extended?:
        | {
              origin: ObjectType
              extends: Shape
          }
        | undefined
    protected declare _partial?:
        | {
              origin: ObjectType
              mask: (keyof Shape)[] | undefined
          }
        | undefined
    protected declare _required?:
        | {
              origin: ObjectType
              mask: (keyof Shape)[] | undefined
          }
        | undefined

    protected declare _merged?:
        | {
              origin: ObjectType
              merged: ObjectType
          }
        | undefined

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
        const keyof = new EnumType(Object.keys(this.shape), {})
        ;(keyof as _KeyOfType)._keyof = {
            origin: this as ObjectType,
        }
        keyof._children?.push(this)
        return keyof
    }

    public extend<Extra extends Record<string, Node>>(extra: ObjectShape<Extra>): ObjectType<Simplify<Shape & Extra>> {
        const clone = ObjectType._clone(this)
        clone._from({
            shape: {
                ...this.shape,
                ...extra,
            },
        })
        clone._resetTypeProperties()
        const extendedShape = mapValues(extra, (node) => {
            return evaluate(node)
        }) as unknown as typeof this.shape
        clone._extended = {
            extends: extendedShape,
            origin: this as ObjectType,
        }
        clone._children = [this, ...Object.values<Node>(extendedShape)]
        return clone as unknown as ObjectType<Simplify<Shape & Extra>>
    }

    public merge<Other extends ObjectType>(other: Other): ObjectType<Simplify<Shape & Other['shape']>> {
        const merged = ObjectType._clone(this)
        merged._from({
            shape: {
                ...this.shape,
                ...other.shape,
            },
        })
        merged._resetTypeProperties()
        merged._merged = {
            origin: this as ObjectType,
            merged: other as ObjectType,
        }
        merged._children = [other, this]
        return merged
    }

    public pick<Key extends keyof Shape>(...properties: Key[]): ObjectType<Simplify<Pick<Shape, Key>>> {
        const clone = ObjectType._clone(this)
        clone._from({ shape: pick(this.shape, properties) as unknown as Shape })
        clone._resetTypeProperties()
        clone._picked = {
            mask: properties,
            origin: this as ObjectType,
        }
        clone._children = [this]
        return clone as unknown as ObjectType<Simplify<Pick<Shape, Key>>>
    }

    public omit<Key extends keyof Shape>(...properties: Key[]): ObjectType<Simplify<Omit<Shape, Key>>> {
        const clone = ObjectType._clone(this)
        clone._from({ shape: omit(this.shape, properties) as unknown as Shape })
        clone._resetTypeProperties()
        clone._omitted = {
            mask: properties,
            origin: this as ObjectType,
        }
        clone._children = [this]
        return clone as unknown as ObjectType<Simplify<Omit<Shape, Key>>>
    }

    public partial<Keys extends (keyof Shape)[]>(...properties: Keys): ObjectType<ShapeToPartial<Shape, Keys>> {
        const partial = new ObjectType(
            mapValues(this.shape, (p, property) =>
                properties.length === 0 || properties.includes(property) ? $optional(p) : p,
            ) as Record<string, Node>,
            {
                ...this._options,
            },
        ) as unknown as ObjectType<ShapeToPartial<Shape, Keys>>

        partial._resetTypeProperties()
        partial._partial = {
            origin: this as ObjectType,
            mask: properties,
        }
        partial._children = [this]
        return partial
    }

    public required<Keys extends (keyof Shape)[]>(...properties: Keys): ObjectType<ShapeToRequired<Shape, Keys>> {
        const required = new ObjectType(
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
        required._resetTypeProperties()
        required._required = {
            origin: this as ObjectType,
            mask: properties,
        }
        required._children = [this]
        return required
    }

    public override get _output(): (
        | TypescriptOutput<TypescriptTypeWalkerContext>
        | TypescriptOutput<TypescriptZodWalkerContext>
        | GenericOutput
    )[] {
        return [
            {
                type: 'typescript',
                subtype: 'ajv',
                isTypeOnly: true,
                definition: (node, context) => {
                    node._attributes.typescript['type:path'] = context.targetPath
                    if (node._type === 'object' && !hasOptionalPrimitive(node) && !hasNullablePrimitive(node) && !this.key) {
                        if (
                            (node as _OmitType)._omitted !== undefined ||
                            (node as _PickType)._picked !== undefined ||
                            (node as _MergeType)._merged !== undefined ||
                            (node as _ExtendType)._extended !== undefined
                        ) {
                            return `${context.declare('type', node)} = ${context.render(node)}`
                        }
                        return `${context.declare('interface', node)} ${context.render(node)}`
                    }
                    return `${context.declare('type', node)} = ${context.render(node)}`
                },
            } satisfies TypescriptOutput<TypescriptTypeWalkerContext>,
            {
                type: 'typescript',
                subtype: 'zod',
                isTypeOnly: false,
            } satisfies TypescriptOutput<TypescriptZodWalkerContext>,
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

    private _resetTypeProperties() {
        this._extended = undefined
        this._omitted = undefined
        this._picked = undefined
        this._merged = undefined
        this._partial = undefined
        this._origin = {}
    }
}

export class _OmitType extends ObjectType {
    public declare _omitted?: {
        mask: string[]
        origin: ObjectType
    }
}

export class _PickType extends ObjectType {
    public declare _picked?: {
        mask: string[]
        origin: ObjectType
    }
}

export class _ExtendType extends ObjectType {
    public declare _extended?: {
        extends: ObjectType['shape']
        origin: ObjectType
    }
}

export class _MergeType extends ObjectType {
    public declare _merged?: {
        merged: ObjectType
        origin: ObjectType
    }
}

export class _PartialType extends ObjectType {
    public declare _partial?: {
        origin: ObjectType
        mask: string[] | undefined
    }
}

export class _RequiredType extends ObjectType {
    public declare _required?: {
        origin: ObjectType
        mask: string[] | undefined
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
