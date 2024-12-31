import { Project } from '../../../examples/restclients/ajv/nasa/astroids/nasa.type.js'
import { compileOutput } from '../../../src/commands/generate/generate.js'
import { arbitrary } from '../../../src/index.js'

import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('output generation - ajv', async () => {
    expect(
        await compileOutput(['examples/restclients/ajv/nasa/nasa.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('output generation - zod', async () => {
    expect(
        await compileOutput(['examples/restclients/zod/nasa/nasa.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('arbitrary', () => {
    forAll(arbitrary(Project), (p) => Project.is(p))
})
