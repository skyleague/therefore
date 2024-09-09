import type { DefinedError, ValidateFunction } from 'ajv'
import { type ArrayOptions, ArrayType } from '../primitives/array/array.js'
import type { SchemaOptions } from '../primitives/base.js'
import { NullableType } from '../primitives/nullable/nullable.js'
import { OptionalType } from '../primitives/optional/optional.js'
import { type RefOptions, RefType } from '../primitives/ref/type.js'
import type { Schema } from '../types.js'
import { toJsonSchema } from '../visitor/jsonschema/jsonschema.js'
import { Node } from './node.js'
import type { Intrinsic } from './types.js'

export abstract class NodeTrait extends Node {
    public array(options: SchemaOptions<ArrayOptions> = {}): ArrayType<this> {
        return new ArrayType(this, options)
    }

    public reference(options: SchemaOptions<RefOptions> = {}): RefType<Intrinsic<this>> {
        return RefType._from(this, options)
    }

    public nullable(): NullableType<this> {
        return NullableType.from(this)
    }

    public optional(): OptionalType<this> {
        return OptionalType.from(this)
    }

    public compile({ formats = true }: { formats?: boolean } = {}): Schema<(typeof this)['infer']> {
        // biome-ignore lint/style/noNonNullAssertion: we know it exists
        const validator = toJsonSchema(this, { formats }).validator!

        type Inferred = (typeof this)['infer']

        const schema = {
            validate: validator as ValidateFunction<(typeof this)['infer']>,
            get schema() {
                return schema.validate.schema
            },
            get errors() {
                return schema.validate.errors ?? undefined
            },
            is: (o: unknown): o is Inferred => schema.validate(o) === true,
            parse: (o: unknown): { right: Inferred } | { left: DefinedError[] } => {
                if (schema.is(o)) {
                    return { right: o }
                }
                return { left: (schema.errors ?? []) as DefinedError[] }
            },
        } as const
        return schema
    }
}

// late binding because of circular dependencies
applyMixins(ArrayType, [NodeTrait])
applyMixins(RefType, [NodeTrait])
applyMixins(NullableType, [NodeTrait])
applyMixins(OptionalType, [NodeTrait])

// biome-ignore lint/suspicious/noExplicitAny: we need to use any here to make the mixin work
function applyMixins(derivedCtor: any, constructors: any[]): void {
    for (const baseCtor of constructors) {
        for (const name of Object.getOwnPropertyNames(baseCtor.prototype)) {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ?? Object.create(null),
            )
        }
    }
}
