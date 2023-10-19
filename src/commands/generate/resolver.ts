import { generatedBy } from './constants.js'
import { requireReference } from './reference.js'
import type { FileDefinition, OutputFile, ReferenceData, TypescriptDefinition } from './types.js'

import packageJson from '../../../package.json' assert { type: 'json' }
import { writeThereforeSchema } from '../../lib/visitor/typescript/typescript.js'
import { createWriter } from '../../lib/writer.js'

import { evaluate, hasPropertiesDefined, unique } from '@skyleague/axioms'

import path from 'node:path'

const { version } = packageJson

export function renderTypescriptSchemaHeader(definition: FileDefinition) {
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
        .map((i) => `import ${i.symbolName}Schema from '${i.schemaFile}' assert { type: "json" }`)
        .sort()) {
        writer.writeLine(importFile)
    }

    for (const importFile of [...new Set(definition.symbols.map((i) => i.definition.imports).flat())].sort()) {
        writer.writeLine(importFile)
    }

    for (const importFile of Object.entries(definition.dependencies)
        .map(([targetPath, deps]) => ({
            targetPath,
            deps: `{ ${[...new Set(deps)]
                .sort()
                .map((d) => (definition.dependencyUsesValue[targetPath]?.has(d) ? d : `type ${d}`))
                .join(', ')} }`,
        }))
        .filter(({ targetPath }) => targetPath !== definition.targetPath)
        .map(({ targetPath: f, deps }) => {
            const otherPath = path.relative(path.dirname(definition.targetPath), f).replace('.ts', '').replace(/\\/g, '/')
            return `import ${deps} from '${otherPath.startsWith('.') ? otherPath : `./${otherPath}`}.js'`
        })
        .sort()) {
        writer.writeLine(importFile)
    }

    writer.newLine().newLine()

    return writer.toString()
}

export function renderTypescriptSchemaContent(definition: FileDefinition) {
    const writer = createWriter()
    for (const symbol of Object.values(definition.symbols)) {
        writer.writeLine(symbol.definition.declaration)
        if (symbol.definition.isExported && !symbol.typeOnly) {
            writer.writeLine(
                writeThereforeSchema({
                    uuid: symbol.definition.uuid,
                    schemaReference: `${symbol.symbolName}Schema`,
                    validatorFile: symbol.compiledFile,
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
    const definition = definitions[targetPath]!
    const locals: NonNullable<TypescriptDefinition['locals']> = {}
    const required = definition.symbols
        .flatMap((i) =>
            i.definition.references.map((r) => requireReference({ definitions, current: definition, ref: r, locals }))
        )
        .flat(2)
    const uniqueRequires = [...unique(required, (a, b) => a.uuid === b.uuid)]

    const templateContent = renderTypescriptSchemaContent(definition)
    for (const r of uniqueRequires) {
        definition.dependencies[r.targetPath] ??= []
        definition.dependencies[r.targetPath]?.push(r.symbolName)

        if (templateContent.includes(`${r.uuid}:symbolName~value`)) {
            definition.dependencyUsesValue[r.targetPath] ??= new Set()
            definition.dependencyUsesValue[r.targetPath]?.add(r.symbolName)
        }
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
    const relativeSource = `./${path.relative(path.dirname(schemaFile), definition.srcPath).replace(/\.ts$/g, '')}`
    outputFiles.push(
        {
            targetPath,
            relativeSource,
            type: 'typescript',
            template: `${renderTypescriptSchemaHeader(definition)}${templateContent}`,
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
            clean: j.clean,
        }))
    )
}
