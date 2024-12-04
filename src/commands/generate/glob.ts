import { Nothing, isJust, isRight } from '@skyleague/axioms'
import fastGlob from 'fast-glob'

import fs from 'node:fs/promises'
import { posix as pathPosix, resolve } from 'node:path'

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
                const absolutePath = resolve(cwd, pattern)
                if (ignoredDirectories.some((i) => pattern.includes(i))) {
                    return Nothing
                }

                const eitherStat = await fs.stat(absolutePath).then(
                    (stat) => ({ right: stat }),
                    () => ({ left: new Error('Failed to stat file') }),
                )
                if (isRight(eitherStat) && isJust(eitherStat.right)) {
                    if (eitherStat.right.isFile()) {
                        return fastGlob.escapePath(pathPosix.normalize(pattern))
                    }
                    if (eitherStat.right.isDirectory()) {
                        return `${fastGlob.escapePath(pathPosix.normalize(pathPosix.relative(cwd, absolutePath)))}/**/*${extension}`
                    }

                    return Nothing
                }
                if (pattern.startsWith('!')) {
                    globOptions.ignore.push(pathPosix.normalize(pattern.slice(1)))
                    return Nothing
                }
                return pathPosix.normalize(pattern)
            }),
        )
    )
        .map((result) => (result.status === 'fulfilled' ? result.value : Nothing))
        .filter(isJust)
    return await fastGlob(entries, globOptions)
}
