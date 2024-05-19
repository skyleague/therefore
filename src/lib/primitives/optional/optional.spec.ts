import { $optional } from './optional.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "typescript": {},
            },
            "_definition": {},
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_type": "string",
          },
        ],
        "_definition": {},
        "_id": "2",
        "_isCommutative": true,
        "_type": "optional",
      }
    `)
})

it('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "typescript": {},
            },
            "_definition": {},
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_type": "string",
          },
        ],
        "_definition": {},
        "_id": "2",
        "_isCommutative": true,
        "_type": "optional",
      }
    `)
})
