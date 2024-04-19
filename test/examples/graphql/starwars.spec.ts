import { compileOutput } from '../../../src/commands/generate/generate.js'
import { expandGlobs } from '../../../src/commands/generate/glob.js'

import { expect, it } from 'vitest'

it('output generation', async () => {
    expect(
        await compileOutput(
            await expandGlobs({ patterns: ['examples/graphql/star-wars/'], extension: '.schema.ts', cwd: process.cwd() }),
            {
                cwd: process.cwd(),
            },
        ),
    ).toMatchSnapshot()
})
