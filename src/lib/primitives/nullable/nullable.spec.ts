import { $nullable } from './nullable.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {
          "nullable": true,
        },
        "_id": "2",
        "_isCommutative": true,
        "_options": {},
        "_type": "string",
      }
    `)
})

it('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {
          "nullable": true,
        },
        "_id": "2",
        "_isCommutative": true,
        "_options": {},
        "_type": "string",
      }
    `)
})
