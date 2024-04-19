import { cartItem } from './item.schema.js'

import { $array, $object, $string } from '../../src/index.js'

export const cart = $object({
    id: $string,
    items: $array(cartItem.reference()),
    createdAt: $string().datetime(),
    updatedAt: $string().datetime(),
}).validator()
