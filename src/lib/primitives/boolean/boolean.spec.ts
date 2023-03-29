import { $boolean } from './index.js'

test('function', () => {
    expect($boolean).toMatchInlineSnapshot(`[Function]`)
})

test('example', () => {
    expect($boolean({ examples: [true, false] })).toMatchInlineSnapshot(`
        {
          "description": {
            "examples": [
              true,
              false,
            ],
          },
          "type": "boolean",
          "uuid": "0001-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $boolean({ examples: ['foo'] })
})

test('default', () => {
    expect($boolean({ default: true })).toMatchInlineSnapshot(`
        {
          "description": {
            "default": true,
          },
          "type": "boolean",
          "uuid": "0001-000",
          "value": {},
        }
    `)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    $boolean({ default: 'foobar' })
})
