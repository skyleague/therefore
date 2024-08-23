import { type ArrayOptions, ArrayType } from '../primitives/array/array.js'
import type { SchemaOptions } from '../primitives/base.js'
import { NullableType } from '../primitives/nullable/nullable.js'
import { OptionalType } from '../primitives/optional/optional.js'
import { type RefOptions, RefType } from '../primitives/ref/type.js'
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
        return new NullableType(this)
    }

    public optional(): OptionalType<this> {
        return new OptionalType(this)
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
