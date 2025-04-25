import { z } from 'zod'
import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'

const hrTable = $dynamodb.table({
    shape: z.object({
        pk: z.string(),
        sk: z.string(),
        // gsi1pk: z.string().optional(),
        // gsi1sk: z.string().optional(),
    }),
    pk: 'pk',
    sk: 'sk',
    indexes: {
        // gsi1: {
        //     pk: 'gsi1pk',
        //     sk: 'gsi1sk',
        // },
    },
})

// https://github.com/tywalch/electrodb/blob/49cc29c8c401870e23849de902faec05517d0cba/examples/taskManager/data.json

export const employee = hrTable.entity({
    shape: z.object({
        employee: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        office: z.string(),
        title: z.string(),
        team: z.enum(['development', 'marketing', 'finance', 'product']),
        salary: z.string(),
        manager: z.string(),
        dateHired: z.string(),
        birthday: z.string(),
    }),
    // indexes: {
    //     employee: {
    //         pk: 'pk',
    //         sk: 'sk',
    //     },
    //     coworkers: {
    //         index: 'gsi1pk-gsi1sk-index',
    //         pk: 'gsi1pk',
    //         sk: 'gsi1sk',
    //     },
    //     teams: {
    //         index: 'gsi2pk-gsi2sk-index',
    //         pk: 'gsi2pk',
    //         sk: 'gsi2sk',
    //     },
    //     employeeLookup: {
    //         index: 'gsi3pk-gsi3sk-index',
    //         pk: 'gsi3pk',
    //         sk: 'gsi3sk',
    //     },
    //     roles: {
    //         index: 'gsi4pk-gsi4sk-index',
    //         pk: 'gsi4pk',
    //         sk: 'gsi4sk',
    //     },
    //     directReports: {
    //         index: 'gsi5pk-gsi5sk-index',
    //         pk: 'gsi5pk',
    //         sk: 'gsi5sk',
    //     },
    // },
})

export const entity = hrTable.entity({
    shape: z.object({
        task: z.string(),
        project: z.string(),
        employee: z.string(),
        description: z.string(),
    }),
    // indexes: {
    //     task: {
    //         pk: 'pk',
    //         sk: 'sk',
    //     },
    //     project: {
    //         index: 'gsi1pk-gsi1sk-index',
    //         pk: 'gsi1pk',
    //         sk: 'gsi1sk',
    //     },
    //     assigned: {
    //         index: 'gsi3pk-gsi3sk-index',
    //         pk: 'gsi3pk',
    //         sk: 'gsi3sk',
    //     },
    // },
})

export const office = hrTable.entity({
    shape: z.object({
        office: z.string(),
        country: z.string(),
        state: z.string(),
        city: z.string(),
        zip: z.string(),
        address: z.string(),
    }),
    formatters: {
        pk: ({ country, state }) => `COUNTRY#${country}#STATE#${state}`,
        sk: ({ city, zip, office }) => `CITY#${city}#ZIP#${zip}#OFFICE#${office}`,
    },
    // indexes: {
    //     office: {
    //         index: 'gsi1pk-gsi1sk-index',
    //         pk: 'gsi1pk',
    //         sk: 'gsi1sk',
    //     },
    // },
})

// All tasks and employee information for a given employee
// Find all employees and office details for a given office
// Tasks for a given employee
// Tasks for a given project

// Find office locations
// on the service
// await EmployeeApp.entities.office
//   .locations({ country: "usa", state: "florida" })
//   .go();

// // on the entity
// await office.locations({ country: "usa", state: "florida" }).go();

export const getOfficeLocations = office.getItem()

// Find employee salaries and titles
// Find employee salaries and titles
// Find employee birthdays or anniversaries
// Find direct reports
