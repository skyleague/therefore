import { renderTemplate } from '.'

test('identity for normal strings', () => {
    expect(renderTemplate('foo')).toMatchInlineSnapshot(`"foo"`)
})

test('replace templates', () => {
    expect(renderTemplate('foo{{bar}}{{2}}', { bar: 'foo', 2: 'bar' })).toMatchInlineSnapshot(`"foofoobar"`)
})

test('leave weird nesting', () => {
    expect(() => renderTemplate('foo{{bar{{bar}}}}', { bar: 'foo' })).toThrowErrorMatchingInlineSnapshot(
        `"Reference bar{{bar not found"`
    )
})
