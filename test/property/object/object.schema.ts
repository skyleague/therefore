import { $number } from '../../../src/lib/primitives/number/number.js'
import { $object } from '../../../src/lib/primitives/object/object.js'
import { $string } from '../../../src/lib/primitives/string/string.js'

export const person = $object({
    name: $string(),
    age: $number(),
    nested: $object({
        pet: $string,
    }),
}).validator()

export const nameonlyPerson = person.pick('name').validator({ assert: true })
export const ageonlyPerson = person.pick('age').validator({ assert: true })
export const nonamePerson = person.omit('name').validator({ assert: true })
