import { $boolean } from './index.js'

import { expect, it } from 'vitest'

it('function', () => {
    expect($boolean).toMatchInlineSnapshot(`[Function]`)
})

it('example', () => {
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

it('default', () => {
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
