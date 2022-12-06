/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { ThereforeNode } from '../../cst/cst'
import { isThereforeNode } from '../../cst/cst'
import type { ThereforeVisitor } from '../../cst/visitor'
import { walkTherefore } from '../../cst/visitor'
import type { ThereforeCst, ThereforeSchema } from '../../primitives/types'

import { entriesOf, evaluate } from '@skyleague/axioms'

export function prepass(obj: ThereforeCst & { prepass?: true }): ThereforeCst & { prepass?: true } {
    const seen = new WeakSet()
    const prepassVisitor: ThereforeVisitor<ThereforeNode> = {
        object: (node, ctx) => {
            if (seen.has(node)) {
                return node
            }

            const { value } = node
            const { indexSignature } = value

            prepassVisitor.default(node, ctx)
            if (value.indexPatterns !== undefined) {
                node.value.indexPatterns = Object.fromEntries(
                    entriesOf(value.indexPatterns).map(
                        ([name, pattern]) => [name, prepassVisitor.default(pattern as ThereforeSchema, ctx)] as const
                    )
                )
            }
            if (indexSignature !== undefined) {
                node.value.indexSignature = prepassVisitor.default(indexSignature as ThereforeSchema, ctx)
            }

            return node
        },
        default: (node) => {
            if (seen.has(node)) {
                return node
            }
            seen.add(node)

            const children = []
            for (const v of node.children ?? []) {
                const evaluated = evaluate(v)
                children.push(isThereforeNode(evaluated) ? walkTherefore(evaluated, prepassVisitor) : evaluated)
            }
            node.children = children
            return node
        },
    }

    if (obj.prepass !== true) {
        return { ...walkTherefore(obj, prepassVisitor), prepass: true } as ThereforeSchema
    }
    return obj
}
