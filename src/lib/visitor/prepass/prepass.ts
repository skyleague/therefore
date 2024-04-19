import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import { therefore } from '../../primitives/therefore.js'

export function loadNode<T extends Node>(obj: T & { loaded?: true }): T & { loaded?: true } {
    const seen = new WeakSet()
    const loadedVisitor: ThereforeVisitor<Node> = {
        default: (node) => {
            if (seen.has(node)) {
                return node
            }
            seen.add(node)

            therefore.loadSymbol(node)

            for (const v of node.children ?? []) {
                walkTherefore(v, loadedVisitor)
            }

            return node
        },
    }

    if (obj.loaded !== true) {
        const evaluated: T & { loaded?: true } = walkTherefore(obj, loadedVisitor) as unknown as T & { loaded?: true }
        evaluated.loaded = true
        return evaluated
    }
    return obj
}

export function generateNode<T extends Node>(obj: T & { generate?: true }): T & { generate?: true } {
    const seen = new WeakSet()
    const generateVisitor: ThereforeVisitor<Node> = {
        default: (node) => {
            if (seen.has(node)) {
                return node
            }
            seen.add(node)

            therefore.generateSymbol(node)

            for (const v of node.children ?? []) {
                walkTherefore(v, generateVisitor)
            }

            return node
        },
    }

    if (obj.generate !== true) {
        const evaluated: T & { generate?: true } = walkTherefore(obj, generateVisitor) as unknown as T & { generate?: true }
        evaluated.generate = true
        return evaluated
    }
    return obj
}
