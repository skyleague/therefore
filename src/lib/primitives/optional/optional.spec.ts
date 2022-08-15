import { $optional } from '.'

import { $string } from '..'

test('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
        Object {
          "description": Object {
            "optional": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
        Object {
          "description": Object {
            "optional": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})
