import { $null } from './index.js'

test('function', () => {
    expect($null).toMatchInlineSnapshot(`[Function]`)
})

test('simple', () => {
    expect($null()).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "null",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})
