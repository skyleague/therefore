import { expect, it } from 'vitest'

import { $string } from '../string/string.js'
import { $nullable } from './nullable.js'

it('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "string",
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "2",
        "_isCommutative": true,
        "_origin": {},
        "_type": "nullable",
      }
    `)
})

it('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
      NodeTrait {
        "_attributes": {
          "generic": {},
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_children": [
          StringType {
            "_attributes": {
              "generic": {},
              "isGenerated": true,
              "typescript": {},
              "validator": undefined,
              "validatorType": undefined,
            },
            "_definition": {},
            "_guessedTrace": undefined,
            "_id": "1",
            "_isCommutative": true,
            "_options": {},
            "_origin": {},
            "_type": "string",
          },
        ],
        "_definition": {},
        "_guessedTrace": undefined,
        "_id": "2",
        "_isCommutative": true,
        "_origin": {},
        "_type": "nullable",
      }
    `)
})
