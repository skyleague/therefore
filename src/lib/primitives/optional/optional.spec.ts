import { $optional } from '.'

import { $string } from '..'

test('string', () => {
    expect($optional($string)).toMatchInlineSnapshot(`
        {
          "description": {
            "optional": "implicit",
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})

test('string expanded', () => {
    expect($optional($string())).toMatchInlineSnapshot(`
        {
          "description": {
            "optional": "implicit",
          },
          "type": "string",
          "uuid": "0002-000",
          "value": {},
        }
    `)
})
