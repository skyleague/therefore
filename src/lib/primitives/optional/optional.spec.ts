import { $optional } from './index.js'

import { $string } from '../index.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
        {
          "description": {
            "optional": "implicit",
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

it('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
        {
          "description": {
            "optional": "implicit",
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})
