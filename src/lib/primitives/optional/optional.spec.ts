import { $optional } from './optional.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_definition": {},
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "string",
          },
        ],
        "_definition": {},
        "_id": "2",
        "_isCommutative": true,
        "_origin": {},
        "_type": "optional",
      }
    `)
})

it('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
            },
            "_definition": {},
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "string",
          },
        ],
        "_definition": {},
        "_id": "2",
        "_isCommutative": true,
        "_origin": {},
        "_type": "optional",
      }
    `)
})
