import { generatedBy } from './constants'
import { requireReference } from './reference'
import type { FileDefinition, OutputFile, ReferenceData, TypescriptDefinition } from './types'

import { version } from '../../../package.json'
import { writeThereforeSchema } from '../../lib/visitor/typescript/typescript'
import { createWriter } from '../../lib/writer'

import { evaluate, hasPropertiesDefined, unique } from '@skyleague/axioms'

import path from 'path'

export function renderTypescriptSchema(definition: FileDefinition, relativeSource: string) {
    const writer = createWriter()
    writer
        .writeLine('/**')
        .writeLine(`* ${generatedBy}@v${version}`)
        .writeLine('* Do not manually touch this')
        .newLineIfLastNot()
        .closeComment()
        .writeLine('/* eslint-disable */')

    for (const importFile of definition.symbols
        .filter(hasPropertiesDefined(['schemaFile']))
        .filter((i) => !i.typeOnly && i.compiledFile === undefined)
        .map((i) => `import ${i.symbolName}Schema from '${i.schemaFile}'`)
        .sort()) {
        writer.writeLine(importFile)
    }

    for (const importFile of [...new Set(definition.symbols.map((i) => i.definition.imports).flat())].sort()) {
        writer.writeLine(importFile)
    }

    for (const importFile of Object.entries(definition.dependencies)
        .map(([targetPath, deps]) => ({
            targetPath,
            deps: `{ ${[...new Set(deps)].sort().join(', ')} }`,
        }))
        .filter(({ targetPath }) => targetPath !== definition.targetPath)
        .map(({ targetPath: f, deps }) => {
            const otherPath = path.relative(path.dirname(definition.targetPath), f).replace('.ts', '').replace(/\\/g, '/')
            return `import ${deps} from '${otherPath.startsWith('.') ? otherPath : `./${otherPath}`}'`
        })
        .sort()) {
        writer.writeLine(importFile)
    }

    writer.newLine().newLine()

    for (const symbol of Object.values(definition.symbols)) {
        writer.writeLine(symbol.definition.declaration)
        if (symbol.definition.isExported && !symbol.typeOnly) {
            writer.writeLine(
                writeThereforeSchema({
                    uuid: symbol.definition.uuid,
                    schemaReference: `${symbol.symbolName}Schema`,
                    validatorFile: symbol.compiledFile,
                    source: relativeSource.replace('./', ''),
                    sourceSymbol: symbol.definition.sourceSymbol,
                    description: evaluate(symbol.definition.schema).description,
                })
            )
        }
    }

    return writer.toString()
}

export function resolveTypescriptSchema({
    definitions,
    targetPath,
    cwd,
    outputFiles,
    localReferences,
}: {
    definitions: Record<string, FileDefinition>
    targetPath: string
    cwd: string
    outputFiles: OutputFile[]
    localReferences: Record<string, ReferenceData>
}) {
    const definition = definitions[targetPath]
    const locals: NonNullable<TypescriptDefinition['locals']> = {}
    const required = definition.symbols
        .flatMap((i) =>
            i.definition.references.map((r) => requireReference({ definitions, current: definition, ref: r, locals }))
        )
        .flat(2)
    const uniqueRequires = [...unique(required, (a, b) => a.uuid === b.uuid)]

    // definition.symbols.push(
    //     ...Object.values(locals ?? {}).map((local) => ({
    //         uuid: local.uuid,
    //         symbolName: local.sourceSymbol,
    //         definition: local,
    //         typeOnly: true,
    //     }))
    // )

    // for (const local of Object.values(locals ?? {})) {
    //     if (definition.symbols.find((s) => s.uuid === local.uuid) !== undefined) {
    //         definition.symbols.push({
    //             uuid: local.uuid,
    //             symbolName: local.sourceSymbol,
    //             definition: local,
    //             typeOnly: true,
    //         })
    //     }
    // }

    for (const r of uniqueRequires) {
        definition.dependencies[r.targetPath] ??= []
        definition.dependencies[r.targetPath]?.push(r.symbolName)
    }

    for (const symbol of definition.symbols) {
        localReferences[symbol.definition.uuid] ??= {
            symbolName: symbol.definition.symbolName,
            referenceName: symbol.definition.referenceName,
            uniqueSymbolName: symbol.definition.uniqueSymbolName,
            srcPath: targetPath,
        }
    }

    const references: Record<string, ReferenceData> = Object.fromEntries([
        ...required.map(
            (r) =>
                [
                    r.uuid,
                    {
                        symbolName: r.symbolName,
                        uniqueSymbolName: r.uniqueSymbolName,
                        referenceName: r.referenceName,
                        srcPath: r.targetPath,
                    },
                ] as const
        ),
    ])

    const schemaFile = path.relative(cwd, definition.targetPath).replace(/\\/g, '/')
    const relativeSource = `./${path
        .relative(path.dirname(schemaFile), path.relative(cwd, definition.srcPath))
        .replace(/\.ts$/g, '')}`
    outputFiles.push(
        {
            targetPath,
            relativeSource,
            type: 'typescript',
            template: renderTypescriptSchema(definition, relativeSource),
            data: { ...localReferences, ...references },
            prettify: true,
        },
        ...definition.attachedFiles.map((j) => ({
            targetPath: path.relative(cwd, j.targetPath),
            relativeSource,
            type: j.type,
            template: j.content,
            data: { ...localReferences, ...references },
            prettify: j.prettify,
        }))
    )
}
