import { $enum, $number, $object, $string } from '../../src/index.js'

export const size = $enum(['XS', 'S', 'M', 'L', 'XL'])

export const cartItem = $object({
    id: $string,
    name: $string,
    price: $number,
    size: size.reference().optional(),
}).validator({ compile: false })
