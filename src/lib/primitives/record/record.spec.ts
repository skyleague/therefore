import { $record } from './record.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($record).toMatchInlineSnapshot('[Function]')
})

it('expand', () => {
    expect($record($string)).toMatchInlineSnapshot(`
      RecordType {
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
        "_isCommutative": false,
        "_options": {},
        "_type": "object",
        "element": StringType {
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
        "shape": {},
      }
    `)
})

it('example', () => {
    expect($record($string).jsonschema({ examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
      RecordType {
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
        "_definition": {
          "jsonschema": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
        },
        "_id": "2",
        "_isCommutative": false,
        "_options": {},
        "_type": "object",
        "element": StringType {
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
        "_definition": {
          "default": {
            "foo": "bar",
          },
        },
        "_id": "2",
        "_isCommutative": false,
        "_options": {},
        "_type": "object",
        "element": StringType {
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
        "shape": {},
      }
    `)

    // @ts-expect-error
    $record({}, { default: 'foobar' })
})
