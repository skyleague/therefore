import { $tuple } from './tuple.js'

import { $string } from '../index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($tuple).toMatchInlineSnapshot(`[Function]`)
})

it('expand', () => {
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

it('example', () => {
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

it('default', () => {
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
