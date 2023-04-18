import { $number } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($number).toMatchInlineSnapshot(`[Function]`)
})

it('multipleOf', () => {
    expect(
        $number({
            multipleOf: 0.01,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
            "multipleOf": 0.01,
          },
        }
    `)
})

it('maximum', () => {
    expect(
        $number({
            maximum: 100,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
            "maximum": 100,
          },
        }
    `)
})

it('minimum', () => {
    expect(
        $number({
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
            "minimum": 100,
          },
        }
    `)
})

it('combined', () => {
    expect(
        $number({
            multipleOf: 0.01,
            maximum: 100,
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "number",
          "uuid": "0001-000",
          "value": {
            "maximum": 100,
            "minimum": 100,
            "multipleOf": 0.01,
          },
        }
    `)
})
