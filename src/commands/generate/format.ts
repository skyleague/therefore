import path from 'node:path'
import { Biome, Distribution } from '@biomejs/js-api'
import type { ThereforeOutputType } from '../../lib/output/types.js'

// biome-ignore lint/suspicious/noExplicitAny: it's a third-party library
export type Prettier = any
export async function maybeLoadPrettier() {
    try {
        // @ts-ignore
        return await import('prettier')
    } catch {
        return undefined
    }
}

const biome = await (async () => {
    const local = await Biome.create({
        distribution: Distribution.NODE,
    })
    try {
        const baseConfig = (await import(`file:///${process.cwd().replace(/\\/g, '/')}/biome.json`)).default
        if ('extends' in baseConfig && Array.isArray(baseConfig.extends)) {
            for (const extend of baseConfig.extends) {
                const extendedConfig = (await import(extend)).default
                local.applyConfiguration(extendedConfig)
            }
        }
        local.applyConfiguration(baseConfig)
    } catch (_e) {
        console.debug('No biome.json found')
    }

    return local
})()

export async function formatFile({
    prettier,
    input,
    file,
    type,
}: {
    prettier: Prettier
    input: string
    file: string
    type: ThereforeOutputType
}): Promise<string> {
    if (prettier !== undefined) {
        const options = await prettier.resolveConfig(file)
        return prettier.format(input, {
            ...(options ?? {}),
            parser: type,
        })
    }
    const formatted = biome.formatContent(input, {
        // this virual path might ignore the file alltogether
        // filePath: file,
        filePath: `src/${path.dirname(file)}.${file.split('.').pop()}`,
    })
    return formatted.content
}
