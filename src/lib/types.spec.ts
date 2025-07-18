import { expect, it } from 'vitest'

import { Comic } from '../../examples/restclients/ajv/xkcd/xkcd.type.js'
import type { InferSchemaType, Schema } from './types.js'

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
