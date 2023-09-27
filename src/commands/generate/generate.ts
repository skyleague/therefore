import { generatedAjv, generatedBy } from './constants.js'
import { expandGlobs } from './glob.js'
import { formatFile, maybeLoadPrettier } from './prettier.js'
import { resolveTypescriptSchema } from './resolver.js'
import type { FileDefinition, OutputFile, ReferenceData, ThereforeOutputType } from './types.js'

import { getExtension, replaceExtension } from '../../common/template/path.js'
import { renderTemplate } from '../../common/template/template.js'
import type { ThereforeNode } from '../../lib/cst/cst.js'
import type { ThereforeCst } from '../../lib/primitives/types.js'
import { isThereforeExport } from '../../lib/primitives/types.js'
import { toJsonSchema } from '../../lib/visitor/jsonschema/jsonschema.js'
import { prepass } from '../../lib/visitor/prepass/prepass.js'
import { toTypescriptDefinition } from '../../lib/visitor/typescript/typescript.js'

import { entriesOf, enumerate, groupBy, isDefined, range, second } from '@skyleague/axioms'
import decamelize from 'decamelize'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
async function requireModule(module: string): Promise<Record<string, ThereforeNode | unknown>> {
    const relative = path.relative(__dirname, module).replace(/\\/g, '/').replace(/\.ts$/, '.js')

    const mod = (await import(relative.startsWith('.') ? relative : `./${relative}`)) as Record<string, unknown>
    return (mod.default ?? mod) as Record<string, ThereforeNode | unknown>
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
    filePath,
    outputFileRename,
    appendSourceSymbolName: appendSourceName = false,
    rootPath = srcPath,
}: {
    srcPath: string
    basePath: string
    symbol: ThereforeCst
    sourceSymbol: string
    compile: boolean
    definitions: Record<string, FileDefinition | undefined>
    entry: string
    fileSuffix?: string | undefined
    filePath?: string | undefined
    outputFileRename: (path: string) => string
    appendSourceSymbolName?: boolean
    rootPath?: string
}) {
    const simplified = prepass(symbol)
    let targetDir = '.'
    if (simplified.type === 'custom') {
        if (simplified.value.fileSuffix !== undefined) {
            fileSuffix = simplified.value.fileSuffix
        }
        if (simplified.value.filePath !== undefined) {
            const dir = path.dirname(simplified.value.filePath)
            const basename = path.basename(simplified.value.filePath)
            filePath = basename
            targetDir = dir
        }
    }

    const { base: baseName, dir: baseDir } = path.parse(srcPath)
    const ext = getExtension(srcPath) ?? ''
    const targetBaseDir = path.relative(basePath, path.join(baseDir, targetDir))
    const targetSrcPath = `${targetBaseDir}/${(filePath ?? baseName).replace(ext, '')}${ext}`
    const targetPath = fileSuffix !== undefined ? replaceExtension(targetSrcPath, fileSuffix) : outputFileRename(targetSrcPath)

    definitions[targetPath] ??= {
        srcPath: path.relative(basePath, rootPath),
        targetPath,
        attachedFiles: [],
        symbols: [],
        dependencies: {},
    }

    const file = definitions[targetPath]!
    // check if symbol is not seen yet
    if (file.symbols.find((s) => s.uuid === simplified.uuid)) {
        return
    }
    const symbolName = simplified.name ?? sourceSymbol

    sourceSymbol = appendSourceName && simplified.name !== undefined ? `${sourceSymbol}.${simplified.name}` : symbolName
    const schemaName = decamelize(symbolName, { separator: '-' })
    const schemaFile = `./schemas/${schemaName}.schema.json`
    const compiledFile = `./schemas/${schemaName}.schema.js`

    const nodeIsCompiled = simplified.description.validator?.compile ?? compile

    const jsonschema = await toJsonSchema(simplified, nodeIsCompiled)
    const { definition, subtrees } = toTypescriptDefinition({ sourceSymbol, symbolName, schema: simplified })

    file.symbols.push(
        ...Object.values(definition.locals ?? {})
            .filter(isDefined)
            .map((local) => ({
                uuid: local.uuid,
                symbolName: local.symbolName,
                definition: local,
                typeOnly: true,
            }))
    )

    file.symbols.push({
        uuid: simplified.uuid,
        symbolName,
        definition: definition,
        schemaFile,
        compiledFile: nodeIsCompiled ? compiledFile : undefined,
        typeOnly: simplified.description.validator?.enabled !== true,
    })

    if (definition.isExported && simplified.description.validator?.enabled) {
        const cleanSchemasFolder = () => {
            const targetFolder = path.dirname(path.join(targetBaseDir, compiledFile))
            if (fs.existsSync(targetFolder)) {
                console.warn(`Cleaning ${targetFolder}`)
                fs.rmSync(targetFolder, { force: true, recursive: true })
            }
        }
        if (jsonschema.compiled) {
            file.attachedFiles.push({
                targetPath: path.join(targetBaseDir, compiledFile),
                content: `/**\n * ${generatedAjv} \n * eslint-disable\n */\n${jsonschema.code}`,
                prettify: false,
                type: 'validator',
                clean: cleanSchemasFolder,
            })
        } else {
            file.attachedFiles.push({
                targetPath: path.join(targetBaseDir, schemaFile),
                content: JSON.stringify(jsonschema.schema, null, 2),
                prettify: true,
                type: 'jsonschema',
                clean: cleanSchemasFolder,
            })
        }

        console.debug(` - found ${definition.symbolName}`)
    }
    for (const { node: subSymbol, fileSuffix: subFileSuffix, filePath: subFilePath } of subtrees) {
        await loadSymbol({
            symbol: subSymbol,
            basePath,
            sourceSymbol,
            compile,
            definitions,
            srcPath: path.join(basePath, targetPath),
            rootPath: srcPath,
            fileSuffix: subFileSuffix,
            filePath: subFilePath,
            entry,
            outputFileRename,
            appendSourceSymbolName: true,
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
    require?: (module: string) => Promise<Record<string, ThereforeNode | unknown>>
    outputFileRename: (path: string) => string
}) {
    const module = await require(entry)

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
        clean?: () => void
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
    clean,
}: {
    globs: string[]
    ignore: string[]
    extension: string
    compile: boolean
    outputFileRename: (path: string) => string
    clean: boolean
}): Promise<void> {
    const cwd = process.cwd()
    const entries = await expandGlobs({ patterns: globs, ignore: [`!${extension}`, ...ignore], cwd, extension })

    const outputFiles = await compileOutputFiles(entries, {
        cwd,
        outputFileRename,
        compile,
    })

    if (clean) {
        for (const of of outputFiles) {
            if (of.clean !== undefined) {
                of.clean()
            }
        }
    }

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
            data[key]!.symbolName = `${data[key]!.symbolName}${i}`
            data[key]!.uniqueSymbolName = `${data[key]!.uniqueSymbolName}${i}`
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
