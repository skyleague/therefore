import { $object, $string, $ref, $number, $enum, $optional, $validator } from '../../src/index.js'

export const size = $enum(['XS', 'S', 'M', 'L', 'XL'])

export const cartItem = $validator(
    $object({
        id: $string,
        name: $string,
        price: $number,
        size: $optional($ref(size)),
    })
)
