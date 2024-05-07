import { $optional } from './optional.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {
          "optional": true,
        },
        "_id": "2",
        "_isCommutative": true,
        "_options": {},
        "_type": "string",
      }
    `)
})

it('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
      StringType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {
          "optional": true,
        },
        "_id": "2",
        "_isCommutative": true,
        "_options": {},
        "_type": "string",
      }
    `)
})
