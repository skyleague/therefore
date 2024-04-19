import { Node } from './node.js'

import { type ArrayOptions, ArrayType } from '../primitives/array/array.js'
import type { SchemaOptions } from '../primitives/base.js'
import { type RefOptions, RefType } from '../primitives/ref/type.js'

export abstract class NodeTrait extends Node {
    public array(options: SchemaOptions<ArrayOptions> = {}): ArrayType {
        return new ArrayType(this, options)
    }

    public reference(options: SchemaOptions<RefOptions> = {}): RefType {
        return RefType.from(this, options)
    }
}

// late binding because of circular dependencies
applyMixins(ArrayType, [NodeTrait])
applyMixins(RefType, [NodeTrait])

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
