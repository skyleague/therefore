import { Project } from '../../../examples/restclients/nasa/astroids/nasa.type.js'
import { compileOutput } from '../../../src/commands/generate/generate.js'
import { arbitrary } from '../../../src/index.js'

import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('output generation', async () => {
    expect(
        await compileOutput(['examples/restclients/nasa/nasa.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('arbitrary', () => {
    forAll(arbitrary(Project), (p) => Project.is(p))
})
