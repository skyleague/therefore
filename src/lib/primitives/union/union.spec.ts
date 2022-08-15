import { $union } from '.'

import { $string } from '..'

test('function', () => {
    expect($union).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($union([$string])).toMatchInlineSnapshot(`
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
          "type": "union",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('example', () => {
    expect($union([$string], { examples: ['bar'] })).toMatchInlineSnapshot(`
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
              "bar",
            ],
          },
          "type": "union",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('default', () => {
    expect($union([$string], { default: ['bar'] })).toMatchInlineSnapshot(`
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
          "type": "union",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})
