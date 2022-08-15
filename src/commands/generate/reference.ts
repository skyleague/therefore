import type { FileDefinition, TypescriptDefinition, TypescriptReference } from './types'

import type { ThereforeCst } from '../../lib/primitives/types'
import { toTypescriptDefinition } from '../../lib/visitor'

import { evaluate, sha256 } from '@skyleague/axioms'

import path from 'path'

interface ExpandedReference {
    srcPath: string
    targetPath: string
    symbolName: string
    uuid: string
    referenceName: string
    uniqueSymbolName: string
}

const localVersion = new Map<string, number>()
const referenceRegister = new Map<string, string>()

export function requireReference({
    definitions,
    current,
    ref,
    locals,
}: {
    definitions: Record<string, FileDefinition>
    current: FileDefinition
    ref: TypescriptReference
    locals: NonNullable<TypescriptDefinition['locals']>
}): ExpandedReference[] {
    const found = Object.values(definitions)
        .flatMap((d) =>
            d.symbols.map((s) => ({
                uuid: s.definition.uuid,
                symbolName: s.definition.symbolName,
                referenceName: s.definition.referenceName,
                uniqueSymbolName: s.definition.uniqueSymbolName,
                srcPath: d.srcPath,
                targetPath: d.targetPath,
            }))
        )
        .find((s) => s.uuid === ref.uuid)

    if (found === undefined) {
        // this is a locally defined variable
        let sourceSymbol: string
        const reference = evaluate(ref.reference[0])

        const refName = ref.name
        const fileHash = sha256(path.basename(current.srcPath)).slice(0, 4)
        if (refName !== undefined) {
            sourceSymbol = refName
        } else {
            if (!referenceRegister.has(reference.uuid)) {
                if (!localVersion.has(current.targetPath)) {
                    localVersion.set(current.targetPath, 0)
                }
                const localIterator = localVersion.get(current.targetPath)!
                referenceRegister.set(reference.uuid, `local${localIterator}`)
                localVersion.set(current.targetPath, localIterator + 1)
            }
            sourceSymbol = referenceRegister.get(reference.uuid)!
        }

        const { definition } = toTypescriptDefinition({
            sourceSymbol,
            schema: evaluate(reference) as ThereforeCst,
            fileHash,
            exportSymbol: ref.exportSymbol,
            locals,
        })
        current.symbols.push({
            uuid: ref.uuid,
            definition,
            symbolName: sourceSymbol,
            typeOnly: true,
        })

        // make the DFS well defined
        const extra = definition.references.map((r) => requireReference({ definitions, current, ref: r, locals })).flat()
        return [
            ...extra,
            {
                uuid: ref.uuid,
                symbolName: definition.symbolName,
                srcPath: current.srcPath,
                targetPath: current.targetPath,
                referenceName: definition.referenceName,
                uniqueSymbolName: definition.uniqueSymbolName,
            },
        ]
    }
    return [
        {
            uuid: ref.uuid,
            symbolName: found.symbolName,
            srcPath: found.srcPath,
            targetPath: found.targetPath,
            referenceName: found.referenceName,
            uniqueSymbolName: found.uniqueSymbolName,
        },
    ]
}
