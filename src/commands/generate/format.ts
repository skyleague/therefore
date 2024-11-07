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

    const baseCommand = `${biomePath} biome check --write `
    let fileChunks: string[][]
    if (process.platform === 'win32') {
        // Windows command line length limit
        const MAX_COMMAND_LENGTH = 8180
        const remainingLength = MAX_COMMAND_LENGTH - baseCommand.length

        fileChunks = []
        let currentChunk: string[] = []
        let currentLength = 0

        for (const file of files) {
            // +1 for the space between files
            // +2 for the quotes
            const fileLength = file.length + 1 + 2

            if (currentLength + fileLength > remainingLength) {
                fileChunks.push(currentChunk)
                currentChunk = []
                currentLength = 0
            }

            currentChunk.push(`"${file}"`)
            currentLength += fileLength
        }

        if (currentChunk.length > 0) {
            fileChunks.push(currentChunk)
        }
    } else {
        // On non-Windows platforms, process all files at once
        fileChunks = [files]
    }

    try {
        const promises = fileChunks.map(async (fileChunk) => {
            const command = `${baseCommand} ${fileChunk.join(' ')}`
            const { stdout, stderr } = await execAsync(command)

            if (stderr) {
                console.warn('Biome formatting warning:', stderr)
            }
            return stdout
        })

        const results = await Promise.all(promises)
        console.log('Biome formatting completed:', results.join('\n'))
    } catch (error) {
        console.error('Error running Biome format:', error)
    }
}
