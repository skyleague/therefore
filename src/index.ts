import type { CommandModule } from 'yargs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import packageJSON from '../package.json' with { type: 'json' }
import * as commands from './commands/index.js'
export type { OpenapiV3 } from './types/openapi.type.js'
export * from './lib/visitor/index.js'
export type { InferSchemaType, Schema } from './lib/types.js'
export * from './lib/cst/index.js'
export * from './lib/primitives/index.js'

const { bin } = packageJSON

/**
 * @internal
 */
export async function run(): Promise<void> {
    let cli = yargs(hideBin(process.argv)).scriptName(Object.keys(bin)[0] ?? 'cli')
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }
    await cli.demandCommand().strict().help().argv
}
