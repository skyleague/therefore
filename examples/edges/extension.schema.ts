import { $array } from '../../src/lib/primitives/array/array.js'
import { $boolean } from '../../src/lib/primitives/boolean/boolean.js'
import { $enum } from '../../src/lib/primitives/enum/enum.js'
import { $number } from '../../src/lib/primitives/number/number.js'
import { $object } from '../../src/lib/primitives/object/object.js'
import { $record } from '../../src/lib/primitives/record/record.js'
import { $string } from '../../src/lib/primitives/string/string.js'
import { $unknown } from '../../src/lib/primitives/unknown/unknown.js'

export const userSchema = $object({
    name: $string(),
    age: $number(),
})

export const userExtended = userSchema.extend({
    email: $string().email(),
})

export const userMultipleExtended = userSchema
    .extend({
        email: $string().email(),
    })
    .extend({
        phone: $string(),
    })

export const addressSchema = $object({
    street: $string(),
    city: $string(),
    country: $string(),
})

export const userMerged = userSchema.merge(addressSchema)
export const userMergedInlineRHS = userSchema.merge(
    $object({
        street: $string(),
        city: $string(),
        country: $string(),
    }),
)
export const userMergedInlineLHS = $object({
    name: $string(),
    age: $number(),
}).merge(addressSchema)
export const userMergedInlineLRHS = $object({
    name: $string(),
    age: $number(),
}).merge(
    $object({
        street: $string(),
        city: $string(),
        country: $string(),
    }),
)

export const contactSchema = $object({
    phone: $string(),
    email: $string().email(),
})

export const userMergedMultiple = userSchema
    .merge(addressSchema)
    .merge(
        $object({
            interests: $string(),
            theme: $string(),
        }),
    )
    .merge(contactSchema)
    .merge(
        $object({
            hobby: $string(),
            favoriteColor: $string(),
        }),
    )

export const userPick = userSchema.pick('name')

export const userOmit = userSchema.omit('age')

// Partial makes all or specific fields optional
export const userAllOptional = userSchema.partial()
export const userPartialFields = userSchema.partial('name')
export const userMultiplePartialFields = userSchema.partial('name', 'age')

// Required makes optional fields required
export const userWithOptionalField = $object({
    name: $string(),
    age: $number(),
    email: $string().optional(),
})

export const userAllRequired = userWithOptionalField.required()
export const userRequiredField = userWithOptionalField.required('email')
export const userMultipleRequiredFields = userWithOptionalField
    .extend({
        phone: $string().optional(),
    })
    .required('email', 'phone')

// Strict mode validation
export const userStrict = userSchema.strict()

// Get object keys as enum
export const userKeys = userSchema.keyof()
export const inlineKeys = $object({
    name: $string(),
    age: $number(),
}).keyof()

export const userPickMultiple = userSchema.pick('name', 'age')

export const userOmitMultiple = userMerged.omit('name', 'age')

export const userMultipleChained = userSchema
    .extend({
        email: $string().email(),
    })
    .pick('name', 'age', 'email')
    .merge(contactSchema)
    .omit('email') // Remove duplicate email field from merge

// Examples of extend overwriting behavior with dramatic type changes
export const userWithPreferences = $object({
    name: $string(),
    preferences: $object({
        theme: $enum(['light', 'dark']),
        fontSize: $number(),
    }),
    tags: $array($string()),
})

export const userPreferencesOverwritten = userWithPreferences.extend({
    preferences: $boolean(), // Completely changes from object to boolean
    tags: $number(), // Completely changes from string[] to number
})

// Examples of merge overwriting behavior with dramatic type changes
export const profileWithDetails = $object({
    userId: $number(),
    details: $array($string()),
    metadata: $record($number()),
})

export const overwrittenProfile = $object({
    userId: $string().uuid(), // Changes from number to string UUID
    details: $boolean(), // Changes from string[] to boolean
    metadata: $string().datetime(), // Changes from Record<string, number> to Date
    newField: $array($number()),
})

export const mergedDramaticChanges = profileWithDetails.merge(overwrittenProfile) // Fields completely change types

// Multiple dramatic overwrites in chain
export const baseConfig = $object({
    timeout: $number(),
    retries: $array($number()),
    handler: $object({
        type: $string(),
        enabled: $boolean(),
    }),
})

export const withDramaticChanges = baseConfig
    .merge(
        $object({
            timeout: $boolean(), // number -> boolean
            retries: $string(), // number[] -> string
            handler: $number(), // object -> number
        }),
    )
    .merge(
        $object({
            timeout: $array($string().datetime()), // boolean -> Date[]
            retries: $record($unknown()), // string -> Record<string, any>
            handler: $enum(['A', 'B', 'C']), // number -> enum
        }),
    )
