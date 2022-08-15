import * as commands from './commands'

import { bin } from '../package.json'

import { install } from 'source-map-support'
import type { CommandModule } from 'yargs'

export { OpenapiV3 } from './openapi.type'
export * from './lib/primitives'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-imports, @typescript-eslint/no-var-requires
const yargs: typeof import('yargs') = require('yargs')

/**
 * @internal
 */
export async function run(): Promise<void> {
    install()

    let cli = yargs.scriptName(Object.keys(bin)[0])
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }
    await cli.demandCommand().strict().help().argv
}
