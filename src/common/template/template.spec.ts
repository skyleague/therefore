import { expect, it } from 'vitest'
import { renderTemplate } from './template.js'

it('identity for normal strings', () => {
    expect(renderTemplate('foo')).toMatchInlineSnapshot(`"foo"`)
})

it('replace templates', () => {
    expect(renderTemplate('foo{{bar}}{{2}}', { bar: 'foo', 2: 'bar' })).toMatchInlineSnapshot(`"foofoobar"`)
})

it('leave weird nesting', () => {
    expect(renderTemplate('foo{{bar{{bar}}}}', { bar: 'foo' })).toMatchInlineSnapshot(`"foo{{barfoo}}"`)
})
