import { sanitizeTypescriptTypeName } from './typescript.js'

import { expect, it } from 'vitest'

it('sanitize', () => {
    expect(sanitizeTypescriptTypeName('2*"d;e~j')).toMatchInlineSnapshot(`"d e j"`)
})
