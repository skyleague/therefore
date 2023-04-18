import { $enum } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($enum).toMatchInlineSnapshot(`[Function]`)
})

it('values', () => {
    expect($enum([1, 2, 3, '4'])).toMatchInlineSnapshot(`
        {
          "children": [
            1,
            2,
            3,
            "4",
          ],
          "description": {},
          "type": "enum",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})

it('named', () => {
    expect(
        $enum({
            foo: 'bar',
            woo: 'baz',
        })
    ).toMatchInlineSnapshot(`
        {
          "children": [
            [
              "foo",
              "bar",
            ],
            [
              "woo",
              "baz",
            ],
          ],
          "description": {},
          "type": "enum",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})
