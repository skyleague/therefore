import { $dict } from './dict'

import { $string } from '../string'

test('function', () => {
    expect($dict).toMatchInlineSnapshot(`[Function]`)
})

test('expand', () => {
    expect($dict($string)).toMatchInlineSnapshot(`
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
          "type": "dict",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('example', () => {
    expect($dict($string, { examples: [{ foo: 'bar' }] })).toMatchInlineSnapshot(`
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
              {
                "foo": "bar",
              },
            ],
          },
          "type": "dict",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $dict({}, { examples: ['foo'] })
})

test('default', () => {
    expect($dict($string, { default: { foo: 'bar' } })).toMatchInlineSnapshot(`
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
            "default": {
              "foo": "bar",
            },
          },
          "type": "dict",
          "uuid": "0002-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $dict({}, { default: 'foobar' })
})
