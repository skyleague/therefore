import type { TypescriptWalkerContext } from './typescript.js'
import {
    typeDefinitionVisitor,
    toTypescriptDefinition,
    typescriptVisitor,
    readonly,
    optional,
    getIndexSignatureType,
} from './typescript.js'

import { walkTherefore } from '../../cst/visitor.js'
import {
    $array,
    $boolean,
    $dict,
    $enum,
    $integer,
    $intersection,
    $null,
    $nullable,
    $number,
    $object,
    $optional,
    $ref,
    $string,
    $tuple,
    $union,
    $unknown,
} from '../../primitives/index.js'

import { alphaNumeric, forAll, omitUndefined } from '@skyleague/axioms'
import { expect, describe, it } from 'vitest'

describe('optional', () => {
    it('undefined', () => {
        expect(optional({})).toMatchInlineSnapshot(`""`)
        expect(optional(omitUndefined({ optional: undefined }))).toMatchInlineSnapshot(`""`)
    })

    it('explicit', () => {
        expect(optional({ optional: 'explicit' })).toMatchInlineSnapshot(`"?"`)
    })

    it('implicit', () => {
        expect(optional({ optional: 'implicit' })).toMatchInlineSnapshot(`"?"`)
    })
})

describe('readonly', () => {
    it('false', () => {
        expect(readonly({ readonly: false })).toMatchInlineSnapshot(`""`)
    })

    it('true', () => {
        expect(readonly({ readonly: true })).toMatchInlineSnapshot(`"readonly "`)
    })
})

