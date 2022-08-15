import { $tuple } from './tuple'

import { $string } from '..'

test('function', () => {
    expect($tuple).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($tuple([$string])).toMatchInlineSnapshot(`
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
          "type": "tuple",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('example', () => {
    expect($tuple([$string], { examples: [['bar']] })).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "description": Object {},
              "type": "string",
              "uuid": "0001-000",
              "value": Object {},
            },
          ],
          "description": Object {
            "examples": Array [
              Array [
                "bar",
              ],
            ],
          },
          "type": "tuple",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)

    // @-ts-expect-error
    $tuple({}, { examples: ['foo'] })
})

test('default', () => {
    expect($tuple([$string], { default: ['bar'] })).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "description": Object {},
              "type": "string",
              "uuid": "0001-000",
              "value": Object {},
            },
          ],
          "description": Object {
            "default": Array [
              "bar",
            ],
          },
          "type": "tuple",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)

    // @-ts-expect-error
    $tuple({}, { default: 'foobar' })
})
