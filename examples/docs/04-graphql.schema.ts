import { $array } from '../../src/lib/primitives/array/array.js'
import { $graphql } from '../../src/lib/primitives/graphql/graphql.js'
import { $object, type ObjectType } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const person = $object({
    name: $string,
})

export const group: ObjectType = $object({
    description: $string,
    members: $array($ref(() => user)),
})

export const user = person.extend({
    groups: $array($ref(() => group)),
    name: $string,
})

export const schema = $graphql.schema({
    query: {
        allUsers: $graphql.field({ type: user.reference().array() }),
        me: $graphql.field({ type: user.reference() }),
        person: $graphql.field({ type: person.reference() }),
    },
})
