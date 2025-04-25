import { z } from 'zod'
import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'

// https://aws.amazon.com/blogs/database/data-modeling-with-nosql-workbench-for-amazon-dynamodb/

export const shape = z.object({
    customerId: z.string(),
    sk: z.string(),
    creationDate: z.string(),
    updateDate: z.string(),

    // entityType: z.string(),
})

export const customerBookmarkTable = $dynamodb.table({
    shape,
    pk: 'customerId',
    sk: 'sk',
    entityType: undefined,
    createdAt: 'creationDate',
    updatedAt: 'updateDate',
    // entityType: 'entityType',
    indexes: {
        ByEmail: {
            pk: 'email',
            projectionType: 'ALL',
        },
        ByUrl: {
            pk: 'url',
            sk: 'customerId',
            projectionType: 'ALL',
        },
        ByCustomerFolder: {
            pk: 'customerId',
            sk: 'folder',
            projectionType: 'ALL',
        },
    },
    validator: 'zod',
})

export const customers = customerBookmarkTable.entity({
    // entityType: 'customer',
    shape: z.object({
        email: z.string().email(),
        fullName: z.string(),
        userPreferences: z.any(),
    }),
    formatters: {
        pk: ({ customerId }) => customerId,
        sk: ({ customerId }) => `CUST#${customerId}`,
    },
})

export const createCustomer = customers.putItem({
    condition: ({ stored }) => stored.customerId.notExists(),
})

export const getCustomer = customers.getItem()

export const bookmarks = customerBookmarkTable.entity({
    // entityType: 'bookmark',
    shape: z.object({
        url: z.string(),
        folder: z.string(),
        title: z.string(),
        description: z.string().optional(),
    }),
})
