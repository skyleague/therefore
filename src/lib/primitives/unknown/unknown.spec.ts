import { $unknown } from '.'

test('function', () => {
    expect($unknown).toMatchInlineSnapshot(`[Function]`)
})

test('simple', () => {
    expect($unknown()).toMatchInlineSnapshot(`
        Object {
          "description": Object {},
          "type": "unknown",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
})
