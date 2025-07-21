import { keysOf } from '@skyleague/axioms'
import type { SetNonNullable, SetRequired } from '@skyleague/axioms/types'
import type { ZodType } from 'zod'
import type { JsonSchema } from '../../json.js'
import { constants } from '../constants.js'
import type { ThereforeMeta } from '../primitives/base.js'
import type { DefaultType } from '../primitives/optional/default.js'
import {
    defaultAjvValidatorOptions,
    defaultZodValidatorOptions,
    type ValidatorInputOptions,
    type ValidatorOptions,
} from '../primitives/validator/types.js'
import type { ValidatorType } from '../primitives/validator/validator.js'
import type { GenericAttributes, GenericOutput, ThereforeNodeDefinition, TypescriptAttributes, TypescriptOutput } from './cst.js'
import { id } from './id.js'
import { getGuessedTrace, type NodeTrace } from './trace.js'

export const definitionKeys = keysOf({
    description: true,
    deprecated: true,
    default: true,
    readonly: true,
    jsonschema: true,
} satisfies Record<keyof ThereforeNodeDefinition, true>)

export interface Hooks {
    onLoad?: ((node: Node) => void)[]
    onGenerate?: ((node: Node) => void)[]
    onExport?: ((node: SourceNode & NameNode) => void)[]
    onContent?: ((node: SourceNode & NameNode) => void)[]
}

export interface NodeAttributes {
    typescript: TypescriptAttributes
    generic: GenericAttributes
    validator: ValidatorInputOptions | undefined
    validatorType: ValidatorType | undefined
    isGenerated: boolean
}

export class Node {
    public _id: string = id()
    public _type!: string

    public declare _children?: Node[] | undefined
    public declare _connections?: Node[] | undefined
    public declare _canReference?: boolean | undefined
    public declare _hooks?: Hooks | undefined
    public declare _guessedTrace?: NodeTrace | undefined
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
    public declare _toZod?: Node | undefined

    public _attributes: NodeAttributes = {
        typescript: {} as TypescriptAttributes,
        generic: {} as GenericAttributes,
        validator: undefined,
        validatorType: undefined,
        isGenerated: !constants.migrate,
    }

    public _definition: ThereforeNodeDefinition<this['infer']> = {}

    public _origin: {
        zod?: ZodType
        jsonschema?: JsonSchema
    } = {}

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

            delete definition.name
        }

        this._guessedTrace = getGuessedTrace()
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

    public validator(validator: ValidatorInputOptions | undefined = undefined): this {
        this._attributes.validator = validator ?? {
            type: constants.migrateToValidator ?? constants.defaultValidator,
        }
        return this
    }

    public get _validator(): ValidatorOptions {
        return Node._validatorOptions(this, this._attributes.validator)
    }

    private static _validatorOptions(node: Node, options: ValidatorInputOptions | undefined): ValidatorOptions {
        const defaultValidator = constants.migrateToValidator ?? constants.defaultValidator
        const validator: ValidatorInputOptions = options ?? {
            type: defaultValidator,
        }

        if (validator.type === undefined) {
            if (node._origin.zod !== undefined) {
                return { ...defaultZodValidatorOptions, ...validator, type: 'zod' }
            }
            return { ...defaultAjvValidatorOptions, ...validator, type: 'ajv' }
        }
        if (validator.type === 'ajv') {
            const options = { ...defaultAjvValidatorOptions, ...validator }
            if ('schemaFilename' in validator) {
                options.output = {
                    ...options.output,
                    jsonschema: validator.schemaFilename,
                }
            }
            return options
        }
        if (validator.type === 'zod') {
            return { ...defaultZodValidatorOptions, ...validator }
        }
        throw new Error(`Unknown default validator: ${defaultValidator}`)
    }

    protected static _clone<T extends Node>(obj: T) {
        const clone = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj) as T
        clone._id = id()
        clone._definition = { ...clone._definition }
        clone._attributes = structuredClone(clone._attributes)
        return clone
    }
}

export type SourceNode = SetNonNullable<SetRequired<Node, '_sourcePath'>, '_sourcePath'>
export type NameNode = SetNonNullable<SetRequired<Node, '_name'>, '_name'>
