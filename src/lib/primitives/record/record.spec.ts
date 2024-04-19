import { $record } from './record.js'

import { $string } from '../string/string.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($record).toMatchInlineSnapshot('[Function]')
})

it('expand', () => {
    expect($record($string)).toMatchInlineSnapshot(`
      RecordType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "1",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {},
        "id": "2",
        "isCommutative": false,
        "options": {},
        "recordType": StringType {
          "attributes": {
            "generic": {},
            "typescript": {},
          },
          "definition": {},
          "id": "1",
          "isCommutative": true,
          "options": {},
          "type": "string",
        },
        "shape": {},
        "type": "object",
      }
    `)
})

it('example', () => {
    expect($record($string).jsonschema({ examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
      RecordType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "1",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {
          "jsonschema": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
        },
        "id": "2",
        "isCommutative": false,
        "options": {},
        "recordType": StringType {
          "attributes": {
            "generic": {},
            "typescript": {},
          },
          "definition": {},
          "id": "1",
          "isCommutative": true,
          "options": {},
          "type": "string",
        },
        "shape": {},
        "type": "object",
      }
    `)
    // @ts-expect-error
    $record({}, { examples: ['foo'] })
})

it('default', () => {
    expect($record($string, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
      RecordType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "children": [
          StringType {
            "attributes": {
              "generic": {},
              "typescript": {},
            },
            "definition": {},
            "id": "1",
            "isCommutative": true,
            "options": {},
            "type": "string",
          },
        ],
        "definition": {
          "default": {
            "foo": "bar",
          },
        },
        "id": "2",
        "isCommutative": false,
        "options": {},
        "recordType": StringType {
          "attributes": {
            "generic": {},
            "typescript": {},
          },
          "definition": {},
          "id": "1",
          "isCommutative": true,
          "options": {},
          "type": "string",
        },
        "shape": {},
        "type": "object",
      }
    `)

    // @ts-expect-error
    $record({}, { default: 'foobar' })
})
