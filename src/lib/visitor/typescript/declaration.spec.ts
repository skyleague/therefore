import type { TypescriptWalkerContext } from './typescript'
import { toDeclaration } from './typescript'

import { $object, $string, $union, $unknown } from '../../primitives'

import { forAll, string, tuple, alphaString } from '@skyleague/axioms'
import * as ts from 'typescript'

test('object declaration', () => {
    forAll(tuple(string(), alphaString({ minLength: 1 })), ([key, name]) => {
        const declaration = toDeclaration($object({ [key]: $unknown() }), {
            symbolName: name,
        } as unknown as TypescriptWalkerContext)
        return ts.transpileModule(declaration.render(), { reportDiagnostics: true }).diagnostics?.length === 0
    })
})

test('type declaration', () => {
    forAll(alphaString({ minLength: 1 }), (name) => {
        const declaration = toDeclaration($union([$string(), $string()]), {
            symbolName: name,
        } as unknown as TypescriptWalkerContext)
        return ts.transpileModule(declaration.render(), { reportDiagnostics: true }).diagnostics?.length === 0
    })
})
