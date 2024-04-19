import { $nullable } from './nullable.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
      StringType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {
          "nullable": true,
        },
        "id": "2",
        "isCommutative": true,
        "options": {},
        "type": "string",
      }
    `)
})

it('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
      StringType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {
          "nullable": true,
        },
        "id": "2",
        "isCommutative": true,
        "options": {},
        "type": "string",
      }
    `)
})
