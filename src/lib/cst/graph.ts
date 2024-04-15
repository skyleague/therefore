import { isNode } from './cst.js'
import type { Node } from './node.js'

export function hasOptionalPrimitive(obj: Node, seen = new WeakSet()): boolean {
    if (seen.has(obj)) {
        return false
    }
    seen.add(obj)
    return (
        (obj.definition.optional === true ||
            (obj.isCommutative &&
                obj.children?.some((c) => {
                    if (isNode(c)) {
                        return c.definition.optional === true || hasOptionalPrimitive(c, seen)
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
        (obj.definition.nullable === true ||
            (obj.isCommutative &&
                obj.children?.some((c) => {
                    if (isNode(c)) {
                        return c.definition.nullable === true || hasOptionalPrimitive(c, seen)
                    }
                    return false
                }))) ??
        false
    )
}
