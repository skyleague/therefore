import { $optional } from './optional.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
      StringType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {
          "optional": true,
        },
        "id": "2",
        "isCommutative": true,
        "options": {},
        "type": "string",
      }
    `)
})

it('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
      StringType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {
          "optional": true,
        },
        "id": "2",
        "isCommutative": true,
        "options": {},
        "type": "string",
      }
    `)
})
