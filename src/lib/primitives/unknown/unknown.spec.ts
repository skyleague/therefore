import { $unknown } from '.'

test('function', () => {
    expect($unknown).toMatchInlineSnapshot(`[Function]`)
})

test('simple', () => {
    expect($unknown()).toMatchInlineSnapshot(`
        {
          "description": {},
          "type": "unknown",
          "uuid": "0001-000",
          "value": {},
        }
    `)
})
