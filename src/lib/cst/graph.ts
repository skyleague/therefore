import { isNode } from './cst.js'
import type { Node } from './node.js'

export function hasOptionalPrimitive(obj: Node, seen = new WeakSet()): boolean {
    if (seen.has(obj)) {
        return false
    }
    seen.add(obj)
    return (
        (obj._definition.optional === true ||
            (obj._isCommutative &&
                obj._children?.some((c) => {
                    if (isNode(c)) {
                        return c._definition.optional === true || hasOptionalPrimitive(c, seen)
                    }
                    return false
                }))) ??
        false
    )
}

export function hasNullablePrimitive(obj: Node, seen = new WeakSet()): boolean {
    if (seen.has(obj)) {
        return false
    }
    seen.add(obj)
    return (
        (obj._definition.nullable === true ||
            (obj._isCommutative &&
                obj._children?.some((c) => {
                    if (isNode(c)) {
                        return c._definition.nullable === true || hasOptionalPrimitive(c, seen)
                    }
                    return false
                }))) ??
        false
    )
}
