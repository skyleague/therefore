import type { TypescriptWalkerContext } from './typescript.js'
import { toDeclaration } from './typescript.js'

import { $object, $string, $union, $unknown } from '../../primitives/index.js'

import { forAll, string, tuple, alpha } from '@skyleague/axioms'
import ts from 'typescript'
import { it } from 'vitest'

it('object declaration', () => {
    forAll(tuple(string(), alpha({ minLength: 1 })), ([key, name]) => {
        const declaration = toDeclaration($object({ [key]: $unknown() }), {
            symbolName: name,
        } as unknown as TypescriptWalkerContext)
        return ts.transpileModule(declaration.render(), { reportDiagnostics: true }).diagnostics?.length === 0
    })
})

it('type declaration', () => {
    forAll(alpha({ minLength: 1 }), (name) => {
        const declaration = toDeclaration($union([$string(), $string()]), {
            symbolName: name,
        } as unknown as TypescriptWalkerContext)
        return ts.transpileModule(declaration.render(), { reportDiagnostics: true }).diagnostics?.length === 0
    })
})
