import { NullableType } from '../primitives/nullable/nullable.js'
import { OptionalType } from '../primitives/optional/optional.js'
import type { Node } from './node.js'

export function hasOptionalPrimitive(node: Node, seen = new WeakSet()): boolean {
    if (seen.has(node)) {
        return false
    }
    seen.add(node)

    if (node instanceof OptionalType) {
        return true
    }

    if (!node._isCommutative) {
        return false
    }
    return node._children?.some((c) => hasOptionalPrimitive(c, seen)) ?? false
}

export function hasNullablePrimitive(node: Node, seen = new WeakSet()): boolean {
    if (seen.has(node)) {
        return false
    }
    seen.add(node)
    if (node instanceof NullableType) {
        return true
    }

    if (!node._isCommutative) {
        return false
    }
    return node._children?.some((c) => hasNullablePrimitive(c, seen)) ?? false
}
