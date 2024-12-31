import { $array } from '../../src/lib/primitives/array/array.js'
import { $enum } from '../../src/lib/primitives/enum/enum.js'
import { $integer } from '../../src/lib/primitives/integer/integer.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $optional } from '../../src/lib/primitives/optional/optional.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const category = $object({
    id: $integer,
    name: $string,
}).validator()

export const tag = $object({
    id: $optional($integer),
    name: $optional($string),
}).validator()

export const status = $enum(['available', 'pending', 'sold']).validator()

export const pet = $object(
    {
        id: $optional($integer),
        category: $optional($ref(category)),
        name: $string,
        photoUrls: $array($string),
        tags: $optional($array($ref(tag))),
        status: $optional(status),
    },
    {
        description: 'Pet object from the store',
    },
).validator()

export const petArray = $array($ref(pet), { description: 'A list of Pet objects' }).validator()
