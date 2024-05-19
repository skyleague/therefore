import { $nullable } from './nullable.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
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
        "_type": "nullable",
      }
    `)
})

it('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
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
        "_type": "nullable",
      }
    `)
})
