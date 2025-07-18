import { alpha, forAll, string, tuple } from '@skyleague/axioms'
import ts from 'typescript'
import { it } from 'vitest'
import { TypescriptFileOutput } from '../../../commands/generate/output/typescript.js'
import { $object } from '../../primitives/object/object.js'
import { $string } from '../../primitives/string/string.js'
import { $union } from '../../primitives/union/union.js'
import { $unknown } from '../../primitives/unknown/unknown.js'

it('object declaration', () => {
    forAll(
        tuple(string(), alpha({ minLength: 1 })),
        ([key, name]) => {
            if (name.length === 0) {
                throw new Error()
            }
            const declaration = TypescriptFileOutput.define({
                symbol: $object({ [key]: $unknown() }, { name }),
                render: true,
            })
            return ts.transpileModule(declaration, { reportDiagnostics: true }).diagnostics?.length === 0
        },
        { seed: 108703331931n },
    )
})

it('type declaration', () => {
    forAll(alpha({ minLength: 1 }), (name) => {
        const declaration = TypescriptFileOutput.define({
            symbol: $union([$string(), $string()], { name }),
            render: true,
        })

        return ts.transpileModule(declaration, { reportDiagnostics: true }).diagnostics?.length === 0
    })
})
