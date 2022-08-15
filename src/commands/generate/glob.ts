import { awaitAll } from '../../common/util'

import { normalizePath, fstat, isJust, isRight, Nothing } from '@skyleague/axioms'
import fastGlob from 'fast-glob'

import path from 'path'

// should give the same glob behaviour as Prettier
// https://github.com/prettier/prettier/blob/main/src/cli/expand-patterns.js
// also heavily inspired by the logic there :)
export async function expandGlobs({
    patterns,
    ignore = [],
    cwd,
    extension,
}: {
    patterns: string[]
    ignore?: string[]
    cwd: string
    extension: string
}): Promise<string[]> {
    const ignoredDirectories = ['.git', '.svn', '.hg', 'node_modules']
    const globOptions = {
        dot: true,
        ignore: [...ignoredDirectories.map((dir) => `**/${dir}`), ...ignore],
    }

    const entries: string[] = (
        await awaitAll(patterns, async (pattern) => {
            const absolutePath = path.resolve(cwd, pattern)
            if (ignoredDirectories.some((i) => pattern.includes(i))) {
                return Nothing
            }

            const eitherStat = await fstat(absolutePath)
            if (isRight(eitherStat) && eitherStat.right !== Nothing) {
                if (eitherStat.right.isFile()) {
                    return fastGlob.escapePath(normalizePath(pattern))
                } else if (eitherStat.right.isDirectory()) {
                    return `${fastGlob.escapePath(normalizePath(path.relative(cwd, absolutePath) ?? '.'))}/**/*${extension}`
                }

                return Nothing
            } else if (pattern.startsWith('!')) {
                globOptions.ignore.push(normalizePath(pattern.slice(1)))
                return Nothing
            }
            return normalizePath(pattern)
        })
    ).filter(isJust)
    return await fastGlob(entries, globOptions)
}
