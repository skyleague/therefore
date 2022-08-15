import { $dict } from './dict'

import { $string } from '../string'

test('function', () => {
    expect($dict).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($dict($string)).toMatchInlineSnapshot(`
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
        }
    `)
})

test('example', () => {
    expect($dict($string, { examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
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
              Object {
                "foo": "bar",
              },
            ],
          },
          "type": "dict",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $dict({}, { examples: ['foo'] })
})

test('default', () => {
    expect($dict($string, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
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
            "default": Object {
              "foo": "bar",
            },
          },
          "type": "dict",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $dict({}, { default: 'foobar' })
})
