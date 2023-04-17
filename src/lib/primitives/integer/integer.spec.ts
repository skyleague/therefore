import { $integer } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($integer).toMatchInlineSnapshot(`[Function]`)
})

it('multipleOf', () => {
    expect(
        $integer({
            multipleOf: 0.01,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
            "multipleOf": 0.01,
          },
        }
    `)
})

it('maximum', () => {
    expect(
        $integer({
            maximum: 100,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
            "maximum": 100,
          },
        }
    `)
})

it('minimum', () => {
    expect(
        $integer({
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
            "minimum": 100,
          },
        }
    `)
})

it('combined', () => {
    expect(
        $integer({
            multipleOf: 0.01,
            maximum: 100,
            minimum: 100,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "integer",
          "uuid": "0001-000",
          "value": {
            "maximum": 100,
            "minimum": 100,
            "multipleOf": 0.01,
          },
        }
    `)
})
