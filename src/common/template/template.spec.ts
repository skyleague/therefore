import { renderTemplate } from './index.js'

import { expect, it } from 'vitest'

it('identity for normal strings', () => {
    expect(renderTemplate('foo')).toMatchInlineSnapshot(`"foo"`)
})

it('replace templates', () => {
    expect(renderTemplate('foo{{bar}}{{2}}', { bar: 'foo', 2: 'bar' })).toMatchInlineSnapshot(`"foofoobar"`)
})

it('leave weird nesting', () => {
    expect(() => renderTemplate('foo{{bar{{bar}}}}', { bar: 'foo' })).toThrowErrorMatchingInlineSnapshot(
        `[Error: Reference bar{{bar not found]`
    )
})
