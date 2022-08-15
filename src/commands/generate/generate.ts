import { generatedBy } from './constants'
import { expandGlobs } from './glob'
import { formatFile, maybeLoadPrettier } from './prettier'
import { resolveTypescriptSchema } from './resolver'
import type { FileDefinition, OutputFile, ReferenceData, ThereforeOutputType } from './types'

import { getExtension, replaceExtension } from '../../common/template/path'
import { renderTemplate } from '../../common/template/template'
import type { CstNode } from '../../lib/cst/cst'
import type { ThereforeCst } from '../../lib/primitives/types'
import { isThereforeExport } from '../../lib/primitives/types'
import { prepass, toJsonSchema } from '../../lib/visitor'
import { toTypescriptDefinition } from '../../lib/visitor/typescript/typescript'

import { entriesOf, enumerate, groupBy, range, second } from '@skyleague/axioms'
import decamelize from 'decamelize'

import fs from 'fs'
import path from 'path'

function requireModule(module: string): Record<string, CstNode | unknown> {
    const relative = path.relative(__dirname, module).replace(/\\/g, '/').replace('.ts', '')

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(relative.startsWith('.') ? relative : `./${relative}`) as Record<string, CstNode | unknown>
}

export async function loadSymbol({
    srcPath,
    basePath,
    symbol,
    sourceSymbol,
    compile,
    definitions,
    entry,
    fileSuffix,
    fileName,
    outputFileRename,
}: {
    srcPath: string
    basePath: string
    symbol: ThereforeCst
    sourceSymbol: string
    compile: boolean
    definitions: Record<string, FileDefinition>
    entry: string
    fileSuffix?: string | undefined
    fileName?: string | undefined
    outputFileRename: (path: string) => string
}) {
    const simplified = await prepass(symbol)
    if (simplified.type === 'custom') {
        if (simplified.value.fileSuffix !== undefined) {
            fileSuffix = simplified.value.fileSuffix
        }
        if (simplified.value.fileName !== undefined) {
            fileName = simplified.value.fileName
        }
    }

    const { base: baseName, dir: baseDir } = path.parse(srcPath)
    const ext = getExtension(srcPath) ?? ''
    const targetSrcPath = `${baseDir}/${(fileName ?? baseName).replace(ext, '')}${ext}`
    const targetPath = path.relative(
        basePath,
        fileSuffix !== undefined ? replaceExtension(targetSrcPath, fileSuffix) : outputFileRename(targetSrcPath)
    )

    definitions[targetPath] ??= {
        srcPath: path.relative(basePath, srcPath),
        targetPath,
        attachedFiles: [],
        symbols: [],
        dependencies: {},
    }

    const file = definitions[targetPath]
    // check if symbol is not seen yet
    if (file.symbols.find((s) => s.uuid === simplified.uuid)) {
        return
    }

    sourceSymbol = simplified.name ?? sourceSymbol
    const schemaName = decamelize(sourceSymbol, { separator: '-' })
    const schemaFile = `./schemas/${schemaName}.schema.json`
    const compiledFile = `./schemas/${schemaName}.schema.js`

    const jsonschema = toJsonSchema(simplified, compile)
    const { definition, subtrees } = toTypescriptDefinition({ sourceSymbol, schema: simplified, propagateFileName: true })

    file.symbols.push(
        ...Object.values(definition.locals ?? {}).map((local) => ({
            uuid: local.uuid,
            symbolName: local.symbolName,
            definition: local,
            typeOnly: true,
        }))
    )

    file.symbols.push({
        uuid: simplified.uuid,
        symbolName: sourceSymbol,
        definition: definition,
        schemaFile,
        compiledFile,
        typeOnly: simplified.description.generateValidator !== true ?? false,
    })

    if (definition.isExported && simplified.description.generateValidator) {
        if (jsonschema.compiled === true) {
            const filePath = path.join(path.dirname(entry), compiledFile)
            file.attachedFiles.push({
                targetPath: filePath,
                content: `/**\n * ${generatedBy}\n * eslint-disable\n */\n${jsonschema.code}`,
                prettify: false,
                type: 'validator',
            })
        } else {
            file.attachedFiles.push({
                targetPath: path.join(path.dirname(entry), schemaFile),
                content: JSON.stringify(jsonschema.schema, null, 2),
                prettify: true,
                type: 'jsonschema',
            })
        }

        console.debug(` - found ${definition.symbolName}`)
    }
    for (const { node: subSymbol, fileSuffix: subFileSuffix, fileName: subFileName } of subtrees) {
        await loadSymbol({
            symbol: subSymbol,
            basePath,
            sourceSymbol,
            compile,
            definitions,
            srcPath,
            fileSuffix: subFileSuffix,
            fileName: subFileName,
            entry,
            outputFileRename,
        })
    }
}

