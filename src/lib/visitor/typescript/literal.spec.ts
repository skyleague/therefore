import { objectProperty, toLiteral } from './literal'

import { forAll, json, equal, string, tuple } from '@skyleague/axioms'

describe('objectProperty', () => {
    test('', () => {
        expect(objectProperty('foo.bar')).toMatchInlineSnapshot(`"['foo.bar']"`)
    })
})

describe('toLiteral', () => {
    test('object', () => {
        expect(toLiteral({})).toMatchInlineSnapshot(`"{  }"`)
        expect(toLiteral({ foo: 'bar', baz: { boo: 1 }, boo: [123] })).toMatchInlineSnapshot(
            `"{ foo: 'bar', baz: { boo: 1 }, boo: [123] }"`
        )
    })

    test('array', () => {
        expect(toLiteral([])).toMatchInlineSnapshot(`"[]"`)
        expect(toLiteral([1, 2, 3])).toMatchInlineSnapshot(`"[1, 2, 3]"`)
        expect(toLiteral([1, 'foo', { foo: 'bar' }])).toMatchInlineSnapshot(`"[1, 'foo', { foo: 'bar' }]"`)
    })

    test('number', () => {
        expect(toLiteral(1)).toMatchInlineSnapshot(`"1"`)
        expect(toLiteral(3.14)).toMatchInlineSnapshot(`"3.14"`)
    })

    test('bigint', () => {
        expect(toLiteral(1n)).toMatchInlineSnapshot(`"1"`)
    })

    test('string', () => {
        expect(toLiteral('foo')).toMatchInlineSnapshot(`"'foo'"`)
    })

    test('boolean', () => {
        expect(toLiteral(true)).toMatchInlineSnapshot(`"true"`)
        expect(toLiteral(false)).toMatchInlineSnapshot(`"false"`)
    })

    test('undefined', () => {
        expect(toLiteral(undefined)).toMatchInlineSnapshot(`"null"`)
    })

    test('null', () => {
        expect(toLiteral(null)).toMatchInlineSnapshot(`"null"`)
    })

    test('other', () => {
        expect(() => toLiteral(Symbol())).toThrowErrorMatchingInlineSnapshot(`"not supported"`)
        expect(() => toLiteral(() => 1)).toThrowErrorMatchingInlineSnapshot(`"not supported"`)
    })

    test('json literals', () => {
        forAll(json(), (x) => equal(eval(`(${toLiteral(x)})`), x))
    })

    test('string literals', () => {
        forAll(tuple(string(), string()), ([key, value]) => equal(eval(`(${toLiteral({ [key]: value })})`), { [key]: value }))
    })
})
