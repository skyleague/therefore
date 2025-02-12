import { alphaNumeric, forAll, pick } from '@skyleague/axioms'
import { describe, expect, it } from 'vitest'
import { mockTypescriptContext } from '../../../../test/context.js'
import { TypescriptFileOutput } from '../../../commands/generate/output/typescript.js'
import { $array } from '../../primitives/array/array.js'
import { $boolean } from '../../primitives/boolean/boolean.js'
import { $enum } from '../../primitives/enum/enum.js'
import { $integer } from '../../primitives/integer/integer.js'
import { $intersection } from '../../primitives/intersection/intersection.js'
import { $null } from '../../primitives/null/null.js'
import { $nullable } from '../../primitives/nullable/nullable.js'
import { $number } from '../../primitives/number/number.js'
import { $object } from '../../primitives/object/object.js'
import { $optional } from '../../primitives/optional/optional.js'
import { $record } from '../../primitives/record/record.js'
import { $ref } from '../../primitives/ref/ref.js'
import { $string } from '../../primitives/string/string.js'
import { $tuple } from '../../primitives/tuple/tuple.js'
import { $union } from '../../primitives/union/union.js'
import { $unknown } from '../../primitives/unknown/unknown.js'
import { getIndexSignatureType, optional, readonly } from './typescript-type.js'

