import { generate } from './generate.js'

import { constants } from '../../lib/constants.js'

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
        .option('clean', {
            default: false,
            type: 'boolean',
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { files = [], 'ignore-pattern': ignorePatterns, clean } = await argv

    await generate({
        globs: files.map((f) => f.toString()),
        ignore: ignorePatterns.map((p) => p.toString()),
        extension: constants.schemaExtension,
        clean,
    })
}

export default {
    command: ['generate', '*'],
    describe: 'generate therefore types',
    builder,
    handler,
}
