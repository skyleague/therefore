import { z } from 'zod'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $ref } from '../../src/lib/primitives/ref/ref.js'
import { $string } from '../../src/lib/primitives/string/string.js'

export const Address = z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
    postalCode: z.string(),
})

export const Contact = z.object({
    type: z.enum(['email', 'phone']),
    value: z.string(),
    verified: z.boolean().default(false),
})

export const Customer = $object({
    id: $string,
    name: $string,
    primaryAddress: $ref(Address),
    otherAddresses: $ref(Address).array(),
    contacts: $ref(Contact).array(),
}).validator()
