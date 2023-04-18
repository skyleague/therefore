import { $unknown } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($unknown).toMatchInlineSnapshot(`[Function]`)
})

it('simple', () => {
    expect($unknown()).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "unknown",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})
