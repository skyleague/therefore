import { $object } from './object.js'

import { $array, $boolean } from '../index.js'
import { $string } from '../string/index.js'

test('function', () => {
    expect($object).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($object({ foo: $string })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "name": "foo",
              "type": "string",
              "uuid": "0001-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "object",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    expect($object({ foo: $object({}) })).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [],
              "description": {},
              "name": "foo",
              "type": "object",
              "uuid": "0003-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "object",
          "uuid": "0004-000",
          "value": {},
        }
    `)
})

test('example', () => {
    expect($object({}, { examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
        {
          "children": [],
          "description": {
            "examples": [
              {
                "foo": "bar",
              },
            ],
          },
          "type": "object",
          "uuid": "0001-000",
          "value": {},
        }
    `)

    // @-ts-expect-error
    $object({}, { examples: ['foo'] })
})

test('default', () => {
    expect($object({}, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
        {
          "children": [],
          "description": {
            "default": {
              "foo": "bar",
            },
          },
          "type": "object",
          "uuid": "0001-000",
          "value": {},
        }
    `)

    // @-ts-expect-error
    $object({}, { default: 'foobar' })
})

test('complex', () => {
    expect(
        $object({
            description:
                'Declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.',
            properties: {
                ids: $array($string, {
                    description:
                        'The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.',
                    minItems: 1,
                    //uniqueItems: true,
                }),
                matches: $string({
                    description:
                        'The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.',
                }),

                booleans: $boolean({
                    default: false,
                    description:
                        "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
                }),
            },
        })
    ).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "children": [
                {
                  "description": {},
                  "type": "string",
                  "uuid": "0001-000",
                  "value": {},
                },
              ],
              "description": {
                "description": "The IDs of extensions or apps that are allowed to connect. If left empty or unspecified, no extensions or apps can connect.",
              },
              "name": "ids",
              "type": "array",
              "uuid": "0002-000",
              "value": {
                "minItems": 1,
              },
            },
            {
              "description": {
                "description": "The URL patterns for web pages that are allowed to connect. This does not affect content scripts. If left empty or unspecified, no web pages can connect.",
              },
              "name": "matches",
              "type": "string",
              "uuid": "0003-000",
              "value": {},
            },
            {
              "description": {
                "default": false,
                "description": "Indicates that the extension would like to make use of the TLS channel ID of the web page connecting to it. The web page must also opt to send the TLS channel ID to the extension via setting includeTlsChannelId to true in runtime.connect's connectInfo or runtime.sendMessage's options.",
              },
              "name": "booleans",
              "type": "boolean",
              "uuid": "0004-000",
              "value": {},
            },
          ],
          "description": {
            "description": "Declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.",
          },
          "type": "object",
          "uuid": "0005-000",
          "value": {},
        }
    `)
})
