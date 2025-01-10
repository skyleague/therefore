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
          "isGenerated": true,
          "typescript": {},
          "validator": undefined,
          "validatorType": undefined,
        },
        "_definition": {},
        "_id": "1",
        "_isCommutative": true,
        "_options": {
          "restrictToJson": false,
        },
        "_origin": {},
        "_recurrentCache": undefined,
        "_type": "unknown",
      }
    `)
})
