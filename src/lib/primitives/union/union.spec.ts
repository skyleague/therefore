import { $union } from './index.js'

import { $string } from '../index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($union).toMatchInlineSnapshot(`[Function]`)
})

it('expand', () => {
    expect($union([$string])).toMatchInlineSnapshot(`
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
          "type": "union",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

it('example', () => {
    expect($union([$string], { examples: ['bar'] })).toMatchInlineSnapshot(`
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
              "bar",
            ],
          },
          "type": "union",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

it('default', () => {
    expect($union([$string], { default: ['bar'] })).toMatchInlineSnapshot(`
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
          "type": "union",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})