export async function scanModule({
    entry,
    srcPath,
    basePath,
    compile,
    definitions,
    require = requireModule,
    outputFileRename,
}: {
    entry: string
    srcPath: string
    basePath: string
    compile: boolean
    definitions: Record<string, FileDefinition>
    require?: (module: string) => Record<string, CstNode | unknown>
    outputFileRename: (path: string) => string
}) {
    const module = await Promise.resolve(require(entry))

    for (const [sourceSymbol, symbolPromise] of Object.entries(module)) {
        const symbol = await symbolPromise

        if (!isThereforeExport(symbol)) {
            continue
        }

        await loadSymbol({ symbol, sourceSymbol, compile, definitions, srcPath, entry, basePath, outputFileRename })
    }
}

export async function scanFiles({
    files,
    basePath,
    compile,
    outputFileRename,
}: {
    files: string[]
    basePath: string
    compile: boolean
    outputFileRename: (path: string) => string
}): Promise<Record<string, FileDefinition>> {
    const definitions: Record<string, FileDefinition> = {}
    for (const entry of files) {
        const srcPath = path.resolve(basePath, entry)
        let isGenerated = false
        const strippedPath = srcPath.substr(0, srcPath.lastIndexOf('.'))
        for (const ext of ['.ts', '.js']) {
            const p = `${strippedPath}${ext}`
            isGenerated ||= fs.existsSync(p) && fs.readFileSync(p).includes(generatedBy)
        }
        if (isGenerated) {
            console.debug(`scanning ${entry}`)
            console.debug(` * skipping generated schema`)
            continue
        }

        console.log(`scanning ${entry}`)
        try {
            await scanModule({ entry, basePath, srcPath, compile, definitions, outputFileRename })
        } catch (e: unknown) {
            const error = e as Error
            console.debug(error.message, error.stack)
            throw error
        }
    }
    return definitions
}

export async function compileOutputFiles(
    entries: string[],
    { compile = false, cwd, outputFileRename }: { cwd: string; compile: boolean; outputFileRename: (path: string) => string }
): Promise<
    {
        targetPath: string
        template: string
        data: Record<string, ReferenceData>
        type: ThereforeOutputType
        prettify: boolean
    }[]
> {
    const outputFiles: OutputFile[] = []
    const definitions = await scanFiles({ files: entries, basePath: cwd, compile, outputFileRename })

    const localReferences = {}

    for (const targetPath of Object.keys(definitions)) {
        resolveTypescriptSchema({ definitions, targetPath, cwd, outputFiles, localReferences })
    }

    return compile ? outputFiles : outputFiles.filter((f) => f.type !== 'validator')
}

export async function generate({
    globs,
    ignore,
    extension,
    compile,
    outputFileRename,
}: {
    globs: string[]
    ignore: string[]
    extension: string
    compile: boolean
    outputFileRename: (path: string) => string
}): Promise<void> {
    const cwd = process.cwd()
    const entries = await expandGlobs({ patterns: globs, ignore: [`!${extension}`, ...ignore], cwd, extension })

    const outputFiles = await compileOutputFiles(entries, {
        cwd,
        outputFileRename,
        compile,
    })
    const prettier = maybeLoadPrettier()

    const data = outputFiles.reduce<Record<string, ReferenceData>>(
        (agg, x) => ({
            ...agg,
            ...x.data,
        }),
        {}
    )

    const duplicates = entriesOf(groupBy(entriesOf(data), ([, values]) => `${values.srcPath}${values.symbolName}`)).filter(
        ([, records]) => records.length > 1
    )
    for (const duplicateGroup of duplicates.map((d) => second(d))) {
        for (const [i, [key]] of enumerate(duplicateGroup)) {
            // data[key].referenceName = `${data[key].referenceName}${i}`
            data[key].symbolName = `${data[key].symbolName}${i}`
            data[key].uniqueSymbolName = `${data[key].uniqueSymbolName}${i}`
        }
    }

    const variablesMap = Object.fromEntries(
        Object.entries(data)
            .map(([key, vals]) => Object.entries(vals).map(([varName, value]) => [`${key}:${varName}`, value] as const))
            .flat()
    )

    for (const { targetPath, template, type, prettify } of outputFiles) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        // allow nested references up to 3 deep
        let contents = template
        for (const _ of range(3)) {
            contents = renderTemplate(contents, variablesMap)
        }
        fs.writeFileSync(targetPath, prettify ? await formatFile(prettier, contents, targetPath, type) : contents)
    }
}
