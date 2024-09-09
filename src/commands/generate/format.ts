import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { memoize } from '@skyleague/axioms'
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

export async function formatContent({
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
    return input
}

const execAsync = promisify(exec)

const getBiomeBinaryPath = memoize(async () => {
    try {
        const { stdout } = await execAsync('npx --no-install biome --version')
        if (stdout.trim()) {
            return 'npx'
        }
    } catch (error) {
        console.error('Error finding Biome:', error)
    }
    return null
})

export async function formatBiomeFiles(files: string[]) {
    const biomePath = await getBiomeBinaryPath()
    if (!biomePath) {
        console.warn('Biome not found. Skipping formatting.')
        return
    }
    try {
        const command = `${biomePath} biome check --write ${files.join(' ')}`
        const { stdout, stderr } = await execAsync(command)

        if (stderr) {
            console.warn('Biome formatting warning:', stderr)
        }

        console.log('Biome formatting completed:', stdout)
    } catch (error) {
        console.error('Error running Biome format:', error)
    }
}
