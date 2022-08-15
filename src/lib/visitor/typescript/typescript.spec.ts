import type { TypescriptWalkerContext } from './typescript'
import {
    typeDefinitionVisitor,
    toTypescriptDefinition,
    typescriptVisitor,
    readonly,
    optional,
    getIndexSignatureType,
} from './typescript'

import { walkCst } from '../../cst/visitor'
import {
    $array,
    $boolean,
    $dict,
    $enum,
    $integer,
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
} from '../../primitives'

import { alphaNumericString, forAll } from '@skyleague/axioms'

describe('optional', () => {
    test('false', () => {
        expect(optional({})).toMatchInlineSnapshot(`""`)
        expect(optional({ optional: false })).toMatchInlineSnapshot(`""`)
    })

    test('true', () => {
        expect(optional({ optional: true })).toMatchInlineSnapshot(`"?"`)
    })
})

describe('readonly', () => {
    test('false', () => {
        expect(readonly({ readonly: false })).toMatchInlineSnapshot(`""`)
    })

    test('true', () => {
        expect(readonly({ readonly: true })).toMatchInlineSnapshot(`"readonly "`)
    })
})

describe('typescriptVisitor', () => {
    test('string', () => {
        expect(walkCst($string(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"string"`)
    })

    test('number', () => {
        expect(walkCst($number(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"number"`)
    })

    test('integer', () => {
        expect(walkCst($integer(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"number"`)
    })

    test('boolean', () => {
        expect(walkCst($boolean(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"boolean"`)
    })

    test('null', () => {
        expect(walkCst($null(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"null"`)
    })

    test('unknown', () => {
        expect(walkCst($unknown(), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"unknown"`)
    })

    test('enum', () => {
        expect(
            walkCst($enum(['foo', 'bar', { foo: 'bar' }]), typescriptVisitor, {} as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"'foo' | 'bar' | { foo: 'bar' }"`)
    })

    test('array', () => {
        expect(
            walkCst($array($string), typescriptVisitor, {
                locals: {},
                references: [],
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"(string)[]"`)
        expect(
            walkCst($array($enum(['foo', 'bar', { foo: 'bar' }])), typescriptVisitor, {
                locals: {},
                references: [],
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"('foo' | 'bar' | { foo: 'bar' })[]"`)
        expect(
            walkCst($array($union([$string, $integer])), typescriptVisitor, {
                locals: {},
                references: [],
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"(string | number)[]"`)
    })

    test('tuple', () => {
        expect(
            walkCst($tuple([$string, $string, $integer]), typescriptVisitor, {} as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"[string, string, number]"`)
    })

    test('named tuple', () => {
        expect(
            walkCst(
                $tuple({
                    foo: $string,
                    boo: $integer,
                }),
                typescriptVisitor,
                {} as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`"[foo: string, boo: number]"`)
        expect(
            walkCst(
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

    test('dict', () => {
        expect(walkCst($dict($string), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`
            "{
                [k: string]: ( string ) | undefined
            }"
        `)
    })

    test('ref', () => {
        const foo = $dict($string)
        expect(
            walkCst($ref(foo), typescriptVisitor, {
                references: [],
                locals: {},
                symbolName: '',
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"{{0002-000:referenceName}}"`)
        // test the stable uuid referencing
        expect(
            walkCst($union([$ref(foo), $dict($ref(foo))]), typescriptVisitor, {
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

    test('union', () => {
        expect(walkCst($union([$string]), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`"string"`)
        expect(
            walkCst($union([$string, $string, $integer]), typescriptVisitor, {} as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`"string | string | number"`)
    })

    test('object', () => {
        expect(walkCst($object({ foo: $string }), typescriptVisitor, {} as TypescriptWalkerContext)).toMatchInlineSnapshot(`
            "{
                foo: string
            }"
        `)
        expect(
            walkCst(
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
            walkCst(
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
            walkCst(
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
    test('string', () => {
        expect(
            walkCst($string(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = string
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    test('number', () => {
        expect(
            walkCst($number(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = number
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    test('integer', () => {
        expect(
            walkCst($integer(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = number
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    test('boolean', () => {
        expect(
            walkCst($boolean(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = boolean
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    test('null', () => {
        expect(
            walkCst($null(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = null
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    test('unknown', () => {
        expect(
            walkCst($unknown(), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = unknown
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
    })

    test('enum', () => {
        expect(
            walkCst($enum(['foo', 'bar', { foo: 'bar' }]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0001-000:symbolName}} = 'foo' | 'bar' | { foo: 'bar' }
            ",
              "referenceName": "{{0001-000:symbolName}}",
            }
        `)
        expect(
            walkCst($enum({ foo: 'bar', bar: 1, baz: true }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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
            walkCst($enum({ foo: 'bar', bar: [1, 2, 3] }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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

    test('array', () => {
        expect(
            walkCst($array($string), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0002-000:symbolName}} = (string)[]
            ",
              "referenceName": "{{0002-000:symbolName}}",
            }
        `)
        expect(
            walkCst($array($enum(['foo', 'bar', { foo: 'bar' }])), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0004-000:symbolName}} = ('foo' | 'bar' | { foo: 'bar' })[]
            ",
              "referenceName": "{{0004-000:symbolName}}",
            }
        `)
        const locals = {}
        expect(
            walkCst($array($union([$string, $integer])), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals,
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0008-000:symbolName}} = (string | number)[]
            ",
              "referenceName": "{{0008-000:symbolName}}",
            }
        `)
        expect(locals).toMatchInlineSnapshot(`Object {}`)
    })

    test('tuple', () => {
        expect(
            walkCst($tuple([$string, $string, $integer]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0004-000:symbolName}} = [string, string, number]
            ",
              "referenceName": "{{0004-000:symbolName}}",
            }
        `)
    })

    test('named tuple', () => {
        expect(
            walkCst(
                $tuple({
                    foo: $string,
                    boo: $integer,
                }),

                typeDefinitionVisitor,
                { references: [], symbolName: 'Foo', locals: {} } as unknown as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0003-000:symbolName}} = [foo: string, boo: number]
            ",
              "referenceName": "{{0003-000:symbolName}}",
            }
        `)
        expect(
            walkCst(
                $tuple({
                    x: $number,
                    y: $number,
                    z: $number,
                }),

                typeDefinitionVisitor,
                { references: [], symbolName: 'Foo', locals: {} } as unknown as TypescriptWalkerContext
            )
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0007-000:symbolName}} = [x: number, y: number, z: number]
            ",
              "referenceName": "{{0007-000:symbolName}}",
            }
        `)
    })

    test('dict', () => {
        expect(
            walkCst($dict($string), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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

    test('ref', () => {
        const foo = $dict($string)
        expect(
            walkCst($ref(foo), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0003-000:symbolName}} = {{0002-000:referenceName}}
            ",
              "referenceName": "{{0003-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        // test the stable uuid referencing
        expect(
            walkCst($union([$ref(foo), $dict($ref(foo))]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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

    test('union', () => {
        expect(
            walkCst($union([$string]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0002-000:symbolName}} = string
            ",
              "referenceName": "{{0002-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
        expect(
            walkCst($union([$string, $string, $integer]), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
              "declaration": "type {{0006-000:symbolName}} = string | string | number
            ",
              "referenceName": "{{0006-000:symbolName}}",
              "render": [Function],
              "sourceSymbol": undefined,
            }
        `)
    })

    test('object', () => {
        expect(
            walkCst($object({ foo: $string }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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
            walkCst($object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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
            walkCst($object({ foo: $string, bar: $string({ description: 'fooscription' }) }), typeDefinitionVisitor, {
                references: [],
                symbolName: 'Foo',
                locals: {},
            } as unknown as TypescriptWalkerContext)
        ).toMatchInlineSnapshot(`
            Object {
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
            walkCst(
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
            Object {
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

    expect(
        walkCst($object({ foo: $string }, { indexSignature: $number }), typeDefinitionVisitor, {
            references: [],
            symbolName: 'Foo',
            locals: {},
        } as unknown as TypescriptWalkerContext)
    ).toMatchInlineSnapshot(`
        Object {
          "declaration": "interface {{undefined:symbolName}} {
            foo: string
            [k: string]: number
        }
        ",
          "referenceName": "{{undefined:symbolName}}",
          "render": [Function],
          "sourceSymbol": undefined,
        }
    `)
})

describe('toTypescriptDefinition', () => {
    // test('string', () => {
    //     expect(toTypescriptDefinition('foo', $string()).toMatchInlineSnapshot(`
    //         Object {
    //           "declaration": "export type Foo = string
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // test('number', () => {
    //     expect(toTypescriptDefinition('foo', $number())).toMatchInlineSnapshot(`
    //         Object {
    //           "declaration": "export type Foo = number
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // test('integer', () => {
    //     expect(toTypescriptDefinition('foo', $integer())).toMatchInlineSnapshot(`
    //         Object {
    //           "declaration": "export type Foo = number
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // test('boolean', () => {
    //     expect(toTypescriptDefinition('foo', $boolean())).toMatchInlineSnapshot(`
    //         Object {
    //           "declaration": "export type Foo = boolean
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // test('null', () => {
    //     expect(toTypescriptDefinition('foo', $null())).toMatchInlineSnapshot(`
    //         Object {
    //           "declaration": "export type Foo = null
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // test('unknown', () => {
    //     expect(toTypescriptDefinition('foo', $unknown())).toMatchInlineSnapshot(`
    //         Object {
    //           "declaration": "export type Foo = unknown
    //         ",
    //           "referenceName": "Foo",
    //         }
    //     `)
    // })

    // test('enum', () => {
    //     expect(
    //         toTypescriptDefinition('foo', $enum(['foo', 'bar', { foo: 'bar' }]), typeDefinitionVisitor, {
    //             references: [],
    //             symbolName: 'Foo',
    //         })
    //     ).toMatchInlineSnapshot(`
    //         Object {
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
    //         Object {
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
    //         Object {
    //           "declaration": "export const Foo = {
    //             foo: 'bar' as const,
    //             bar: [1, 2, 3] as const,
    //         }

    //         ",
    //           "referenceName": "keyof typeof Foo",
    //         }
    //     `)
    // })

    test('array', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $array($string) })).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export type {{0002-000:symbolName}} = (string)[]
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0002-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0002-000:symbolName}}",
                "uuid": "0002-000",
              },
              "subtrees": Array [],
            }
        `)
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $array($enum(['foo', 'bar', { foo: 'bar' }])) }))
            .toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export type {{0004-000:symbolName}} = ('foo' | 'bar' | { foo: 'bar' })[]
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0004-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0004-000:symbolName}}",
                "uuid": "0004-000",
              },
              "subtrees": Array [],
            }
        `)
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $array($union([$string, $integer])) }))
            .toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export type {{0008-000:symbolName}} = (string | number)[]
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0008-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0008-000:symbolName}}",
                "uuid": "0008-000",
              },
              "subtrees": Array [],
            }
        `)
    })

    test('tuple', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $tuple([$string, $string, $integer]) }))
            .toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export type {{0004-000:symbolName}} = [string, string, number]
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0004-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0004-000:symbolName}}",
                "uuid": "0004-000",
              },
              "subtrees": Array [],
            }
        `)
    })

    test('named tuple', () => {
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $tuple({
                    foo: $string,
                    boo: $integer,
                }),
            })
        ).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export type {{0003-000:symbolName}} = [foo: string, boo: number]
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0003-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0003-000:symbolName}}",
                "uuid": "0003-000",
              },
              "subtrees": Array [],
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
            Object {
              "definition": Object {
                "declaration": "export type {{0007-000:symbolName}} = [x: number, y: number, z: number]
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0007-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0007-000:symbolName}}",
                "uuid": "0007-000",
              },
              "subtrees": Array [],
            }
        `)
    })

    test('dict', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $dict($string) })).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export interface {{0002-000:symbolName}} {
                [k: string]: ( string ) | undefined
            }
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0002-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0002-000:symbolName}}",
                "uuid": "0002-000",
              },
              "subtrees": Array [],
            }
        `)
    })

    test('ref', () => {
        const foo = $dict($string)
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $object({ bar: $ref(foo) }) })).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export interface {{0004-000:symbolName}} {
                bar: {{0002-000:referenceName}}
            }
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0004-000:symbolName}}",
                "references": Array [
                  Object {
                    "exportSymbol": false,
                    "name": undefined,
                    "reference": Array [
                      Object {
                        "children": Array [
                          Object {
                            "description": Object {},
                            "type": "string",
                            "uuid": "0001-000",
                            "value": Object {},
                          },
                        ],
                        "description": Object {},
                        "type": "dict",
                        "uuid": "0002-000",
                        "value": Object {},
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
              "subtrees": Array [],
            }
        `)
        // expect(toTypescriptDefinition('foo', $ref({ foo }))).toMatchInlineSnapshot(`
        //     Object {
        //       "interface": Object {
        //         "declaration": "export type Foo = {{0001-000}}
        //     ",
        //         "interfaceName": "Foo",
        //         "meta": undefined,
        //         "referenceName": "Foo",
        //         "symbolName": "foo",
        //         "uuid": undefined,
        //       },
        //       "references": Array [
        //         Object {
        //           "hash": "0001-000",
        //           "name": "foo",
        //         },
        //       ],
        //     }
        // `)
        // // test the stable uuid referencing
        // expect(toTypescriptDefinition('foo', $union([$ref({ foo }), $dict($ref({ foo }))]))).toMatchInlineSnapshot(`
        //     Object {
        //       "interface": Object {
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
        //       "references": Array [
        //         Object {
        //           "hash": "0001-000",
        //           "name": "foo",
        //         },
        //       ],
        //     }
        // `)
    })

    // test('union', () => {
    //     expect(toTypescriptDefinition('foo', $union([$string]))).toMatchInlineSnapshot(`
    //         Object {
    //           "interface": Object {
    //             "declaration": "export type Foo = string
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": Array [],
    //         }
    //     `)
    //     expect(toTypescriptDefinition('foo', $union([$string, $string, $integer]))).toMatchInlineSnapshot(`
    //         Object {
    //           "interface": Object {
    //             "declaration": "export type Foo = string | string | number
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": Array [],
    //         }
    //     `)
    // })

    // test('intersection', () => {
    //     expect(toTypescriptDefinition('foo', $intersection([$string]))).toMatchInlineSnapshot(`
    //         Object {
    //           "interface": Object {
    //             "declaration": "export type Foo = (string)
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": Array [],
    //         }
    //     `)
    //     expect(toTypescriptDefinition('foo', $intersection([$string, $integer]))).toMatchInlineSnapshot(`
    //         Object {
    //           "interface": Object {
    //             "declaration": "export type Foo = (string & number)
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": Array [],
    //         }
    //     `)
    // })

    // test('union & intersection', () => {
    //     expect(toTypescriptDefinition('foo', $union([$string, $intersection([$string, $integer]), $integer])))
    //         .toMatchInlineSnapshot(`
    //         Object {
    //           "interface": Object {
    //             "declaration": "export type Foo = string | (string & number) | number
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "referenceName": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": Array [],
    //         }
    //     `)
    // })

    test('object', () => {
        expect(toTypescriptDefinition({ sourceSymbol: 'foo', schema: $object({ foo: $string }) })).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export interface {{0002-000:symbolName}} {
                foo: string
            }
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0002-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0002-000:symbolName}}",
                "uuid": "0002-000",
              },
              "subtrees": Array [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
            })
        ).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export interface {{0008-000:symbolName}} {
                foo: string
                bar: (number | null)
                baz?: number
            }
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{0008-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{0008-000:symbolName}}",
                "uuid": "0008-000",
              },
              "subtrees": Array [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
            })
        ).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export interface {{00011-000:symbolName}} {
                foo: string
                /**
                 * fooscription
                 */
                bar: string
            }
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{00011-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{00011-000:symbolName}}",
                "uuid": "00011-000",
              },
              "subtrees": Array [],
            }
        `)
        expect(
            toTypescriptDefinition({
                sourceSymbol: 'foo',
                schema: $object({ foo: $enum(['foo', 'bar']) }),
            })
        ).toMatchInlineSnapshot(`
            Object {
              "definition": Object {
                "declaration": "export interface {{00013-000:symbolName}} {
                foo: 'foo' | 'bar'
            }
            ",
                "imports": Array [],
                "isExported": true,
                "locals": Object {},
                "referenceName": "{{00013-000:symbolName}}",
                "references": Array [],
                "schema": [Function],
                "sourceSymbol": "foo",
                "symbolName": "Foo",
                "uniqueSymbolName": "{{00013-000:symbolName}}",
                "uuid": "00013-000",
              },
              "subtrees": Array [],
            }
        `)
    })
})

describe('getIndexSignatureType', () => {
    test('simple literal', () => {
        forAll(alphaNumericString({ minLength: 1 }), (a) =>
            expect(getIndexSignatureType(a)).toEqual({ type: `\`\${string}${a}\${string}\`` })
        )
    })

    test('simple union', () => {
        expect(getIndexSignatureType('foo|bar')).toMatchInlineSnapshot(`
            Object {
              "type": "\`\${string}foo | bar\${string}\`",
            }
        `)
    })

    test('simple union with start string', () => {
        expect(getIndexSignatureType('^(foo|bar)')).toMatchInlineSnapshot(`
            Object {
              "type": "\`foo | bar\${string}\`",
            }
        `)
    })

    test('complicated pattern', () => {
        expect(getIndexSignatureType('^[1-5](?:\\d{2}|XX)$')).toMatchInlineSnapshot(`
            Object {
              "type": "string",
            }
        `)
    })

    test('complicated pattern 2', () => {
        expect(getIndexSignatureType('^\\/')).toMatchInlineSnapshot(`
            Object {
              "type": "\`/\${string}\`",
            }
        `)
    })

    test('simple start pattern', () => {
        expect(getIndexSignatureType('^x-')).toMatchInlineSnapshot(`
            Object {
              "type": "\`x-\${string}\`",
            }
        `)
    })
})
