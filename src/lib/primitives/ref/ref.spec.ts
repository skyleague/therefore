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
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "type": "string",
                  "value": {},
                },
              ],
              "description": {},
              "type": "dict",
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

test('self reference', () => {
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

test('uuid reference', () => {
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

test('description ', () => {
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
