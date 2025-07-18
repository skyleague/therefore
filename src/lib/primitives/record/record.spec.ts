import { expect, it } from 'vitest'

import { $string } from '../string/string.js'
import { $record } from './record.js'

it('function', () => {
    expect($record).toMatchInlineSnapshot('[Function]')
})

it('expand', () => {
    expect($record($string)).toMatchInlineSnapshot(`
      RecordType {
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
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "element": StringType {
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
        "shape": {},
      }
    `)
})

it('example', () => {
    expect($record($string).jsonschema({ examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
      RecordType {
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
        "_definition": {
          "jsonschema": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
        },
        "_guessedTrace": undefined,
        "_id": "2",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "element": StringType {
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
        "shape": {},
      }
    `)
    // @ts-expect-error
    $record({}, { examples: ['foo'] })
})

it('default', () => {
    expect($record($string, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
      RecordType {
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
        "_definition": {
          "default": {
            "foo": "bar",
          },
        },
        "_guessedTrace": undefined,
        "_id": "2",
        "_isCommutative": false,
        "_options": {},
        "_origin": {},
        "_type": "object",
        "element": StringType {
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
        "shape": {},
      }
    `)

    // @ts-expect-error
    $record({}, { default: 'foobar' })
})
