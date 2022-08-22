import type { InferSchemaType, Schema } from './types'

import { Comic } from '../../examples/xkcd/xkcd.type'

test('Schema o InferSchemaType === identity', () => {
    type Foo = number | string
    type X = InferSchemaType<Schema<Foo>>
    const x: X = 'foo'
    expect(x).toBe('foo')
})

test('generates satisfying schemas', () => {
    const schema: Schema<Comic> = Comic
    void schema
})
