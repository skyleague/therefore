import { $array } from '../../../src/lib/primitives/array/array.js'
import type { ObjectType } from '../../../src/lib/primitives/object/object.js'
import { $object } from '../../../src/lib/primitives/object/object.js'
import { $ref } from '../../../src/lib/primitives/ref/ref.js'
import { $string } from '../../../src/lib/primitives/string/string.js'

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

export const query = $object({
    allUsers: $array($ref(user)),
    me: $ref(user),
    person: $ref(person),
})
