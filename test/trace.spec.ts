import { expect, it } from 'vitest'
import { Pet } from '../examples/restclients/zod/petstore/petstore.zod.js'
import { extendsZodWithTracing } from '../src/lib/primitives/zod/zod.js'

it('names Pet correctly', () => {
    expect(Pet._guessedTrace?.symbolName).toBe('Pet')
})

it('finds inline', async () => {
    const { z } = await import('zod')
    extendsZodWithTracing(z)

    const foo = z.object({
        bar: z.string(),
    })

    expect(foo._guessedTrace?.symbolName).toBe('foo')
    expect(foo.shape.bar._guessedTrace?.symbolName).toBe(undefined)
})

it('finds inline chained', async () => {
    const { z } = await import('zod')
    extendsZodWithTracing(z)

    const foo = z
        .object({
            bar: z.string(),
        })
        .merge(
            z.object({
                baz: z.string(),
            }),
        )

    expect(foo._guessedTrace?.symbolName).toBe('foo')
    expect(foo.shape.bar._guessedTrace?.symbolName).toBe(undefined)
    expect(foo.shape.baz._guessedTrace?.symbolName).toBe(undefined)
    expect(foo._merged?.origin._guessedTrace?.symbolName).toBe(undefined)
    expect(foo._merged?.merged._guessedTrace?.symbolName).toBe(undefined)
})
