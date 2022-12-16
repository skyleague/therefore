import { cartItem } from './item.schema'

import { $object, $string, $ref, $array, $validator } from '../../src'

export const cart = $validator(
    $object({
        id: $string,
        items: $array($ref(cartItem)),
        createdAt: $string({ format: 'date-time' }),
        updatedAt: $string({ format: 'date-time' }),
    })
)
