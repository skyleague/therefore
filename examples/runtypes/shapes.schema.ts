import { $number, $object, $ref, $union, $validator } from '../../src'

export const square = $validator(
    $object({
        size: $number,
    })
)

export const rectangle = $validator(
    $object({
        width: $number,
        height: $number,
    })
)

export const circle = $validator(
    $object({
        radius: $number,
    })
)

export const shape = $validator($union([$ref(square), $ref(rectangle), $ref(circle)]))
