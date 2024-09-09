import { keysOf, omit } from '@skyleague/axioms'
import type { SetNonNullable, SetRequired } from '@skyleague/axioms/types'
import type { JsonSchema } from '../../json.js'
import type { ThereforeMeta } from '../primitives/base.js'
import type { DefaultType } from '../primitives/optional/default.js'
import type { ValidatorOptions } from '../primitives/validator/validator.js'
import type { GenericAttributes, GenericOutput, ThereforeNodeDefinition, TypescriptAttributes, TypescriptOutput } from './cst.js'
import { id } from './id.js'

export const definitionKeys = keysOf({
    description: true,
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
    onContent?: ((node: SourceNode & NameNode) => void)[]
}

export class Node {
    public _id: string = id()
    public _type!: string

    public declare _children?: Node[] | undefined
    public declare _connections?: Node[] | undefined
    public declare _canReference?: boolean | undefined
    public declare _hooks?: Hooks | undefined
    public get _output(): (TypescriptOutput | GenericOutput)[] | undefined {
        return undefined
    }
    public declare _transform?:
        | {
              symbolName?: (name: string) => string
              referenceName?: (name: string) => string
              aliasName?: (name: string) => string
          }
        | undefined

    public declare _name?: string | undefined
    public declare _sourcePath?: string | undefined

    public _attributes: {
        typescript: TypescriptAttributes
        generic: GenericAttributes
    } = {
        typescript: {} as TypescriptAttributes,
        generic: {} as GenericAttributes,
    }

    public _definition: ThereforeNodeDefinition<this['infer']> = {}

    public _isCommutative = true

    public declare infer: unknown
    public declare input: unknown
    // public declare intrinsic: unknown

    public constructor(definition: ThereforeNodeDefinition & ThereforeMeta = {}) {
        for (const key of Object.keys(definition) as (keyof ThereforeNodeDefinition)[]) {
            if (definitionKeys.includes(key)) {
                if (definition[key] !== undefined) {
                    ;(this._definition[key] as ThereforeNodeDefinition<this['infer']>) = definition[
                        key
                    ] as ThereforeNodeDefinition<this['infer']>

                    delete definition[key]
                }
            } else if (definition[key] === undefined) {
                delete definition[key]
            }
        }
        if (definition.name !== undefined) {
            this._name = definition.name
            // biome-ignore lint/performance/noDelete: we need to delete the name from the definition
            delete definition.name
        }
    }

    public describe(description: string): this {
        this._definition.description = description
        return this
    }

    public default(value: this['input']): DefaultType<this> {
        this._definition.default = value
        return this as DefaultType<this>
    }

    public jsonschema(schema: JsonSchema<this['infer']>): this {
        this._definition.jsonschema = { ...this._definition.jsonschema, ...schema }
        return this
    }

    public validator(validator: Partial<ValidatorOptions> = {}): this {
        this._definition.validator = { ...this._definition.validator, ...validator }
        return this
    }

    protected static _clone<T extends Node>(obj: T) {
        const clone = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T
        clone._id = id()
        // on clone we erase the validator options, as we don't want to copy that over to the new instance
        clone._definition = omit({ ...clone._definition }, ['validator'])
        clone._attributes = structuredClone(clone._attributes)
        return clone
    }
}

export type SourceNode = SetNonNullable<SetRequired<Node, '_sourcePath'>, '_sourcePath'>
export type NameNode = SetNonNullable<SetRequired<Node, '_name'>, '_name'>
