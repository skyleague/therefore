import { $jsonschema, $number, $object, $string } from '../../src/index.js'
import { $integer } from '../../src/lib/primitives/integer/integer.js'
import { $intersection } from '../../src/lib/primitives/intersection/intersection.js'

export const person = $object({
    firstName: $string({
        description: "The person's first name.",
    }),
    lastName: $string,
    age: $number,
}).validator()

export const salesPerson = $intersection([
    $object({
        sales: $integer,
    }),
    person,
]).validator()

export const selfReference = $jsonschema({
    properties: {
        foo: { type: 'string' },
        bar: { $ref: '#' },
    },
}).validator({ assert: true })

export const defaults = $jsonschema({
    properties: {
        str: { type: 'string', default: 'foobar' },
        int: { type: 'integer', default: 42 },
    },
}).validator({ assert: true })

export const keyword = $jsonschema({
    properties: {
        foo: { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 4 },
    },
}).validator({ assert: true })

export const named = async () =>
    $jsonschema({
        properties: {
            foo: { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 },
        },
    }).validator({ assert: true })
