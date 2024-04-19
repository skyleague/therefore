import { Theme, Typedoc } from '../../examples/typedoc/typedoc.type.js'
import { compileOutput } from '../../src/commands/generate/generate.js'
import { arbitrary } from '../../src/index.js'

import { forAll } from '@skyleague/axioms'
import { expect, it } from 'vitest'

it('output generation', async () => {
    expect(
        await compileOutput(['examples/typedoc/typedoc.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

it('arbitrary typedoc', () => {
    forAll(arbitrary(Typedoc), (p) => Typedoc.is(p))
})

it('arbitrary theme', () => {
    forAll(arbitrary(Theme), (t) => Theme.is(t))
})
