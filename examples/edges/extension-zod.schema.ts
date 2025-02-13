import { z } from 'zod'

export const userSchema = z.object({
    name: z.string(),
    age: z.number(),
})

export const userExtended = userSchema.extend({
    email: z.string().email(),
})

export const userMultipleExtended = userSchema
    .extend({
        email: z.string().email(),
    })
    .extend({
        phone: z.string(),
    })

export const addressSchema = z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
})

export const userMerged = userSchema.merge(addressSchema)
export const userMergedInlineRHS = userSchema.merge(
    z.object({
        street: z.string(),
        city: z.string(),
        country: z.string(),
    }),
)
export const userMergedInlineLHS = z
    .object({
        name: z.string(),
        age: z.number(),
    })
    .merge(addressSchema)
export const userMergedInlineLRHS = z
    .object({
        name: z.string(),
        age: z.number(),
    })
    .merge(
        z.object({
            street: z.string(),
            city: z.string(),
            country: z.string(),
        }),
    )

export const contactSchema = z.object({
    phone: z.string(),
    email: z.string().email(),
})

export const userMergedMultiple = userSchema
    .merge(addressSchema)
    .merge(
        z.object({
            interests: z.string(),
            theme: z.string(),
        }),
    )
    .merge(contactSchema)
    .merge(
        z.object({
            hobby: z.string(),
            favoriteColor: z.string(),
        }),
    )

export const userPick = userSchema.pick({ name: true })

export const userOmit = userSchema.omit({ age: true })

// Partial makes all or specific fields optional
export const userAllOptional = userSchema.partial()
export const userPartialFields = userSchema.partial({ name: true })
export const userMultiplePartialFields = userSchema.partial({ name: true, age: true })

// Required makes optional fields required
export const userWithOptionalField = z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email().optional(),
})

export const userAllRequired = userWithOptionalField.required()
export const userRequiredField = userWithOptionalField.required({ email: true })
export const userMultipleRequiredFields = userWithOptionalField
    .extend({
        phone: z.string().optional(),
    })
    .required({ email: true, phone: true })

// Strict mode validation
export const userStrict = userSchema.strict()

// Get object keys as enum
export const userKeys = userSchema.keyof()
export const inlineKeys = z
    .object({
        name: z.string(),
        age: z.number(),
    })
    .keyof()

export const userPickMultiple = userSchema.pick({ name: true, age: true })

export const userOmitMultiple = userMerged.omit({ name: true, age: true })

export const userMultipleChained = userSchema
    .extend({
        email: z.string().email(),
    })
    .pick({ name: true, age: true, email: true })
    .merge(contactSchema)
    .omit({ email: true }) // Remove duplicate email field from merge

// Examples of extend overwriting behavior with dramatic type changes
export const userWithPreferences = z.object({
    name: z.string(),
    preferences: z.object({
        theme: z.enum(['light', 'dark']),
        fontSize: z.number(),
    }),
    tags: z.array(z.string()),
})

export const userPreferencesOverwritten = userWithPreferences.extend({
    preferences: z.boolean(), // Completely changes from object to boolean
    tags: z.number(), // Completely changes from string[] to number
})

// Examples of merge overwriting behavior with dramatic type changes
export const profileWithDetails = z.object({
    userId: z.number(),
    details: z.array(z.string()),
    metadata: z.record(z.string(), z.number()),
})

export const overwrittenProfile = z.object({
    userId: z.string().uuid(), // Changes from number to string UUID
    details: z.boolean(), // Changes from string[] to boolean
    metadata: z.string().date(), // Changes from Record<string, number> to Date
    newField: z.array(z.number()),
})

export const mergedDramaticChanges = profileWithDetails.merge(overwrittenProfile) // Fields completely change types

// Multiple dramatic overwrites in chain
export const baseConfig = z.object({
    timeout: z.number(),
    retries: z.array(z.number()),
    handler: z.object({
        type: z.string(),
        enabled: z.boolean(),
    }),
})

export const withDramaticChanges = baseConfig
    .merge(
        z.object({
            timeout: z.boolean(), // number -> boolean
            retries: z.string(), // number[] -> string
            handler: z.number(), // object -> number
        }),
    )
    .merge(
        z.object({
            timeout: z.array(z.string().date()), // boolean -> Date[]
            retries: z.record(z.string(), z.any()), // string -> Record<string, any>
            handler: z.enum(['A', 'B', 'C']), // number -> enum
        }),
    )
