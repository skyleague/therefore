import { equal, forAll, json, string, tuple } from '@skyleague/axioms'
import { describe, expect, it } from 'vitest'
import { objectProperty, toLiteral } from './literal.js'

describe('objectProperty', () => {
    it('dot', () => {
        expect(objectProperty('foo.bar')).toMatchInlineSnapshot(`"'foo.bar'"`)
    })
    it('dash', () => {
        expect(objectProperty('foo-bar')).toMatchInlineSnapshot(`"'foo-bar'"`)
    })
})

describe('toLiteral', () => {
    it('object', () => {
        expect(toLiteral({})).toMatchInlineSnapshot(`"{  }"`)
        expect(toLiteral({ foo: 'bar', baz: { boo: 1 }, boo: [123] })).toMatchInlineSnapshot(
            `"{ foo: 'bar', baz: { boo: 1 }, boo: [123] }"`,
        )
    })

    it('array', () => {
        expect(toLiteral([])).toMatchInlineSnapshot(`"[]"`)
        expect(toLiteral([1, 2, 3])).toMatchInlineSnapshot(`"[1, 2, 3]"`)
        expect(toLiteral([1, 'foo', { foo: 'bar' }])).toMatchInlineSnapshot(`"[1, 'foo', { foo: 'bar' }]"`)
    })

    it('number', () => {
        expect(toLiteral(1)).toMatchInlineSnapshot(`"1"`)
        expect(toLiteral(3.14)).toMatchInlineSnapshot(`"3.14"`)
    })

    it('bigint', () => {
        expect(toLiteral(1n)).toMatchInlineSnapshot(`"1"`)
    })

    it('string', () => {
        expect(toLiteral('foo')).toMatchInlineSnapshot(`"'foo'"`)
    })

    it('boolean', () => {
        expect(toLiteral(true)).toMatchInlineSnapshot(`"true"`)
        expect(toLiteral(false)).toMatchInlineSnapshot(`"false"`)
    })

    it('undefined', () => {
        expect(toLiteral(undefined)).toMatchInlineSnapshot(`"undefined"`)
    })

    it('null', () => {
        expect(toLiteral(null)).toMatchInlineSnapshot(`"null"`)
    })

    it('other', () => {
        expect(() => toLiteral(Symbol())).toThrowErrorMatchingInlineSnapshot('[Error: not supported]')
        expect(() => toLiteral(() => 1)).toThrowErrorMatchingInlineSnapshot('[Error: not supported]')
    })

    it('json literals', () => {
        // biome-ignore lint/security/noGlobalEval: it's a test, we're okay with eval here
        forAll(json(), (x) => equal(eval(`(${toLiteral(x)})`), x))
    })

    it('string literals', () => {
        // biome-ignore lint/security/noGlobalEval: it's a test, we're okay with eval here
        forAll(tuple(string(), string()), ([key, value]) => equal(eval(`(${toLiteral({ [key]: value })})`), { [key]: value }))
    })
})
