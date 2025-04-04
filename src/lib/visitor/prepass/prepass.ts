import { entriesOf } from '@skyleague/axioms'
import type { Node } from '../../cst/node.js'
import type { ThereforeVisitor } from '../../cst/visitor.js'
import { walkTherefore } from '../../cst/visitor.js'
import type { JSONObjectType } from '../../primitives/jsonschema/jsonschema.js'
import type { _ExtendType, _OmitType, _PickType } from '../../primitives/object/object.js'
import { $ref } from '../../primitives/ref/ref.js'
import { therefore } from '../../primitives/therefore.js'

export function loadNode<T extends Node>(obj: T & { _loaded?: true }): T & { _loaded?: true } {
    const seen = new WeakSet()
    const loadedVisitor: ThereforeVisitor<Node> = {
        default: (node) => {
            if (seen.has(node)) {
                return node
            }
            seen.add(node)

            therefore.loadSymbol(node)

            for (const v of node._children ?? []) {
                walkTherefore(v, loadedVisitor)
            }

            return node
        },
    }

    if (obj._loaded !== true) {
        const evaluated: T & { _loaded?: true } = walkTherefore(obj, loadedVisitor) as unknown as T & { _loaded?: true }
        evaluated._loaded = true
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

            for (const v of node._children ?? []) {
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

export function autoRef<T extends Node>(obj: T & { autoref?: true }, symbols: WeakSet<Node>): T & { autoref?: true } {
    const seen = new WeakSet()
    const autoRefVisitor: ThereforeVisitor<Node> = {
        object: (obj) => {
            const node = obj as JSONObjectType
            for (const [k, v] of entriesOf(node.shape ?? [])) {
                if (symbols.has(v) && v._canReference !== false) {
                    node.shape[k] = $ref(v)
                } else {
                    walkTherefore(v, autoRefVisitor)
                }
            }

            if (node.element !== undefined) {
                if (symbols.has(node.element) && node.element._canReference !== false) {
                    node.element = $ref(node.element)
                } else {
                    walkTherefore(node.element, autoRefVisitor)
                }
            }

            if (node.patternProperties !== undefined) {
                for (const [k, v] of entriesOf(node.patternProperties ?? [])) {
                    if (symbols.has(v) && v._canReference !== false) {
                        node.patternProperties[k] = $ref(v) as unknown as Node
                    } else {
                        walkTherefore(v, autoRefVisitor)
                    }
                }
            }

            const omitType = node as unknown as _OmitType
            if (omitType._omitted !== undefined) {
                walkTherefore(omitType._omitted.origin, autoRefVisitor)
            }
            const pickType = node as unknown as _PickType
            if (pickType._picked !== undefined) {
                walkTherefore(pickType._picked.origin, autoRefVisitor)
            }
            const extendType = node as unknown as _ExtendType
            if (extendType._extended !== undefined) {
                walkTherefore(extendType._extended.origin, autoRefVisitor)
                for (const [k, v] of entriesOf(extendType._extended.extends ?? [])) {
                    if (symbols.has(v) && v._canReference !== false) {
                        extendType._extended.extends[k] = $ref(v)
                    } else {
                        walkTherefore(v, autoRefVisitor)
                    }
                }
            }

            return node
        },
        array: (node) => {
            const element = node.element
            if (symbols.has(element) && element._canReference !== false) {
                node.element = $ref(element)
            } else {
                walkTherefore(element, autoRefVisitor)
            }

            return node
        },
        tuple: (node) => {
            const items = node.items
            for (const [i, item] of items.entries()) {
                if (symbols.has(item) && item._canReference !== false) {
                    items[i] = $ref(item)
                } else {
                    walkTherefore(item, autoRefVisitor)
                }
            }

            const rest = node._options.rest
            if (rest !== undefined) {
                if (symbols.has(rest) && rest._canReference !== false) {
                    node._options.rest = $ref(rest)
                } else {
                    walkTherefore(rest, autoRefVisitor)
                }
            }
            return node
        },
        validator: (node) => {
            return node
        },
        ref: (node) => {
            //  do nothing special here
            return node
        },
        default: (node) => {
            if (seen.has(node)) {
                return node
            }
            seen.add(node)

            therefore.generateSymbol(node)

            for (const [i, v] of (node._children ?? []).entries()) {
                if (node._children !== undefined && i in node._children && symbols.has(v) && v._canReference !== false) {
                    node._children[i] = $ref(v)
                } else {
                    walkTherefore(v, autoRefVisitor)
                }
            }

            return node
        },
    }

    if (obj.autoref !== true) {
        const evaluated: T & { autoref?: true } = walkTherefore(obj, autoRefVisitor) as unknown as T & { autoref?: true }
        evaluated.autoref = true

        if (!evaluated._isCommutative) {
            sweepBackEdges(evaluated)
        }

        return evaluated
    }
    return obj
}

export const isSwept = new WeakSet<Node>()
export const isBackEdged = new Set<string>()

export function mustBeLazyDefined(node: Node) {
    return isBackEdged.has(node._id)
}

const _visitedInHypergraph = new Set<string>() // All visited nodes
export function sweepBackEdges(node: Node) {
    const inCurrentPath = new Set<string>() // Nodes in current DFS path

    const backEdgeVisitor: ThereforeVisitor<Node> = {
        default: (node) => {
            if (isSwept.has(node)) {
                return node
            }
            isSwept.add(node)

            const processNode = (current: Node) => {
                const currentId = current._id

                // Skip if already visited
                if (_visitedInHypergraph.has(currentId)) {
                    return
                }

                // Mark as visited and in current path
                _visitedInHypergraph.add(currentId)
                inCurrentPath.add(currentId)

                // Process children
                for (const child of current._children ?? []) {
                    const childId = child._id

                    // If child is in current path, we found a back edge
                    if (inCurrentPath.has(childId)) {
                        isBackEdged.add(childId)
                    } else {
                        processNode(child)
                    }
                }

                // Remove from current path when backtracking
                inCurrentPath.delete(currentId)
            }

            // Process the node and its validator type
            processNode(node)
            if (node._attributes.validatorType) {
                processNode(node._attributes.validatorType)
            }

            return node
        },
    }

    // Start the sweep from the root node
    walkTherefore(node, backEdgeVisitor)
}
