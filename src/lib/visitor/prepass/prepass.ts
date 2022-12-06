/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { CstNode } from '../../cst/cst'
import { isCstNode } from '../../cst/cst'
import type { CstVisitor } from '../../cst/visitor'
import { walkCst } from '../../cst/visitor'
import type { ThereforeCst } from '../../primitives/types'

import { entriesOf, evaluate } from '@skyleague/axioms'

export function prepass(obj: ThereforeCst & { prepass?: true }): ThereforeCst & { prepass?: true } {
    const seen = new WeakSet()
    const prepassVisitor: CstVisitor<CstNode> = {
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
                        ([name, pattern]) => [name, prepassVisitor.default(pattern as ThereforeCst, ctx)] as const
                    )
                )
            }
            if (indexSignature !== undefined) {
                node.value.indexSignature = prepassVisitor.default(indexSignature as ThereforeCst, ctx)
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
                children.push(isCstNode(evaluated) ? walkCst(evaluated, prepassVisitor) : evaluated)
            }
            node.children = children
            return node
        },
    }

    if (obj.prepass !== true) {
        return { ...walkCst(obj, prepassVisitor), prepass: true } as ThereforeCst & { prepass?: true }
    }
    return obj as ThereforeCst
}
