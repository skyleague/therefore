import { $boolean } from '.'

test('function', () => {
    expect($boolean).toMatchInlineSnapshot(`[Function]`)
})

test('example', () => {
    expect($boolean({ examples: [true, false] })).toMatchInlineSnapshot(`
        Object {
          "description": Object {
            "examples": Array [
              true,
              false,
            ],
          },
          "type": "boolean",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $boolean({ examples: ['foo'] })
})

test('default', () => {
    expect($boolean({ default: true })).toMatchInlineSnapshot(`
        Object {
          "description": Object {
            "default": true,
          },
          "type": "boolean",
          "uuid": "0001-000",
          "value": Object {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $boolean({ default: 'foobar' })
})