describe('typescriptVisitor', () => {
    it('string', () => {
        expect(walkTherefore($string(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"string"`)
    })

    it('number', () => {
        expect(walkTherefore($number(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"number"`)
    })

    it('integer', () => {
        expect(walkTherefore($integer(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"number"`)
    })

    it('boolean', () => {
        expect(walkTherefore($boolean(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"boolean"`)
    })

    it('null', () => {
        expect(walkTherefore($null(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"null"`)
    })

    it('unknown', () => {
        expect(walkTherefore($unknown(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"unknown"`)
    })

    it('enum', () => {
        expect(
            walkTherefore($enum(['foo', 'bar', { foo: 'bar' }]), typescriptVisitor, {} as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"'foo' | 'bar' | { foo: 'bar' }"`)
    })

    it('array', () => {
        expect(
            walkTherefore($array($string), typescriptVisitor, {
                locals: {},
                references: [],
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"(string)[]"`)
        expect(
            walkTherefore($array($enum(['foo', 'bar', { foo: 'bar' }])), typescriptVisitor, {
                locals: {},
                references: [],
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"('foo' | 'bar' | { foo: 'bar' })[]"`)
        expect(
            walkTherefore($array($union([$string, $integer])), typescriptVisitor, {
                locals: {},
                references: [],
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"(string | number)[]"`)
    })

    it('tuple', () => {
        expect(
            walkTherefore($tuple([$string, $string, $integer]), typescriptVisitor, {} as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"[string, string, number]"`)
    })

    it('named tuple', () => {
        expect(
            walkTherefore(
                $tuple({
                    foo: $string,
                    boo: $integer,
                }),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`"[foo: string, boo: number]"`)
        expect(
            walkTherefore(
                $tuple({
                    x: $number,
                    y: $number,
                    z: $number,
                }),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`"[x: number, y: number, z: number]"`)
    })

    it('dict', () => {
        expect(walkTherefore($dict($string), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`
            "{
                [k: string]: ( string ) | undefined
            }"
        `)
    })

    it('ref', () => {
        const foo = $dict($string)
        expect(
            walkTherefore($ref(foo), typescriptVisitor, {
                references: [],
                locals: {},
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"{{0002-000:referenceName}}"`)
        // test the stable uuid referencing
        expect(
            walkTherefore($union([$ref(foo), $dict($ref(foo))]), typescriptVisitor, {
                references: [],
                locals: {},
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            "{{0002-000:referenceName}} | {
                [k: string]: ( {{0002-000:referenceName}} ) | undefined
            }"
        `)
    })

    it('union', () => {
        expect(walkTherefore($union([$string]), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(
            `"string"`
        )
        expect(
            walkTherefore($union([$string, $string, $integer]), typescriptVisitor, {} as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"string | string | number"`)
    })

    it('intersection', () => {
        expect(walkTherefore($intersection([$object({ foo: $string })]), typescriptVisitor, {} as TypescriptWalkerContext))
            .toMatchInlineSnapshot(`
            "{
                foo: string
            }"
        `)
        expect(
            walkTherefore(
                $intersection([$object({ foo: $string }), $object({ bar: $string })]),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            "{
                foo: string
            } & {
                bar: string
            }"
        `)
    })

    it('object', () => {
        expect(walkTherefore($object({ foo: $string }), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`
            "{
                foo: string
            }"
        `)
        expect(
            walkTherefore(
                $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            "{
                foo: string
                bar: (number | null)
                baz?: number
            }"
        `)
        expect(
            walkTherefore(
                $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            "{
                foo: string
                /**
                 * fooscription
                 */
                bar: string
            }"
        `)
        expect(
            walkTherefore(
                $object({ foo: $string, bar: $string({ description: 'fooscription', readonly: true }) }),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            "{
                foo: string
                /**
                 * fooscription
                 * 
                 * @readonly
                 */
                readonly bar: string
            }"
        `)
    })
})

describe('toTypeDefinition', () => {
    it('string', () => {
        expect(
            walkTherefore($string(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = string
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    it('number', () => {
        expect(
            walkTherefore($number(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = number
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    it('integer', () => {
        expect(
            walkTherefore($integer(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = number
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    it('boolean', () => {
        expect(
            walkTherefore($boolean(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = boolean
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    it('null', () => {
        expect(
            walkTherefore($null(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = null
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    it('unknown', () => {
        expect(
            walkTherefore($unknown(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = unknown
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    it('enum', () => {
        expect(
            walkTherefore($enum(['foo', 'bar', { foo: 'bar' }]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0001-000:symbolName}} = 'foo' | 'bar' | { foo: 'bar' }
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
        expect(
            walkTherefore($enum({ foo: 'bar', bar: 1, baz: true }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "enum {{0002-000:symbolName}} {
                foo = 'bar',
                bar = 1,
                baz = true,
            }

            ",
              "referenceName": "{{0002-000:symbolName}}",
            }
        `)
        expect(
            walkTherefore($enum({ foo: 'bar', bar: [1, 2, 3] }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "const {{0003-000:symbolName}}Enum = {
                foo: 'bar',
                bar: [1, 2, 3],
            } as const
            type {{0003-000:symbolName}} = typeof {{0003-000:symbolName}}Enum

            ",
              "referenceName": "keyof typeof {{0003-000:symbolName}}",
            }
        `)
    })

    it('array', () => {
        expect(
            walkTherefore($array($string), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0002-000:symbolName}} = (string)[]
            ",
              "referenceName": "{{0002-000:symbolName}}",
            }
        `)
        expect(
            walkTherefore($array($enum(['foo', 'bar', { foo: 'bar' }])), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0004-000:symbolName}} = ('foo' | 'bar' | { foo: 'bar' })[]
            ",
              "referenceName": "{{0004-000:symbolName}}",
            }
        `)
        const locals = {}
        expect(
            walkTherefore($array($union([$string, $integer])), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals,
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0008-000:symbolName}} = (string | number)[]
            ",
              "referenceName": "{{0008-000:symbolName}}",
            }
        `)
        expect(locals).toMatchInlineSnapshot(`{}`)
    })

    it('tuple', () => {
        expect(
            walkTherefore($tuple([$string, $string, $integer]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0004-000:symbolName}} = [string, string, number]
            ",
              "referenceName": "{{0004-000:symbolName}}",
            }
        `)
    })

    it('named tuple', () => {
        expect(
            walkTherefore(
                $tuple({
                    foo: $string,
                    boo: $integer,
                }),

                typeDefinitionVisitor,
                { references: [], symbolName: 'Foo', locals: {} } as unknown as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0003-000:symbolName}} = [foo: string, boo: number]
            ",
              "referenceName": "{{0003-000:symbolName}}",
            }
        `)
        expect(
            walkTherefore(
                $tuple({
                    x: $number,
                    y: $number,
                    z: $number,
                }),

                typeDefinitionVisitor,
                { references: [], symbolName: 'Foo', locals: {} } as unknown as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0007-000:symbolName}} = [x: number, y: number, z: number]
            ",
              "referenceName": "{{0007-000:symbolName}}",
            }
        `)
    })

    it('dict', () => {
        expect(
            walkTherefore($dict($string), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "interface {{0002-000:symbolName}} {
                [k: string]: ( string ) | undefined
            }
            ",
              "referenceName": "{{0002-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })

    it('ref', () => {
        const foo = $dict($string)
        expect(
            walkTherefore($ref(foo), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0003-000:symbolName}} = {{0002-000:referenceName}}
            ",
              "referenceName": "{{0003-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        // test the stable uuid referencing
        expect(
            walkTherefore($union([$ref(foo), $dict($ref(foo))]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0007-000:symbolName}} = {{0002-000:referenceName}} | {
                [k: string]: ( {{0002-000:referenceName}} ) | undefined
            }
            ",
              "referenceName": "{{0007-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })

    it('union', () => {
        expect(
            walkTherefore($union([$string]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0002-000:symbolName}} = string
            ",
              "referenceName": "{{0002-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        expect(
            walkTherefore($union([$string, $string, $integer]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0006-000:symbolName}} = string | string | number
            ",
              "referenceName": "{{0006-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })

    it('intersection', () => {
        expect(
            walkTherefore($intersection([$object({ foo: $string }), $object({ bar: $string })]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{0005-000:symbolName}} = {
                foo: string
            } & {
                bar: string
            }
            ",
              "referenceName": "{{0005-000:symbolName}}",
            }
        `)
        expect(
            walkTherefore($intersection([$object({ foo: $string }), $object({ bar: $string })]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "type {{00010-000:symbolName}} = {
                foo: string
            } & {
                bar: string
            }
            ",
              "referenceName": "{{00010-000:symbolName}}",
            }
        `)
    })

    it('object', () => {
        expect(
            walkTherefore($object({ foo: $string }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "interface {{0002-000:symbolName}} {
                foo: string
            }
            ",
              "referenceName": "{{0002-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        expect(
            walkTherefore($object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "interface {{0008-000:symbolName}} {
                foo: string
                bar: (number | null)
                baz?: number
            }
            ",
              "referenceName": "{{0008-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        expect(
            walkTherefore($object({ foo: $string, bar: $string({ description: 'fooscription' }) }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            {
              "declaration": "interface {{00011-000:symbolName}} {
                foo: string
                /**
                 * fooscription
                 */
                bar: string
            }
            ",
              "referenceName": "{{00011-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        expect(
            walkTherefore(
                $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },

                    { default: { foo: 'bar', bar: 'foo' } }
                ),

                typeDefinitionVisitor,
                {
                    references: [],
                    symbolName: 'Foo',
                    locals: {},
                } as unknown as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            {
              "declaration": "/**
             * @default { foo: 'bar', bar: 'foo' }
             */
            interface {{00014-000:symbolName}} {
                foo: string
                /**
                 * fooscription
                 */
                bar: string
            }
            ",
              "referenceName": "{{00014-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })

    it('other', () => {
        expect(
            walkTherefore($object({ foo: $string }, { indexSignature: $number }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
          {
            "declaration": "interface {{0003-000:symbolName}} {
              foo: string
              [k: string]: number
          }
          ",
            "referenceName": "{{0003-000:symbolName}}",
            "render": [Function],
            "sourceSymbol": undefined,
          }
        `)
    })
})

describe('toTypescriptDefinition', () => {
    // it('string', () => {
    //     expect(toTypescriptDefinition('foo', $string()).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = string
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // it('number', () => {
    //     expect(toTypescriptDefinition('foo', $number())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = number
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // it('integer', () => {
    //     expect(toTypescriptDefinition('foo', $integer())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = number
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // it('boolean', () => {
    //     expect(toTypescriptDefinition('foo', $boolean())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = boolean
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // it('null', () => {
    //     expect(toTypescriptDefinition('foo', $null())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = null
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // it('unknown', () => {
    //     expect(toTypescriptDefinition('foo', $unknown())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = unknown
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // it('enum', () => {
    //     expect(
    //         toTypescriptDefinition('foo', $enum(['foo', 'bar', { foo: 'bar' }]), typeDefinitionVisitor, {
    //             references: [],
    //             symbolName: 'Foo',
    //         })
    //     ).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = 'foo' | 'bar' | { foo: 'bar' }
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    //     expect(
    //         toTypescriptDefinition('foo', $enum({ foo: 'bar', bar: 1, baz: true }), typeDefinitionVisitor, {
    //             references: [],
    //             symbolName: 'Foo',
    //         })
    //     ).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export enum Foo {
    //             foo = 'bar',
    //             bar = 1,
    //             baz = true,
    //         }

    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    //     expect(
    //         toTypescriptDefinition('foo', $enum({ foo: 'bar', bar: [1, 2, 3] }), typeDefinitionVisitor, {
    //             references: [],
    //             symbolName: 'Foo',
    //         })
    //     ).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export const Foo = {
    //             foo: 'bar' as const,
    //             bar: [1, 2, 3] as const,
    //         }

    //         ",
    //           "referenceName": "keyof typeof Foo",
    //         }
    //     `)
    // })

    it('array', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $array($string) })).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export type {{0002-000:symbolName}} = (string)[]
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0002-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0002-000:symbolName}}",
                "uuid": "0002-000",
              },
              "subtrees": [],
            }
        `)
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $array($enum(['foo', 'bar', { foo: 'bar' }])) }))
            .toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export type {{0004-000:symbolName}} = ('foo' | 'bar' | { foo: 'bar' })[]
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0004-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0004-000:symbolName}}",
                "uuid": "0004-000",
              },
              "subtrees": [],
            }
        `)
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $array($union([$string, $integer])) }))
            .toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export type {{0008-000:symbolName}} = (string | number)[]
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0008-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0008-000:symbolName}}",
                "uuid": "0008-000",
              },
              "subtrees": [],
            }
        `)
    })

    it('tuple', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $tuple([$string, $string, $integer]) }))
            .toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export type {{0004-000:symbolName}} = [string, string, number]
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0004-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0004-000:symbolName}}",
                "uuid": "0004-000",
              },
              "subtrees": [],
            }
        `)
    })

    it('named tuple', () => {
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $tuple({
                    foo: $string,
                    boo: $integer,
                }),
            })
        ).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export type {{0003-000:symbolName}} = [foo: string, boo: number]
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0003-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0003-000:symbolName}}",
                "uuid": "0003-000",
              },
              "subtrees": [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $tuple({
                    x: $number,
                    y: $number,
                    z: $number,
                }),
            })
        ).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export type {{0007-000:symbolName}} = [x: number, y: number, z: number]
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0007-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0007-000:symbolName}}",
                "uuid": "0007-000",
              },
              "subtrees": [],
            }
        `)
    })

    it('dict', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $dict($string) })).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export interface {{0002-000:symbolName}} {
                [k: string]: ( string ) | undefined
            }
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0002-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0002-000:symbolName}}",
                "uuid": "0002-000",
              },
              "subtrees": [],
            }
        `)
    })

    it('ref', () => {
        const foo = $dict($string)
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $object({ bar: $ref(foo) }) })).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export interface {{0004-000:symbolName}} {
                bar: {{0002-000:referenceName}}
            }
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0004-000:symbolName}}",
                "references": [
                  {
                    "exportSymbol": false,
                    "name": undefined,
                    "reference": [
                      {
                        "children": [
                          {
                            "description": {},
                            "type": "string",
                            "uuid": "0001-000",
                            "value": {},
                          },
                        ],
                        "description": {},
                        "type": "dict",
                        "uuid": "0002-000",
                        "value": {},
                      },
                    ],
                    "referenceName": "{{0002-000:referenceName}}",
                    "uuid": "0002-000",
                  },
                ],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0004-000:symbolName}}",
                "uuid": "0004-000",
              },
              "subtrees": [],
            }
        `)
        // expect(toTypescriptDefinition('foo', $ref({ foo }))).toMatchInlineSnapshot(`
        //     {
        //       "interface": {
        //         "declaration": "export type Foo = {{0001-000}}
        //     ",
        //         "interfaceName": "Foo",
        //         "meta": undefined,
        //         "referenceName": "Foo",
        //         "symbolName": "foo",
        //         "uuid": undefined,
        //       },
        //       "references": [
        //         {
        //           "hash": "0001-000",
        //           "name": "foo",
        //         },
        //       ],
        //     }
        // `)
        // // test the stable uuid referencing
        // expect(toTypescriptDefinition('foo', $union([$ref({ foo }), $dict($ref({ foo }))]))).toMatchInlineSnapshot(`
        //     {
        //       "interface": {
        //         "declaration": "export type Foo = {{0001-000}} | {
        //         [k: string]: ( {{0001-000}} ) | undefined
        //     }
        //     ",
        //         "interfaceName": "Foo",
        //         "meta": undefined,
        //         "referenceName": "Foo",
        //         "symbolName": "foo",
        //         "uuid": undefined,
        //       },
        //       "references": [
        //         {
        //           "hash": "0001-000",
        //           "name": "foo",
        //         },
        //       ],
        //     }
        // `)
    })

    // it('union', () => {
    //     expect(toTypescriptDefinition('foo', $union([$string]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = string
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    //     expect(toTypescriptDefinition('foo', $union([$string, $string, $integer]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = string | string | number
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    // })

    // it('intersection', () => {
    //     expect(toTypescriptDefinition('foo', $intersection([$string]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = (string)
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    //     expect(toTypescriptDefinition('foo', $intersection([$string, $integer]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = (string & number)
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    // })

    // it('union & intersection', () => {
    //     expect(toTypescriptDefinition('foo', $union([$string, $intersection([$string, $integer]), $integer])))
    //         .toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = string | (string & number) | number
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    // })

    it('object', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $object({ foo: $string }) })).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export interface {{0002-000:symbolName}} {
                foo: string
            }
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0002-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0002-000:symbolName}}",
                "uuid": "0002-000",
              },
              "subtrees": [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
            })
        ).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export interface {{0008-000:symbolName}} {
                foo: string
                bar: (number | null)
                baz?: number
            }
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{0008-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0008-000:symbolName}}",
                "uuid": "0008-000",
              },
              "subtrees": [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
            })
        ).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export interface {{00011-000:symbolName}} {
                foo: string
                /**
                 * fooscription
                 */
                bar: string
            }
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{00011-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{00011-000:symbolName}}",
                "uuid": "00011-000",
              },
              "subtrees": [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $object({ foo: $enum(['foo', 'bar']) }),
            })
        ).toMatchInlineSnapshot(`
            {
              "definition": {
                "declaration": "export interface {{00013-000:symbolName}} {
                foo: 'foo' | 'bar'
            }
            ",
                "imports": [],
                "isExported": true,
                "locals": {},
                "referenceName": "{{00013-000:symbolName}}",
                "references": [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{00013-000:symbolName}}",
                "uuid": "00013-000",
              },
              "subtrees": [],
            }
        `)
    })
})

