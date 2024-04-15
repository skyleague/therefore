import type { GenericAttributes, GenericOutput, ThereforeNodeDefinition, TypescriptAttributes, TypescriptOutput } from './cst.js'
import { id } from './id.js'
import type { AsNullable, AsOptional } from './types.js'

import type { JsonSchema } from '../../json.js'
import type { ThereforeMeta } from '../primitives/base.js'
import type { ValidatorOptions } from '../primitives/validator/validator.js'

import { keysOf, omit } from '@skyleague/axioms'
import type { SetNonNullable, SetRequired } from '@skyleague/axioms/types'

export const definitionKeys = keysOf({
    description: true,
    optional: true,
    nullable: true,
    deprecated: true,
    default: true,
    readonly: true,
    validator: true,
    jsonschema: true,
} satisfies Record<keyof ThereforeNodeDefinition, true>)

export interface Hooks {
    onLoad?: ((node: Node) => void)[]
    onGenerate?: ((node: Node) => void)[]
    onExport?: ((node: SourceNode & NameNode) => void)[]
}

export class Node {
    public id: string = id()
    public type!: string

    public declare children?: Node[] | undefined
    public declare connections?: Node[] | undefined

    public declare hooks?: Hooks | undefined
    public get output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return undefined
    }
    public declare transform?:
        | {
              symbolName?: (name: string) => string
              referenceName?: (name: string) => string
              aliasName?: (name: string) => string
          }
        | undefined

    public declare name?: string | undefined
    public declare sourcePath?: string | undefined

    public attributes: {
        typescript: TypescriptAttributes
        generic: GenericAttributes
    } = {
        typescript: {} as TypescriptAttributes,
        generic: {} as GenericAttributes,
    }

    public definition: ThereforeNodeDefinition<this['infer']> = {}

    public isCommutative = true

    public declare infer: unknown

    public constructor(definition: ThereforeNodeDefinition & ThereforeMeta = {}) {
        for (const key of Object.keys(definition) as (keyof ThereforeNodeDefinition)[]) {
            if (definitionKeys.includes(key)) {
                if (definition[key] !== undefined) {
                    ;(this.definition[key] as ThereforeNodeDefinition<this['infer']>) = definition[
                        key
                    ] as ThereforeNodeDefinition<this['infer']>

                    delete definition[key]
                }
            } else if (definition[key] === undefined) {
                delete definition[key]
            }
        }
        if (definition.name !== undefined) {
            this.name = definition.name
            // biome-ignore lint/performance/noDelete: we need to delete the name from the definition
            delete definition.name
        }
    }

    public describe(description: string): this {
        this.definition.description = description
        return this
    }

    public nullable(): AsNullable<this> {
        const clone = Node.clone(this)
        clone.definition.nullable = true
        return clone as AsNullable<this>
    }

    public optional(): AsOptional<this> {
        const clone = Node.clone(this)
        clone.definition.optional = true
        return clone as AsOptional<this>
    }

    public default(value: this['infer']): this {
        this.definition.default = value
        return this
    }

    public jsonschema(schema: JsonSchema<this['infer']>): this {
        this.definition.jsonschema = { ...this.definition.jsonschema, ...schema }
        return this
    }

    public validator(validator: ValidatorOptions = {}): this {
        this.definition.validator = { ...this.definition.validator, ...validator }
        return this
    }

    protected static clone<T extends Node>(obj: T) {
        const clone = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T
        clone.id = id()
        // on clone we erase the validator options, as we don't want to copy that over to the new instance
        clone.definition = omit({ ...clone.definition }, ['validator'])
        clone.attributes = structuredClone(clone.attributes)
        return clone
    }
}

export type SourceNode = SetNonNullable<SetRequired<Node, 'sourcePath'>, 'sourcePath'>
export type NameNode = SetNonNullable<SetRequired<Node, 'name'>, 'name'>
