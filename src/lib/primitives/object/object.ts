import type { Simplify } from '@skyleague/axioms/types'
import type { GenericOutput, ThereforeExpr, TypescriptOutput } from '../../cst/cst.js'
import { hasNullablePrimitive, hasOptionalPrimitive } from '../../cst/graph.js'
import { NodeTrait } from '../../cst/mixin.js'
import { Node } from '../../cst/node.js'
import type { AsOptional, AsRequired } from '../../cst/types.js'
import type { SchemaOptions } from '../base.js'
import { EnumType } from '../enum/enum.js'

import { evaluate, mapValues, omit, pick } from '@skyleague/axioms'
import type { ArbitrarySize, ConstExpr } from '@skyleague/axioms'

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

export type ShapeToPartial<Shape extends Record<string, Node>, Keys extends [...(keyof Shape)[]]> = Keys extends { length: 0 }
    ? {
          [K in keyof Shape]: AsOptional<Shape[K]>
      }
    : {
          [K in keyof Shape]: [K] extends Keys ? AsOptional<Shape[K]> : Shape[K]
      }

export type ShapeToRequired<Shape extends Record<string, Node>, Keys extends [...(keyof Shape)[]]> = Keys extends { length: 0 }
    ? {
          [K in keyof Shape]: AsRequired<Shape[K]>
      }
    : {
          [K in keyof Shape]: [K] extends Keys ? AsRequired<Shape[K]> : Shape[K]
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
    public override type = 'object' as const
    public declare children: Node[]

    public options: ObjectOptions

    public shape!: {
        [K in keyof Shape]: Shape[K]
    }

    public declare recordType?: Node | undefined
    public declare patternProperties?: Record<string, Node> | undefined
    public override isCommutative = false

    public declare infer: ShapeToInfer<Shape>

    public constructor(shape: ObjectShape<Shape>, options: SchemaOptions<ObjectOptions, ShapeToInfer<Shape>>) {
        super(options)
        this.options = options
        this.from({ shape })
    }

    public strict(strict = true): this {
        const clone = ObjectType.clone(this)
        clone.options.strict = strict
        return clone
    }

    public keyof(): EnumType<(keyof Shape)[]> {
        return new EnumType(Object.keys(this.shape), {})
    }

    public extend<Extra extends Record<string, Node>>(extra: ObjectShape<Extra>): ObjectType<Simplify<Shape & Extra>> {
        const clone = ObjectType.clone(this)
        clone.from({
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
        const clone = ObjectType.clone(this)
        clone.from({ shape: pick(this.shape, properties) as unknown as Shape })
        return clone as unknown as ObjectType<Simplify<Pick<Shape, Key>>>
    }

    public omit<Key extends keyof Shape>(...properties: Key[]): ObjectType<Simplify<Omit<Shape, Key>>> {
        const clone = ObjectType.clone(this)
        clone.from({ shape: omit(this.shape, properties) as unknown as Shape })
        return clone as unknown as ObjectType<Simplify<Omit<Shape, Key>>>
    }

    public partial<Keys extends (keyof Shape)[]>(...properties: Keys): ObjectType<ShapeToPartial<Shape, Keys>> {
        return new ObjectType(
            mapValues(this.shape, (p, property) =>
                properties.length === 0 || properties.includes(property) ? p.optional() : p,
            ) as Record<string, Node>,
            {
                ...this.options,
            },
        ) as unknown as ObjectType<ShapeToPartial<Shape, Keys>>
    }

    public required<Keys extends (keyof Shape)[]>(...properties: Keys): ObjectType<ShapeToRequired<Shape, Keys>> {
        return new ObjectType(
            mapValues(this.shape, (p, property) => {
                if (properties.length === 0 || properties.includes(property)) {
                    const clone = Node.clone(this)
                    clone.definition.optional = false
                    return clone
                }
                return p
            }) as Record<string, Node>,
            {
                ...this.options,
            },
        ) as unknown as ObjectType<ShapeToRequired<Shape, Keys>>
    }

    public override get output(): (TypescriptOutput | GenericOutput)[] {
        return [
            {
                type: 'typescript',
                definition: (node, context) => {
                    if (node.type === 'object' && !hasOptionalPrimitive(node) && !hasNullablePrimitive(node)) {
                        return `${context.declare('interface', node)} ${context.render(node)}`
                    }
                    return `${context.declare('type', node)} = ${context.render(node)}`
                },
            },
        ]
    }

    protected from({
        shape,
        recordType,
        patternProperties,
    }: {
        shape: ObjectShape<Shape>
        recordType?: ThereforeExpr | undefined
        patternProperties?: Record<string, ThereforeExpr> | undefined
    }) {
        this.shape = mapValues(shape, (node, name) => {
            const evaluated = ObjectType.clone(evaluate(node as ConstExpr<Shape[string]>))
            evaluated.name ??= name.toString()
            return evaluated
        }) as unknown as typeof this.shape

        if (recordType) {
            this.recordType = evaluate(recordType)
        }
        if (patternProperties) {
            this.patternProperties = mapValues(patternProperties, (x) => evaluate(x))
        }

        this.children = [
            ...Object.values<Node>(this.shape),
            ...Object.values(this.patternProperties ?? {}),
            ...(this.recordType !== undefined ? [this.recordType] : []),
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
