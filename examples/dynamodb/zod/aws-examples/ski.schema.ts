import { z } from 'zod'
import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.SampleModels.html#workbench.SampleModels.SkiResortDataModel
// https://aws.amazon.com/blogs/database/amazon-dynamodb-single-table-design-using-dynamodbmapper-and-spring-boot/
export const skiResortTable = $dynamodb.table({
    shape: z.object({
        Lift: z.string(),
        Metadata: z.string(),
        entityType: z.string(),
    }),
    pk: 'Lift',
    sk: 'Metadata',
    entityType: 'entityType',
    indexes: {
        SkiLiftsByRiders: {
            pk: 'Lift',
            sk: 'TotalUniqueLiftRiders',
            projectionType: 'INCLUDE',
            nonKeyAttributes: ['Metadata'],
        },
    },
    validator: 'zod',
})

export const skiLifts = skiResortTable.entity({
    entityType: 'SkiLift',
    shape: z.object({
        // Lift: z.string(),
        // Metadata: z.string(),
        TotalUniqueLiftRiders: z.number(),
        AverageSnowCoverageInches: z.number(),
        LiftStatus: z.enum(['Open', 'Pending', 'Closed']),
        AvalancheDanger: z.enum(['Low', 'Considerable', 'High', 'Extreme', 'Moderate']),
    }),
})

export const resorts = skiResortTable.entity({
    entityType: 'Resort',
    shape: z.object({
        TotalUniqueLiftRiders: z.number(),
        AverageSnowCoverageInches: z.number(),
        AvalancheDanger: z.enum(['Low', 'Considerable', 'High', 'Extreme', 'Moderate']),
        OpenLifts: z.set(z.number()),
    }),
})

export const staticData = skiResortTable.entity({
    entityType: 'StaticData',
    shape: z.object({
        // Lift: z.string(),
        // Metadata: z.string(),
        ExperiencedRidersOnly: z.boolean(),
        VerticalFeet: z.number(),
        LiftTime: z.string(),
    }),
})
