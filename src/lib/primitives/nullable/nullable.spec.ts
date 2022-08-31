import { $nullable } from '.'

import { $string } from '..'

test('string', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
        {
          "description": {
            "nullable": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('string expanded', () => {
    expect($nullable($string)).toMatchInlineSnapshot(`
        {
          "description": {
            "nullable": true,
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})
