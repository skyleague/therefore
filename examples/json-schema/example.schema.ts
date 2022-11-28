import { $integer, $intersection, $number, $object, $string, $validator } from '../../src'

export const person = $validator(
    $object({
        firstName: $string({
            description: "The person's first name.",
        }),
        lastName: $string,
        age: $number,
    })
)

export const salesPerson = $validator(
    $intersection([
        $object({
            sales: $integer,
        }),
        person,
    ])
)
