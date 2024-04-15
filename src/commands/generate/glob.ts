import { Nothing, fstat, isJust, isRight, normalizePath } from '@skyleague/axioms'
import fastGlob from 'fast-glob'

import path from 'node:path'

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
        await Promise.allSettled(
            patterns.map(async (pattern) => {
                const absolutePath = path.resolve(cwd, pattern)
                if (ignoredDirectories.some((i) => pattern.includes(i))) {
                    return Nothing
                }

                const eitherStat = await fstat(absolutePath)
                if (isRight(eitherStat) && isJust(eitherStat.right)) {
                    if (eitherStat.right.isFile()) {
                        return fastGlob.escapePath(normalizePath(pattern))
                    }
                    if (eitherStat.right.isDirectory()) {
                        return `${fastGlob.escapePath(normalizePath(path.relative(cwd, absolutePath)))}/**/*${extension}`
                    }

                    return Nothing
                }
                if (pattern.startsWith('!')) {
                    globOptions.ignore.push(normalizePath(pattern.slice(1)))
                    return Nothing
                }
                return normalizePath(pattern)
            }),
        )
    )
        .map((result) => (result.status === 'fulfilled' ? result.value : Nothing))
        .filter(isJust)
    return await fastGlob(entries, globOptions)
}
