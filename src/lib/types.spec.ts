import type { InferSchemaType, Schema } from './types.js'

import { Comic } from '../../examples/restclients/xkcd/xkcd.type.js'

import { expect, it } from 'vitest'

it('Schema o InferSchemaType === identity', () => {
    type Foo = number | string
    type X = InferSchemaType<Schema<Foo>>
    const x: X = 'foo'
    expect(x).toBe('foo')
})

it('generates satisfying schemas', () => {
    const schema: Schema<Comic> = Comic
    void schema
})
