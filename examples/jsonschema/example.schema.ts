import { $integer, $intersection, $jsonschema, $number, $object, $string, $validator } from '../../src'

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

export const selfReference = $jsonschema(
    {
        properties: {
            foo: { type: 'string' },
            bar: { $ref: '#' },
        },
    },
    { validator: { enabled: true, assert: true } }
)

export const defaults = $jsonschema(
    {
        properties: {
            str: { type: 'string', default: 'foobar' },
            int: { type: 'integer', default: 42 },
        },
    },
    { validator: { enabled: true, assert: true } }
)
