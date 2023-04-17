import { $string } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($string).toMatchInlineSnapshot(`[Function]`)
})

it('minLength', () => {
    expect(
        $string({
            minLength: 2,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "minLength": 2,
          },
        }
    `)
})

it('maxLength', () => {
    expect(
        $string({
            maxLength: 2,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "maxLength": 2,
          },
        }
    `)
})

it('pattern', () => {
    expect(
        $string({
            pattern: /foo/,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "pattern": /foo/,
          },
        }
    `)
})

it('format', () => {
    expect(
        $string({
            format: 'date',
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "format": "date",
          },
        }
    `)
})

it('all', () => {
    expect(
        $string({
            minLength: 2,
            maxLength: 2,
            pattern: /foo/,
        })
    ).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "string",
          "uuid": "0001-000",
          "value": {
            "maxLength": 2,
            "minLength": 2,
            "pattern": /foo/,
          },
        }
    `)
})
