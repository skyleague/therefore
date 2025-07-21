import { $array, $object, $string } from '../../src/index.js'
import { cartItem } from './item.schema.js'

export const cart = $object({
    id: $string,
    items: $array(cartItem.reference()),
    createdAt: $string().datetime(),
    updatedAt: $string().datetime(),
}).validator()
