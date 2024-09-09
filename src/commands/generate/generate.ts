import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isFailure, isFunction, mapTry } from '@skyleague/axioms'
import type { Schema } from '@typeschema/main'
import { isNode } from '../../lib/cst/cst.js'
import type { Node, SourceNode } from '../../lib/cst/node.js'
import { GenericFileOutput } from '../../lib/output/generic.js'
import type { ThereforeOutput } from '../../lib/output/types.js'
import { TypescriptFileOutput } from '../../lib/output/typescript.js'
import { $ref } from '../../lib/primitives/ref/ref.js'
import { therefore } from '../../lib/primitives/therefore.js'
import { ValidatorType } from '../../lib/primitives/validator/validator.js'
import { autoRef, generateNode } from '../../lib/visitor/prepass/prepass.js'
import { type Prettier, formatBiomeFiles, maybeLoadPrettier } from './format.js'
import { expandGlobs } from './glob.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
async function requireModule(module: string): Promise<Record<string, Node | unknown>> {
    const relative = path.relative(__dirname, module).replace(/\\/g, '/')

    const mod = (await import(relative.startsWith('.') ? relative : `./${relative}`)) as Record<string, unknown>
    return (mod.default ?? mod) as Record<string, Node | unknown>
}

export function loadNodes({
    sourceSymbol,
    node,
    sourcePath,
    seen = new Set<string>(),
}: {
    sourceSymbol: string | undefined
    node: Node
    sourcePath: string
    seen?: Set<string>
}): Node[] {
    if (seen.has(node._id)) {
        return []
    }

    const evaluated = therefore.exportSymbol({ symbol: node, sourcePath, sourceSymbol })

    seen.add(evaluated._id)

    // DFS on hypergraph
    const nodes: Node[] = []
    for (const connection of evaluated._connections ?? []) {
        nodes.push(
            ...loadNodes({
                sourceSymbol: undefined,
                node: connection,
                sourcePath: evaluated._sourcePath,
                seen,
            }),
        )
    }
    nodes.push(evaluated)

    return nodes
}

export async function scanModule({
    entry,
    sourcePath,
    basePath: _,
    require = requireModule,
}: {
    entry: string
    sourcePath: string
    basePath: string
    require?: (module: string) => Promise<Record<string, Node | Schema | unknown>>
}) {
    const module = await require(entry)

    const exports: Node[] = []

    for (const [nodeName, nodePromise] of Object.entries(module)) {
        let node = await nodePromise

        if (isFunction(node)) {
            node = await mapTry(node, (x) => x())
        }
        if (!isNode(node)) {
            node = await mapTry(node, (x) => $ref(x as Schema))
            if (isFailure(node)) {
                continue
            }
        }
        const evaluated = loadNodes({ sourceSymbol: nodeName, node: node as Node, sourcePath })

        exports.push(...evaluated)
    }

    console.log(` - found ${[...new Set(exports.map((e) => e._name))].join(', ')}`)

    return exports
}
type SrcPath = string
type ThereforeModules = Record<SrcPath, Node[]>
export async function scanModules({ files, basePath }: { files: string[]; basePath: string }): Promise<ThereforeModules> {
    const modules: ThereforeModules = {}

    const moduleNodes = (
        await Promise.all(
            files.map((entry) => {
                const sourcePath = path.resolve(basePath, entry)
                console.log(`Scanning ${entry}`)

                return scanModule({ entry, basePath, sourcePath })
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
        for (const symbol of symbols) {
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
