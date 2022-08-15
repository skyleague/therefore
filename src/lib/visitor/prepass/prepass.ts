import { awaitAll } from '../../../common/util'
import type { CstNode } from '../../cst/cst'
import { isCstNode } from '../../cst/cst'
import type { AsyncCstVisitor } from '../../cst/visitor'
import { asyncWalkCst } from '../../cst/visitor'
import type { AyncThereforeCst, ThereforeCst } from '../../primitives/types'

import { entriesOf, evaluate } from '@skyleague/axioms'

export async function prepass(obj: AyncThereforeCst & { prepass?: true }): Promise<ThereforeCst & { prepass?: true }> {
    const seen = new WeakSet()
    const prepassVisitor: AsyncCstVisitor<CstNode, unknown, AyncThereforeCst> = {
        object: async (node, ctx) => {
            if (seen.has(node)) {
                return node
            }

            const { value } = node
            const { indexSignature } = value

            await prepassVisitor.default(node, ctx)
            if (value.indexPatterns !== undefined) {
                node.value.indexPatterns = Object.fromEntries(
                    await awaitAll(
                        entriesOf(value.indexPatterns).map(
                            async ([name, pattern]) =>
                                [name, await prepassVisitor.default(pattern as AyncThereforeCst, ctx)] as const
                        )
                    )
                )
            }
            if (indexSignature !== undefined) {
                node.value.indexSignature = await prepassVisitor.default(indexSignature as AyncThereforeCst, ctx)
            }

            return node
        },
        default: async (node) => {
            if (seen.has(node)) {
                return node
            }
            seen.add(node)

            const children = []
            for (const v of node.children ?? []) {
                const evaluated = await evaluate(v)
                children.push(isCstNode(evaluated) ? await asyncWalkCst(evaluated, prepassVisitor) : evaluated)
            }
            node.children = children
            return node
        },
    }

    if (obj.prepass !== true) {
        return { ...(await asyncWalkCst(obj, prepassVisitor)), prepass: true } as ThereforeCst & { prepass?: true }
    }
    return obj as ThereforeCst
}
