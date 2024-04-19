import { $unknown } from './unknown.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($unknown).toMatchInlineSnapshot('[Function]')
})

it('simple', () => {
    expect($unknown()).toMatchInlineSnapshot(`
      UnknownType {
        "attributes": {
          "generic": {},
          "typescript": {},
        },
        "definition": {},
        "id": "1",
        "isCommutative": true,
        "options": {
          "restrictToJson": false,
        },
        "type": "unknown",
      }
    `)
})
