import { $array } from '.'

import { $boolean, $string } from '..'

test('simple', () => {
    expect($array($boolean())).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "description": Object {},
              "type": "boolean",
              "uuid": "0001-000",
              "value": Object {},
            },
          ],
          "description": Object {},
          "type": "array",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('simple unexpanded', () => {
    expect($array($boolean)).toMatchInlineSnapshot(`
        Object {
          "children": Array [
            Object {
              "description": Object {},
              "type": "boolean",
              "uuid": "0001-000",
              "value": Object {},
            },
          ],
          "description": Object {},
          "type": "array",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('expand', () => {
    expect($array($string)).toMatchInlineSnapshot(`
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
          "type": "array",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('example', () => {
    expect($array($string, { examples: [['bar']] })).toMatchInlineSnapshot(`
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
          "type": "array",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $array({}, { examples: ['foo'] })
})

test('default', () => {
    expect($array($string, { default: ['bar'] })).toMatchInlineSnapshot(`
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
          "type": "array",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $array({}, { default: 'foobar' })
})
