import { $null } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($null).toMatchInlineSnapshot(`[Function]`)
})

it('simple', () => {
    expect($null()).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "null",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})