describe('optional', () => {
    it('explicit', () => {
        expect(optional($integer())).toMatchInlineSnapshot(`""`)
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
        const ctx = mockTypescriptContext()
        expect(ctx.render($string())).toEqual('string')

        expect(ctx.render($optional($string()))).toEqual('(string | undefined)')
        expect(ctx.render($nullable($string()))).toEqual('(string | null)')
        expect(ctx.render($optional($nullable($string())))).toEqual('(string | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('number', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($number())).toEqual('number')

        expect(ctx.render($optional($number()))).toEqual('(number | undefined)')
        expect(ctx.render($nullable($number()))).toEqual('(number | null)')
        expect(ctx.render($optional($nullable($number())))).toEqual('(number | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('integer', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($integer())).toEqual('number')

        expect(ctx.render($optional($integer()))).toEqual('(number | undefined)')
        expect(ctx.render($nullable($integer()))).toEqual('(number | null)')
        expect(ctx.render($optional($nullable($integer())))).toEqual('(number | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('boolean', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($boolean())).toEqual('boolean')

        expect(ctx.render($optional($boolean()))).toEqual('(boolean | undefined)')
        expect(ctx.render($nullable($boolean()))).toEqual('(boolean | null)')
        expect(ctx.render($optional($nullable($boolean())))).toEqual('(boolean | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('null', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($null())).toEqual('null')

        expect(ctx.render($optional($null()))).toEqual('(null | undefined)')
        expect(ctx.render($nullable($null()))).toEqual('null')
        expect(ctx.render($optional($nullable($null())))).toEqual('(null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('unknown', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($unknown())).toEqual('unknown')

        expect(ctx.render($optional($unknown()))).toEqual('unknown')
        expect(ctx.render($nullable($unknown()))).toEqual('unknown')
        expect(ctx.render($optional($nullable($unknown())))).toEqual('unknown')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('enum', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($enum(['foo', 'bar']))).toEqual("'foo' | 'bar'")

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('enum - optional', () => {
        const ctx = mockTypescriptContext()

        expect(ctx.render($optional($enum(['foo', 'bar'])))).toEqual("('foo' | 'bar' | undefined)")
        expect(ctx.render($nullable($enum(['foo', 'bar'])))).toEqual("('foo' | 'bar' | null)")
        expect(ctx.render($optional($nullable($enum(['foo', 'bar']))))).toEqual("('foo' | 'bar' | null | undefined)")

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('enum - named', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($enum({ foo: 'foo', bar: 'bar' }))).toEqual("'foo' | 'bar'")

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('array', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($array($string))).toEqual('(string)[]')
        expect(ctx.render($array($enum(['foo', 'bar'])))).toEqual("('foo' | 'bar')[]")
        expect(ctx.render($array($union([$string, $integer])))).toEqual('((string | number))[]')

        expect(ctx.render($optional($array($string)))).toEqual('((string)[] | undefined)')
        expect(ctx.render($nullable($array($string)))).toEqual('((string)[] | null)')
        expect(ctx.render($optional($nullable($array($string))))).toEqual('((string)[] | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('tuple', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($tuple([$string, $string, $integer]))).toEqual('[string, string, number]')

        expect(ctx.render($optional($tuple([$string])))).toEqual('([string] | undefined)')
        expect(ctx.render($nullable($tuple([$string])))).toEqual('([string] | null)')
        expect(ctx.render($optional($nullable($tuple([$string]))))).toEqual('([string] | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('tuple - variadic', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($tuple([$string, $string, $integer]).rest($string))).toEqual('[string, string, number, ...string]')

        expect(ctx.render($tuple([$string]).rest($integer).optional())).toEqual('([string, ...number] | undefined)')
        expect(ctx.render($tuple([$string]).rest($integer).nullable())).toEqual('([string, ...number] | null)')
        expect(ctx.render($tuple([$string]).rest($integer).optional().nullable())).toEqual(
            '([string, ...number] | null | undefined)',
        )

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('record', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($record($string))).toMatchInlineSnapshot(`
          "{
              [k: string]: (string | undefined)
          }"
        `)

        expect(ctx.render($optional($record($string)))).toMatchInlineSnapshot(`
          "({
              [k: string]: (string | undefined)
          } | undefined)"
        `)
        expect(ctx.render($nullable($record($string)))).toMatchInlineSnapshot(`
          "({
              [k: string]: (string | undefined)
          } | null)"
        `)
        expect(ctx.render($optional($nullable($record($string))))).toMatchInlineSnapshot(`
          "({
              [k: string]: (string | undefined)
          } | null | undefined)"
        `)

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('ref', () => {
        let ctx = mockTypescriptContext()
        const foo = $record($string)
        expect(ctx.render($ref(foo))).toEqual('{{2:type:reference}}')

        expect(ctx.render($optional($ref(foo)))).toEqual('({{2:type:reference}} | undefined)')
        expect(ctx.render($nullable($ref(foo)))).toEqual('({{2:type:reference}} | null)')
        expect(ctx.render($optional($nullable($ref(foo))))).toEqual('({{2:type:reference}} | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [
              [
                RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                [Function],
              ],
            ],
            "references": TypescriptReferences {
              "_data": {
                "2:type:name": [Function],
                "2:type:reference": [Function],
                "2:type:source": [Function],
              },
              "hardlinks": {},
              "key2node": Map {
                "2:type:reference" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                "2:type:name" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                "2:type:source" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "references": Map {
                "2" => Set {
                  "type:reference",
                  "type:name",
                  "type:source",
                },
              },
              "symbols": Map {
                "2" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "transformers": {},
            },
          }
        `)
        ctx = mockTypescriptContext()
        // test the stable uuid referencing
        expect(ctx.render($union([$ref(foo), $record($ref(foo))]))).toMatchInlineSnapshot(`
          "({{2:type:reference}} | {
              [k: string]: ({{2:type:reference}} | undefined)
          })"
        `)
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [
              [
                RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                [Function],
              ],
            ],
            "references": TypescriptReferences {
              "_data": {
                "2:type:name": [Function],
                "2:type:reference": [Function],
                "2:type:source": [Function],
              },
              "hardlinks": {},
              "key2node": Map {
                "2:type:reference" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                "2:type:name" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                "2:type:source" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "references": Map {
                "2" => Set {
                  "type:reference",
                  "type:name",
                  "type:source",
                },
              },
              "symbols": Map {
                "2" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "transformers": {},
            },
          }
        `)
    })

    it('ref - named', () => {
        const ctx = mockTypescriptContext()
        const foo = $record($string)
        foo._name = 'foo-bar'
        expect(ctx.render($ref(foo))).toEqual('{{2:type:reference}}')
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [
              [
                RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_name": "foo-bar",
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                [Function],
              ],
            ],
            "references": TypescriptReferences {
              "_data": {
                "2:type:name": [Function],
                "2:type:reference": [Function],
                "2:type:source": [Function],
              },
              "hardlinks": {},
              "key2node": Map {
                "2:type:reference" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_name": "foo-bar",
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                "2:type:name" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_name": "foo-bar",
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
                "2:type:source" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_name": "foo-bar",
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "references": Map {
                "2" => Set {
                  "type:reference",
                  "type:name",
                  "type:source",
                },
              },
              "symbols": Map {
                "2" => RecordType {
                  "_attributes": {
                    "generic": {},
                    "isGenerated": true,
                    "typescript": {},
                    "validator": undefined,
                    "validatorType": undefined,
                  },
                  "_children": [
                    StringType {
                      "_attributes": {
                        "generic": {},
                        "isGenerated": true,
                        "typescript": {},
                        "validator": undefined,
                        "validatorType": undefined,
                      },
                      "_definition": {},
                      "_guessedTrace": undefined,
                      "_id": "1",
                      "_isCommutative": true,
                      "_options": {},
                      "_origin": {},
                      "_recurrentCache": undefined,
                      "_type": "string",
                    },
                  ],
                  "_definition": {},
                  "_guessedTrace": undefined,
                  "_id": "2",
                  "_isCommutative": false,
                  "_name": "foo-bar",
                  "_options": {},
                  "_origin": {},
                  "_recurrentCache": undefined,
                  "_type": "object",
                  "element": StringType {
                    "_attributes": {
                      "generic": {},
                      "isGenerated": true,
                      "typescript": {},
                      "validator": undefined,
                      "validatorType": undefined,
                    },
                    "_definition": {},
                    "_guessedTrace": undefined,
                    "_id": "1",
                    "_isCommutative": true,
                    "_options": {},
                    "_origin": {},
                    "_recurrentCache": undefined,
                    "_type": "string",
                  },
                  "shape": {},
                },
              },
              "transformers": {},
            },
          }
        `)
    })

    it('union', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($union([$string]))).toEqual('(string)')
        expect(ctx.render($union([$string, $string, $integer]))).toEqual('(string | string | number)')

        expect(ctx.render($optional($union([$string])))).toEqual('((string) | undefined)')
        expect(ctx.render($nullable($union([$string])))).toEqual('((string) | null)')
        expect(ctx.render($optional($nullable($union([$string]))))).toEqual('((string) | null | undefined)')

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('intersection', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($intersection([$object({ foo: $string })]))).toMatchInlineSnapshot(`
          "({
              foo: string
          })"
        `)
        expect(ctx.render($intersection([$object({ foo: $string }), $object({ bar: $string })]))).toMatchInlineSnapshot(`
          "({
              foo: string
          } & {
              bar: string
          })"
        `)

        expect(ctx.render($optional($intersection([$object({ foo: $string })])))).toMatchInlineSnapshot(`
          "(({
              foo: string
          }) | undefined)"
        `)
        expect(ctx.render($nullable($intersection([$object({ foo: $string })])))).toMatchInlineSnapshot(`
          "(({
              foo: string
          }) | null)"
        `)
        expect(ctx.render($optional($nullable($intersection([$object({ foo: $string })]))))).toMatchInlineSnapshot(`
          "(({
              foo: string
          }) | null | undefined)"
        `)

        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('object', () => {
        const ctx = mockTypescriptContext()
        expect(ctx.render($object({ foo: $string }))).toMatchInlineSnapshot(`
            "{
                foo: string
            }"
        `)
        expect(ctx.render($object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }))).toMatchInlineSnapshot(`
          "{
              foo: string
              bar: (number | null)
              baz?: (number | undefined)
          }"
        `)
        expect(ctx.render($object({ foo: $string, bar: $string({ description: 'fooscription' }) }))).toMatchInlineSnapshot(`
          "{
              foo: string
              /**
               * fooscription
               */
              bar: string
          }"
        `)
        expect(
            ctx.render($object({ foo: $string, bar: $string({ description: 'fooscription', readonly: true }) })),
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
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })
})

describe('toTypeDefinition', () => {
    it('string', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $string(), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = string"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('number', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $number(), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = number"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('integer', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $integer(), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = number"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('boolean', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $boolean(), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = boolean"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('null', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $null(), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = null"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('unknown', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $unknown(), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = unknown"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('enum', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $enum(['foo', 'bar']), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = 'foo' | 'bar'"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('enum - record', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $enum({ foo: 'bar' }), context: ctx })).toMatchInlineSnapshot(`
          "const {{1:value:name}} = {
              foo: 'bar',
          } as const
          type {{1:value:name}} = typeof {{1:value:name}}

          "
        `)
        expect(TypescriptFileOutput.define({ symbol: $enum({ foo: 'bar' }), context: ctx })).toMatchInlineSnapshot(`
          "const {{2:value:name}} = {
              foo: 'bar',
          } as const
          type {{2:value:name}} = typeof {{2:value:name}}

          "
        `)
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('array', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $array($string), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = (string)[]"`,
        )
        expect(TypescriptFileOutput.define({ symbol: $array($enum(['foo', 'bar'])), context: ctx })).toMatchInlineSnapshot(
            `"type {{4:type:name}} = ('foo' | 'bar')[]"`,
        )
        expect(TypescriptFileOutput.define({ symbol: $array($union([$string, $integer])), context: ctx })).toMatchInlineSnapshot(
            `"type {{8:type:name}} = ((string | number))[]"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('tuple', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $tuple([$string, $string, $integer]), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = [string, string, number]"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('record', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $record($string), context: ctx })).toMatchInlineSnapshot(`
          "interface {{2:type:name}} {
              [k: string]: (string | undefined)
          }"
        `)
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('ref', () => {
        const ctx = mockTypescriptContext()
        const foo = $record($string)
        expect(TypescriptFileOutput.define({ symbol: $ref(foo), context: ctx })).toMatchInlineSnapshot(
            `
          "type {{3:type:name}} = {{2:type:reference}}
          interface {{2:type:name}} {
              [k: string]: (string | undefined)
          }"
        `,
        )
        // test the stable uuid referencing
        expect(
            TypescriptFileOutput.define({ symbol: $union([$ref(foo), $record($ref(foo))]), context: ctx }),
        ).toMatchInlineSnapshot(`
          "type {{8:type:name}} = ({{2:type:reference}} | {
              [k: string]: ({{2:type:reference}} | undefined)
          })
          interface {{2:type:name}} {
              [k: string]: (string | undefined)
          }"
        `)
    })

    it('union', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $union([$string]), context: ctx })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = (string)"`,
        )
        expect(TypescriptFileOutput.define({ symbol: $union([$string, $string, $integer]), context: ctx })).toMatchInlineSnapshot(
            `"type {{3:type:name}} = (string | string | number)"`,
        )
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('intersection', () => {
        const ctx = mockTypescriptContext()
        expect(
            TypescriptFileOutput.define({
                symbol: $intersection([$object({ foo: $string }), $object({ bar: $string })]),
                context: ctx,
            }),
        ).toMatchInlineSnapshot(`
          "type {{5:type:name}} = ({
              foo: string
          } & {
              bar: string
          })"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $intersection([$object({ foo: $string }), $object({ bar: $string })]),
                context: ctx,
            }),
        ).toMatchInlineSnapshot(`
          "type {{10:type:name}} = ({
              foo: string
          } & {
              bar: string
          })"
        `)
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('object', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $object({ foo: $string }), context: ctx })).toMatchInlineSnapshot(`
          "interface {{1:type:name}} {
              foo: string
          }"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
                context: ctx,
            }),
        ).toMatchInlineSnapshot(`
          "interface {{7:type:name}} {
              foo: string
              bar: (number | null)
              baz?: (number | undefined)
          }"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
                context: ctx,
            }),
        ).toMatchInlineSnapshot(`
          "interface {{10:type:name}} {
              foo: string
              /**
               * fooscription
               */
              bar: string
          }"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $object(
                    {
                        foo: $string,
                        bar: $string({ description: 'fooscription' }),
                    },

                    { default: { foo: 'bar', bar: 'foo' } },
                ),
                context: ctx,
            }),
        ).toMatchInlineSnapshot(`
          "/**
           * @default { foo: 'bar', bar: 'foo' }
           */
          interface {{13:type:name}} {
              foo: string
              /**
               * fooscription
               */
              bar: string
          }"
        `)
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })

    it('other', () => {
        const ctx = mockTypescriptContext()
        expect(TypescriptFileOutput.define({ symbol: $object({ foo: $string }), context: ctx })).toMatchInlineSnapshot(`
          "interface {{1:type:name}} {
              foo: string
          }"
        `)
        expect(pick(ctx, ['locals', 'references'])).toMatchInlineSnapshot(`
          {
            "locals": [],
            "references": TypescriptReferences {
              "_data": {},
              "hardlinks": {},
              "key2node": Map {},
              "references": Map {},
              "symbols": Map {},
              "transformers": {},
            },
          }
        `)
    })
})

