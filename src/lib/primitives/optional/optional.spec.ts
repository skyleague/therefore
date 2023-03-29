import { $optional } from './index.js'

import { $string } from '../index.js'

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
