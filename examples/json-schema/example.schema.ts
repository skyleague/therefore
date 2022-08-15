import { $number, $object, $string, $validator } from '../../src'

export const person = $validator(
    $object({
        firstName: $string({
            description: "The person's first name.",
        }),
        lastName: $string,
        age: $number,
    })
)
