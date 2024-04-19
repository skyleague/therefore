import { $array } from '../../src/lib/primitives/array/array.js'
import { $enum } from '../../src/lib/primitives/enum/enum.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const unevaluated = $string

export const ref1 = $ref(unevaluated, { name: 'ref' })
export const ref2 = $ref(unevaluated, { name: 'ref' })

export const days = $object({
    days: $array($enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], { name: 'days' })),
})
