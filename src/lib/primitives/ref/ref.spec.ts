import { $ref } from './ref.js'

import { $array } from '../array/index.js'
import { $dict } from '../dict/index.js'
import { $string } from '../string/index.js'
import { $union } from '../union/index.js'

import { expect, it } from 'vitest'

const foo = $dict($string)
it('function', () => {
    expect($ref).toMatchInlineSnapshot(`[Function]`)
})

it('expand', () => {
    expect($ref(foo)).toMatchInlineSnapshot(`
        {
          "children": [
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
              "type": "dict",
              "uuid": "0002-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "ref",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})

it('self reference', () => {
    const json = $union([$string, $array($ref(() => json)), $ref(() => json)])
    expect(json).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "string",
              "uuid": "0004-000",
              "value": {},
            },
            {
              "children": [
                {
                  "children": [
                    [Function],
                  ],
                  "description": {},
                  "type": "ref",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "array",
              "uuid": "0002-000",
              "value": {},
            },
            {
              "children": [
                [Function],
              ],
              "description": {},
              "type": "ref",
              "uuid": "0003-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "union",
          "uuid": "0005-000",
          "value": {},
        }
    `)
})

it('uuid reference', () => {
    const value = $string()
    const json = $ref(value)
    expect(json).toMatchInlineSnapshot(`
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
          "type": "ref",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

it('description ', () => {
    const json = $union([$string, $array($ref({ description: 'foo array', reference: ['json', () => json] }))])
    expect(json).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "string",
              "uuid": "0003-000",
              "value": {},
            },
            {
              "children": [
                {
                  "children": [
                    [Function],
                  ],
                  "description": {
                    "description": "foo array",
                  },
                  "name": "json",
                  "type": "ref",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "array",
              "uuid": "0002-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "union",
          "uuid": "0004-000",
          "value": {},
        }
    `)
})