describe('getIndexSignatureType', () => {
    it('simple literal', () => {
        forAll(alphaNumeric({ minLength: 1 }), (a) =>
            expect(getIndexSignatureType(a)).toEqual({ type: `\`\${string}${a}\${string}\`` })
        )
    })

    it('simple union', () => {
        expect(getIndexSignatureType('foo|bar')).toMatchInlineSnapshot(`
            {
              "type": "\`\${string}foo | bar\${string}\`",
            }
        `)
    })

    it('simple union with start string', () => {
        expect(getIndexSignatureType('^(foo|bar)')).toMatchInlineSnapshot(`
            {
              "type": "\`foo | bar\${string}\`",
            }
        `)
    })

    it('complicated pattern', () => {
        expect(getIndexSignatureType('^[1-5](?:\\d{2}|XX)$')).toMatchInlineSnapshot(`
            {
              "type": "string",
            }
        `)
    })

    it('complicated pattern 2', () => {
        expect(getIndexSignatureType('^\\/')).toMatchInlineSnapshot(`
            {
              "type": "\`/\${string}\`",
            }
        `)
    })

    it('simple start pattern', () => {
        expect(getIndexSignatureType('^x-')).toMatchInlineSnapshot(`
            {
              "type": "\`x-\${string}\`",
            }
        `)
    })
})
