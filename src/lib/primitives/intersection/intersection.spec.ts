import { $intersection } from './intersection.js'

import { $object, $ref, $string } from '../index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($intersection).toMatchInlineSnapshot(`[Function]`)
})

it('expand', () => {
    expect($intersection([$object({ foo: $string })])).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "name": "foo",
                  "type": "string",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "object",
              "uuid": "0002-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "intersection",
          "uuid": "0003-000",
          "value": {},
        }
    `)
})

it('example', () => {
    expect($intersection([$object({ foo: $string })], { examples: ['bar'] })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "name": "foo",
                  "type": "string",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "object",
              "uuid": "0002-000",
              "value": {},
            },
          ],
          "description": {
            "examples": [
              "bar",
            ],
          },
          "type": "intersection",
          "uuid": "0003-000",
          "value": {},
        }
    `)
})

it('default', () => {
    expect($intersection([$object({ foo: $string })], { default: ['bar'] })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "name": "foo",
                  "type": "string",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "object",
              "uuid": "0002-000",
              "value": {},
            },
          ],
          "description": {
            "default": [
              "bar",
            ],
          },
          "type": "intersection",
          "uuid": "0003-000",
          "value": {},
        }
    `)
})

it('object intersection', () => {
    expect($intersection([$object({ foo: $string }), $object({ bar: $string })], { examples: ['bar'] })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "name": "foo",
                  "type": "string",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "object",
              "uuid": "0002-000",
              "value": {},
            },
            {
              "children": [
                {
                  "description": {},
                  "name": "bar",
                  "type": "string",
                  "uuid": "0003-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "object",
              "uuid": "0004-000",
              "value": {},
            },
          ],
          "description": {
            "examples": [
              "bar",
            ],
          },
          "type": "intersection",
          "uuid": "0005-000",
          "value": {},
        }
    `)
})

const ref = $object({ bar: $string })
it('reference intersection', () => {
    expect($intersection([$object({ foo: $string }), $ref(ref)], { examples: ['bar'] })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "name": "foo",
                  "type": "string",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "object",
              "uuid": "0002-000",
              "value": {},
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "description": {},
                      "name": "bar",
                      "type": "string",
                      "uuid": "0001-000",
                      "value": {},
                    },
                  ],
                  "description": {},
                  "type": "object",
                  "uuid": "0002-000",
                  "value": {},
                },
              ],
              "description": {},
              "type": "ref",
              "uuid": "0003-000",
              "value": {},
            },
          ],
          "description": {
            "examples": [
              "bar",
            ],
          },
          "type": "intersection",
          "uuid": "0004-000",
          "value": {},
        }
    `)
})