describe('TypescriptFileOutput.define', () => {
    // it('string', () => {
    //     expect(TypescriptFileOutput.define('foo', $string()).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = string
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    // })

    // it('number', () => {
    //     expect(TypescriptFileOutput.define('foo', $number())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = number
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    // })

    // it('integer', () => {
    //     expect(TypescriptFileOutput.define('foo', $integer())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = number
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    // })

    // it('boolean', () => {
    //     expect(TypescriptFileOutput.define('foo', $boolean())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = boolean
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    // })

    // it('null', () => {
    //     expect(TypescriptFileOutput.define('foo', $null())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = null
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    // })

    // it('unknown', () => {
    //     expect(TypescriptFileOutput.define('foo', $unknown())).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = unknown
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    // })

    // it('enum', () => {
    //     expect(
    //         TypescriptFileOutput.define('foo', $enum(['foo', 'bar', { foo: 'bar' }]), typeDefinitionVisitor, {
    //             references: [],
    //             symbolName: 'Foo',
    //         })
    //     ).toMatchInlineSnapshot(`
    //         {
    //           "declaration": "export type Foo = 'foo' | 'bar' | { foo: 'bar' }
    //         ",
    //           "type:reference": "Foo",
    //         }
    //     `)
    //     expect(
    //         TypescriptFileOutput.define('foo', $enum({ foo: 'bar', bar: 1, baz: true }), typeDefinitionVisitor, {
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
    //           "type:reference": "Foo",
    //         }
    //     `)
    //     expect(
    //         TypescriptFileOutput.define('foo', $enum({ foo: 'bar', bar: [1, 2, 3] }), typeDefinitionVisitor, {
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
    //           "type:reference": "keyof typeof Foo",
    //         }
    //     `)
    // })

    it('array', () => {
        expect(TypescriptFileOutput.define({ symbol: $array($string) })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = (string)[]"`,
        )
        expect(TypescriptFileOutput.define({ symbol: $array($enum(['foo', 'bar'])) })).toMatchInlineSnapshot(
            `"type {{4:type:name}} = ('foo' | 'bar')[]"`,
        )
        expect(TypescriptFileOutput.define({ symbol: $array($union([$string, $integer])) })).toMatchInlineSnapshot(
            `"type {{8:type:name}} = ((string | number))[]"`,
        )
    })

    it('tuple', () => {
        expect(TypescriptFileOutput.define({ symbol: $tuple([$string, $string, $integer]) })).toMatchInlineSnapshot(
            `"type {{1:type:name}} = [string, string, number]"`,
        )
    })

    it('record', () => {
        expect(TypescriptFileOutput.define({ symbol: $record($string) })).toMatchInlineSnapshot(`
          "interface {{2:type:name}} {
              [k: string]: (string | undefined)
          }"
        `)
    })

    it('ref', () => {
        const foo = $record($string)
        expect(TypescriptFileOutput.define({ symbol: $object({ bar: $ref(foo) }) })).toMatchInlineSnapshot(`
          "interface {{4:type:name}} {
              bar: {{2:type:reference}}
          }
          interface {{2:type:name}} {
              [k: string]: (string | undefined)
          }"
        `)
        // expect(TypescriptFileOutput.define('foo', $ref({ foo }))).toMatchInlineSnapshot(`
        //     {
        //       "definition": {
        //         "declaration": "export type {{0002-000:symbolName}} = {
        //         [k: string]: (string) | undefined
        //     }
        //     ",
        //         "imports": [],
        //         "isExported": true,
        //         "locals": {},
        //         "type:reference": "{{0002-000:symbolName}}",
        //         "references": [],
        //         "schema": {
        //           "children": [
        //             {
        //               "type": "string",
        //               "uuid": "0001-000",
        //               "value": {},
        //             },
        //           ],
        //           "isContainer": true,
        //           "type": "dict",
        //           "uuid": "0002-000",
        //           "value": {},
        //         },
        //         "sourceSymbol": "foo",
        //         "symbolName": "Foo",
        //         "uniqueSymbolName": "{{0002-000:symbolName}}",
        //         "uuid": "0002-000",
        //       },
        //       "subtrees": [],
        //     }
        //   `)
        // // test the stable uuid referencing
        // expect(TypescriptFileOutput.define('foo', $union([$ref({ foo }), $record($ref({ foo }))]))).toMatchInlineSnapshot(`
        //     {
        //       "interface": {
        //         "declaration": "export type Foo = {{0001-000}} | {
        //         [k: string]: ( {{0001-000}} ) | undefined
        //     }
        //     ",
        //         "interfaceName": "Foo",
        //         "meta": undefined,
        //         "type:reference": "Foo",
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
    //     expect(TypescriptFileOutput.define('foo', $union([$string]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = string
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "type:reference": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    //     expect(TypescriptFileOutput.define('foo', $union([$string, $string, $integer]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = string | string | number
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "type:reference": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    // })

    // it('intersection', () => {
    //     expect(TypescriptFileOutput.define('foo', $intersection([$string]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = (string)
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "type:reference": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    //     expect(TypescriptFileOutput.define('foo', $intersection([$string, $integer]))).toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = (string & number)
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "type:reference": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    // })

    // it('union & intersection', () => {
    //     expect(TypescriptFileOutput.define('foo', $union([$string, $intersection([$string, $integer]), $integer])))
    //         .toMatchInlineSnapshot(`
    //         {
    //           "interface": {
    //             "declaration": "export type Foo = string | (string & number) | number
    //         ",
    //             "interfaceName": "Foo",
    //             "meta": undefined,
    //             "type:reference": "Foo",
    //             "symbolName": "foo",
    //             "uuid": undefined,
    //           },
    //           "references": [],
    //         }
    //     `)
    // })

    it('object', () => {
        expect(TypescriptFileOutput.define({ symbol: $object({ foo: $string }) })).toMatchInlineSnapshot(`
          "interface {{1:type:name}} {
              foo: string
          }"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $object({ foo: $string, bar: $nullable($integer), baz: $optional($integer) }),
            }),
        ).toMatchInlineSnapshot(`
          "interface {{7:type:name}} {
              foo: string
              bar: (number | null)
              baz?: (number | undefined)
          }"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $object({ foo: $string, bar: $string({ description: 'fooscription' }) }),
            }),
        ).toMatchInlineSnapshot(`
          "interface {{10:type:name}} {
              foo: string
              /**
               * fooscription
               */
              bar: string
          }"
        `)
        expect(
            TypescriptFileOutput.define({
                symbol: $object({ foo: $enum(['foo', 'bar']) }),
            }),
        ).toMatchInlineSnapshot(`
          "interface {{13:type:name}} {
              foo: 'foo' | 'bar'
          }"
        `)
    })
})

describe('getIndexSignatureType', () => {
    it('simple literal', () => {
        forAll(alphaNumeric({ minLength: 1 }), (a) => {
            const type = `\`\${string}${a}\${string}\``
            expect(getIndexSignatureType(a)).toEqual({ type })
        })
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
