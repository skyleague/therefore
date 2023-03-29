import { $tuple } from './tuple.js'

import { $string } from '../index.js'

test('function', () => {
    expect($tuple).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($tuple([$string])).toMatchInlineSnapshot(`
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
          "type": "tuple",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('example', () => {
    expect($tuple([$string], { examples: [['bar']] })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "string",
              "uuid": "0001-000",
              "value": {},
            },
          ],
          "description": {
            "examples": [
              [
                "bar",
              ],
            ],
          },
          "type": "tuple",
          "uuid": "0002-000",
          "value": {},
        }
    `)

    // @-ts-expect-error
    $tuple({}, { examples: ['foo'] })
})

test('default', () => {
    expect($tuple([$string], { default: ['bar'] })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "string",
              "uuid": "0001-000",
              "value": {},
            },
          ],
          "description": {
            "default": [
              "bar",
            ],
          },
          "type": "tuple",
          "uuid": "0002-000",
          "value": {},
        }
    `)

    // @-ts-expect-error
    $tuple({}, { default: 'foobar' })
})
