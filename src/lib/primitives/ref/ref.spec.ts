import { $ref } from './ref'

import { $array } from '../array'
import { $dict } from '../dict'
import { $string } from '../string'
import { $union } from '../union'

const foo = $dict($string)
test('function', () => {
    expect($ref).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($ref(foo)).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "description": Object {},
                  "type": "string",
                  "value": Object {},
                },
              ],
              "description": Object {},
              "type": "dict",
              "value": Object {},
            },
          ],
          "description": Object {},
          "type": "ref",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
})

test('self reference', () => {
    const json = $union([$string, $array($ref(() => json)), $ref(() => json)])
    expect(json).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "description": Object {},
              "type": "string",
              "uuid": "0004-000",
              "value": Object {},
            },
            Object {
              "children": Array [
                Object {
                  "children": Array [
                    [Function],
                  ],
                  "description": Object {},
                  "type": "ref",
                  "uuid": "0001-000",
                  "value": Object {},
                },
              ],
              "description": Object {},
              "type": "array",
              "uuid": "0002-000",
              "value": Object {},
            },
            Object {
              "children": Array [
                [Function],
              ],
              "description": Object {},
              "type": "ref",
              "uuid": "0003-000",
              "value": Object {},
            },
          ],
          "description": Object {},
          "type": "union",
          "uuid": "0005-000",
          "value": Object {},
        }
    `)
})

test('uuid reference', () => {
    const value = $string()
    const json = $ref(value)
    expect(json).toMatchInlineSnapshot(`
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
          "type": "ref",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('description ', () => {
    const json = $union([$string, $array($ref({ description: 'foo array', reference: ['json', () => json] }))])
    expect(json).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "description": Object {},
              "type": "string",
              "uuid": "0003-000",
              "value": Object {},
            },
            Object {
              "children": Array [
                Object {
                  "children": Array [
                    [Function],
                  ],
                  "description": Object {
                    "description": "foo array",
                  },
                  "name": "json",
                  "type": "ref",
                  "uuid": "0001-000",
                  "value": Object {},
                },
              ],
              "description": Object {},
              "type": "array",
              "uuid": "0002-000",
              "value": Object {},
            },
          ],
          "description": Object {},
          "type": "union",
          "uuid": "0004-000",
          "value": Object {},
        }
    `)
})
