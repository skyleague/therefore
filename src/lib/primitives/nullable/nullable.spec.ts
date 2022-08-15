import { $nullable } from '.'

import { $string } from '..'

test('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
        Object {
          "description": Object {
            "nullable": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})

test('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
        Object {
          "description": Object {
            "nullable": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": Object {},
        }
    `)
})
