import { $graphql } from '../../../src/lib/primitives/graphql/graphql.js'
import type { ObjectType } from '../../../src/lib/primitives/object/object.js'
import { $object } from '../../../src/lib/primitives/object/object.js'
import { $ref } from '../../../src/lib/primitives/ref/ref.js'
import { $string } from '../../../src/lib/primitives/string/string.js'

// https://docs.aws.amazon.com/appsync/latest/devguide/designing-your-schema.html

export const book = $object({
    title: $string,
    authors: $ref(() => author),
})

export const author: ObjectType = $object({
    name: $string,
    books: $ref(() => book),
})

export const authorInput: ObjectType = $object({
    name: $string,
    books: $ref(() => bookInput)
        .array()
        .optional(),
})

export const bookInput = $object({
    title: $string,
    authors: authorInput.reference().array().optional(),
})

export const schema = $graphql.schema({
    query: {
        getAuthor: $graphql.field({ args: $object({ authorName: $string }), type: author.reference() }),
        getBook: $graphql.field({ args: $object({ bookName: $string }), type: book.reference() }),
    },
    mutation: {
        addAuthor: $graphql.field({ args: { input: authorInput.reference() }, type: author.reference() }),
        addBook: $graphql.field({ args: { input: bookInput.reference() }, type: book.reference() }),
    },
})
