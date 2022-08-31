import { $array } from '.'

import { $boolean, $string } from '..'

test('simple', () => {
    expect($array($boolean())).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "boolean",
              "uuid": "0001-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "array",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('simple unexpanded', () => {
    expect($array($boolean)).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "boolean",
              "uuid": "0001-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "array",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('expand', () => {
    expect($array($string)).toMatchInlineSnapshot(`
        {
          "children": [
            {
              "description": {},
              "type": "string",
              "uuid": "0001-000",
              "value": {},
            },
          ],
          "description": {},
          "type": "array",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('example', () => {
    expect($array($string, { examples: [['bar']] })).toMatchInlineSnapshot(`
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
            "examples": [
              [
                "bar",
              ],
            ],
          },
          "type": "array",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $array({}, { examples: ['foo'] })
})

test('default', () => {
    expect($array($string, { default: ['bar'] })).toMatchInlineSnapshot(`
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
            "default": [
              "bar",
            ],
          },
          "type": "array",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $array({}, { default: 'foobar' })
})
