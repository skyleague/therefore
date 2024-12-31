import { $enum } from '../../src/lib/primitives/enum/enum.js'
import { $intersection } from '../../src/lib/primitives/intersection/intersection.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { Pet } from '../restclients/ajv/petstore/petstore.type.js'

const ref = $ref(Pet)
export const cat = $intersection([
    ref,
    $object({
        tailType: $enum(['skinny', 'fluffy']),
    }),
])
