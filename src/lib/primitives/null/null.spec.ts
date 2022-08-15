import { $null } from '.'

test('function', () => {
    expect($null).toMatchInlineSnapshot(`[Function]`)
})

test('simple', () => {
    expect($null()).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "null",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
})
