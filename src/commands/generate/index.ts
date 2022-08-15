import { generate } from './generate'

import type { Argv } from 'yargs'

export function builder(yargs: Argv) {
    return yargs
        .option('files', {
            alias: 'f',
            demandOption: true,
            describe: 'globs to scan for schemas',
            type: 'array',
        })
        .option('ignore-pattern', {
            alias: 'i',
            demandOption: true,
            default: ['**/*.d.ts', 'node_modules'],
            describe: 'globs to exclude',
            type: 'array',
        })
        .option('compile', {
            default: true,
            type: 'boolean',
        })
        .option('ext', {
            default: '.schema.ts',
            type: 'string',
        })
        .option('out-ext', {
            default: '.type.ts',
            type: 'string',
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { files = [], 'ignore-pattern': ignorePatterns, ext, 'out-ext': outExt, compile } = await argv

    await generate({
        globs: files.map((f) => f.toString()),
        ignore: ignorePatterns,
        extension: ext,
        outputFileRename: (path: string) => path.replace(ext, outExt),
        compile,
    })
}

export default {
    command: ['generate', '*'],
    describe: 'generate therefore types',
    builder,
    handler,
}
