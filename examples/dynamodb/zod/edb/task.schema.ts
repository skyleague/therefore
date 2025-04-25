import { z } from 'zod'
import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'
import { Employee, Office, Task } from './task.js'

export const taskManagerTable = $dynamodb.table({
    shape: z.object({
        pk: z.string(),
        sk: z.string(),

        gsi1pk: z.string().optional(),
        gsi1sk: z.string().optional(),

        gsi2pk: z.string().optional(),
        gsi2sk: z.string().optional(),

        gsi3pk: z.string().optional(),
        gsi3sk: z.string().optional(),

        gsi4pk: z.string().optional(),
        gsi4sk: z.string().optional(),

        gsi5pk: z.string().optional(),
        gsi5sk: z.string().optional(),
    }),
    pk: 'pk',
    sk: 'sk',
    indexes: {
        gsi1: {
            pk: 'gsi1pk',
            sk: 'gsi1sk',
            projectionType: 'ALL',
        },
        gsi2: {
            pk: 'gsi2pk',
            sk: 'gsi2sk',
            projectionType: 'ALL',
        },
        gsi3: {
            pk: 'gsi3pk',
            sk: 'gsi3sk',
            projectionType: 'ALL',
        },
        gsi4: {
            pk: 'gsi4pk',
            sk: 'gsi4sk',
            projectionType: 'ALL',
        },
        gsi5: {
            pk: 'gsi5pk',
            sk: 'gsi5sk',
            projectionType: 'ALL',
        },
    },
})

// https://github.com/tywalch/electrodb/blob/49cc29c8c401870e23849de902faec05517d0cba/examples/taskManager/data.json

export const office = taskManagerTable.entity({
    shape: Office,
    formatters: {
        pk: ({ country, state }) => `country#${country}#state#${state}`,
        sk: ({ city, zip, officeName }) => `city#${city}#zip#${zip}#officeName#${officeName}`,
    },
})

export const createOffice = office.putItem()

export const employee = taskManagerTable.entity({
    shape: Employee,
    formatters: {
        pk: ({ employee }) => `employee#${employee}`,
        sk: () => 'organization#user_1',
        // gsi1pk: ({ office }) => `${office}`,
        // gsi1sk: ({ team, title, employee }) => `${team}#${title}#${employee}`,

        gsi1pk: ({ officeName }) => `officename#${officeName}`,
        gsi1sk: ({ team, title, employee }) => `team#${team}#title#${title}#employee#${employee}`,

        gsi2pk: ({ team }) => `team#${team}`,
        gsi2sk: ({ dateHired, title }) => `datehired#${dateHired}#title#${title}`,

        gsi3pk: ({ employee }) => `employee#${employee}`,
        gsi3sk: () => `TODOO`,

        gsi4pk: ({ title }) => `title#${title}`,
        gsi4sk: ({ salary }) => `salary#${salary}`,

        gsi5pk: ({ manager }) => `manager#${manager}`,
        gsi5sk: ({ team, officeName }) => `team#${team}#officename#${officeName}`,
    },
    // indexes: {
    //     // The teams index requires gsi2pk and gsi2sk
    //     teams: {
    //         pk: ({ team }) => `${team}`,
    //         sk: ({ dateHired, title }) => `${dateHired}#${title}`,
    //     },
    //     // The employeeLookup index requires gsi3pk and gsi3sk
    //     employeeLookup: {
    //         pk: ({ employee }) => `${employee}`,
    //         sk: () => '',
    //     },
    //     // The roles index requires gsi4pk and gsi4sk
    //     roles: {
    //         pk: ({ title }) => `${title}`,
    //         sk: ({ salary }) => `${salary}`,
    //     },
    //     // The directReports index requires gsi5pk and gsi5sk
    //     directReports: {
    //         pk: ({ manager }) => `${manager}`,
    //         sk: ({ team, office }) => `${team}#${office}`,
    //     },
    // },
    // collections: {
    //     workplaces: {
    //         index: 'gsi1',
    //     },
    //     assignments: {
    //         index: 'employeeLookup',
    //     },
    // },
})

export const createEmployee = employee.putItem()

export const task = taskManagerTable.entity({
    shape: Task,
    formatters: {
        pk: ({ task }) => `${task}`,
        sk: ({ project, employee }) => `${project}#${employee}`,
        // gsi1pk: ({ project }) => `${project}`,
        // gsi1sk: ({ employee, status }) => `${employee}#${status}`,
        // gsi3pk: ({ employee }) => `${employee}`,
        // gsi3sk: ({ project, status }) => `${project}#${status}`,
        // gsi4pk: ({ status }) => `${status}`,
        // gsi4sk: ({ project, employee }) => `${project}#${employee}`,
    },
    // indexes: {
    //     project: {
    //         pk: ({ project }) => `${project}`,
    //         sk: ({ employee, status }) => `${employee}#${status}`,
    //     },
    //     assigned: {
    //         pk: ({ employee }) => `${employee}`,
    //         sk: ({ project, status }) => `${project}#${status}`,
    //     },
    //     statuses: {
    //         pk: ({ status }) => `${status}`,
    //         sk: ({ project, employee }) => `${project}#${employee}`,
    //     },
    // },
    // collections: {
    //     assignments: {
    //         index: 'assigned',
    //     },
    // },
})

export const createTask = task.putItem()

// Find Junior Developers making more than 100,000
export const getJuniorDevelopers = employee.queryIndex('gsi4', {
    // filter: ({ stored }) => ({
    //     and: [stored.title.eq('Junior Developer'), stored.salary.gt(100000)],
    // }),
    key: ({ stored, args, formatters }) => ({
        // and: [formatters.pk(stored).eq('title#Junior Developer'), formatters.sk(stored).gt(100000)],
        and: [
            stored.gsi4pk.eq(formatters.gsi4pk({ title: 'Junior Developer' })),
            // this is how the exmaple works, but that is not correct
            // as it will sort lexicographically, not numerically
            // stored.gsi4sk.gt(formatters.gsi4sk({ salary: 100000 })),
        ],
    }),
    filter: ({ stored }) => stored.salary.gt(100000),
})

// Find all open tasks for a given project less than or equal to 13 points
