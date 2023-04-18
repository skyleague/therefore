import { $dict } from './dict.js'

import { $string } from '../string/index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($dict).toMatchInlineSnapshot(`[Function]`)
})

it('expand', () => {
    expect($dict($string)).toMatchInlineSnapshot(`
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
        }
    `)
})

it('example', () => {
    expect($dict($string, { examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
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
              {
                "foo": "bar",
              },
            ],
          },
          "type": "dict",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $dict({}, { examples: ['foo'] })
})

it('default', () => {
    expect($dict($string, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
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
            "default": {
              "foo": "bar",
            },
          },
          "type": "dict",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $dict({}, { default: 'foobar' })
})
