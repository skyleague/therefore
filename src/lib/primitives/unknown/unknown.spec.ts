import { expect, it } from 'vitest'
import { $unknown } from './unknown.js'

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
        "_guessedTrace": undefined,
        "_id": "1",
        "_isCommutative": true,
        "_options": {
          "restrictToJson": false,
        },
        "_origin": {},
        "_type": "unknown",
      }
    `)
})
