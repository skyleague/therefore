import fs from 'node:fs'
import path from 'node:path'
import type { Node, SourceNode } from '../../lib/cst/node.js'
import { Therefore, therefore } from '../../lib/primitives/therefore.js'
import { ValidatorType } from '../../lib/primitives/validator/validator.js'
import { autoRef, generateNode } from '../../lib/visitor/prepass/prepass.js'
import { type Prettier, formatBiomeFiles, maybeLoadPrettier } from './format.js'
import { expandGlobs } from './glob.js'
import { GenericFileOutput } from './output/generic.js'
import type { ThereforeOutput } from './output/types.js'
import { TypescriptFileOutput } from './output/typescript.js'

type SrcPath = string
type ThereforeModules = Record<SrcPath, Node[]>
export async function scanModules({ files, basePath }: { files: string[]; basePath: string }): Promise<ThereforeModules> {
    const modules: ThereforeModules = {}
    const seenNodes = new WeakSet<Node>()

    const sourceFiles = new Set<string>()

    // First phase: Collect source paths and create empty arrays
    for (const entry of files) {
        const sourcePath = path.resolve(basePath, entry)
        console.log(`Scanning ${entry}`)
        sourceFiles.add(sourcePath)
    }

    // Second phase: Scan modules and collect nodes
    const moduleNodes = (
        await Promise.all(
            Iterator.from(sourceFiles).map((entry) => {
                const sourcePath = path.resolve(basePath, entry)
                return Therefore.scanModule({ entry, sourcePath, seenNodes, sourceFiles })
            }),
        )
    ).flat()

    for (const node of moduleNodes) {
        if (node._sourcePath !== undefined) {
            modules[node._sourcePath] ??= []
            modules[node._sourcePath]?.push(node)
        }
    }

    return modules
}

export function compileModuleExports(modules: ThereforeModules): ThereforeOutput {
    const symbols = Object.values(modules).flatMap((symbols) =>
        symbols.map((s) => {
            if (s instanceof ValidatorType) {
                return s._children[0]
            }
            return s
        }),
    )
    const allSymbols = new WeakSet(symbols)

    for (const symbol of symbols) {
        autoRef(symbol, allSymbols)
    }

    const output: ThereforeOutput = {}
    for (const [_, symbols] of Object.entries(modules)) {
        const handledSymbols = new WeakSet<Node>()
        for (const symbol of symbols) {
            if (handledSymbols.has(symbol)) {
                continue
            }
            handledSymbols.add(symbol)

            const hasSourcePath = (node: Node): node is SourceNode => '_sourcePath' in node
            if (!hasSourcePath(symbol)) {
                throw new Error('Can only load symbols that have a well defined export path')
            }
            generateNode(symbol)

            for (const generator of therefore.generators) {
                generator.fromSymbol({ symbol, output })
            }
        }
    }
    return output
}

export async function compileOutput(entries: string[], { cwd, prettier = undefined }: { cwd: string; prettier?: Prettier }) {
    therefore.generators = [GenericFileOutput, TypescriptFileOutput]
    therefore.zodCache = new WeakMap()

    const modules = await scanModules({ files: entries, basePath: cwd })

    const output = compileModuleExports(modules)

    const outputFiles: Record<string, string> = {}

    for (const file of Object.values(output)) {
        file.bind()
    }

    for (const [targetPath, file] of Object.entries(output)) {
        const contents = await file.render({ prettier })
        if (contents !== undefined) {
            outputFiles[path.relative(cwd, targetPath)] = contents
        }
    }

    return {
        cleanFn: () => {
            for (const of of Object.values(output)) {
                of.clean()
            }
        },
        outputFiles,
    }
}

export async function generate({
    globs,
    ignore,
    extension,
    clean,
}: {
    globs: string[]
    ignore: string[]
    extension: string
    clean: boolean
}): Promise<void> {
    const cwd = process.cwd()
    const entries = await expandGlobs({ patterns: globs, ignore: [`!${extension}`, ...ignore], cwd, extension })

    const prettier = await maybeLoadPrettier()
    const { cleanFn, outputFiles } = await compileOutput(entries, {
        prettier,
        cwd,
    })

    if (clean) {
        cleanFn()
    }

    for (const [targetPath, contents] of Object.entries(outputFiles)) {
        const absTargetPath = path.join(cwd, targetPath)
        fs.mkdirSync(path.dirname(absTargetPath), { recursive: true })
        fs.writeFileSync(absTargetPath, contents)
    }

    await formatBiomeFiles(Object.keys(outputFiles))
}
