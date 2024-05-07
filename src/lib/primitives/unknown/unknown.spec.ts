import { $unknown } from './unknown.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($unknown).toMatchInlineSnapshot('[Function]')
})

it('simple', () => {
    expect($unknown()).toMatchInlineSnapshot(`
      UnknownType {
        "_attributes": {
          "generic": {},
          "typescript": {},
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_options": {
          "restrictToJson": false,
        },
        "_type": "unknown",
      }
    `)
})
