import { $nullable } from './index.js'

import { $string } from '../index.js'

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
