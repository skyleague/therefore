import { expect, it } from 'vitest'
import { sanitizeTypescriptTypeName } from './typescript.js'

it('sanitize', () => {
    expect(sanitizeTypescriptTypeName('2*"d;e~j')).toMatchInlineSnapshot(`"d e j"`)
})
