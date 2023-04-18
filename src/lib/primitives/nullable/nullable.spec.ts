import { $nullable } from './index.js'

import { $string } from '../index.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
        {
          "description": {
            "nullable": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

it('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
        {
          "description": {
            "nullable": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})
