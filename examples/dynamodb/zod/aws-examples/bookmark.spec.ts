import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { describe, expect, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import { CustomerBookmarkTable, CustomersEntityClient } from './bookmark.client.js'
import { bookmarks, customerBookmarkTable, customers, type shape } from './bookmark.schema.js'
import type { CustomersEntity } from './bookmark.zod.js'

describe('Bookmark DynamoDB Integration', () => {
    it('has the correct types', () => {
        expectTypeOf(customerBookmarkTable.infer).toEqualTypeOf<z.infer<typeof shape>>()
        expectTypeOf(customerBookmarkTable.definition.pk).toEqualTypeOf<'customerId'>()
        expectTypeOf(customerBookmarkTable.definition.sk).toEqualTypeOf<'sk'>()
        expectTypeOf(customerBookmarkTable.definition.createdAt).toEqualTypeOf<'creationDate'>()
        expectTypeOf(customerBookmarkTable.definition.updatedAt).toEqualTypeOf<'updateDate'>()
        expectTypeOf(customerBookmarkTable.definition.entityType).toEqualTypeOf<undefined>()
        expectTypeOf(customerBookmarkTable.definition.indexes).toEqualTypeOf<{
            readonly ByEmail: {
                readonly pk: 'email'
                readonly projectionType: 'ALL'
            }
            readonly ByUrl: {
                readonly pk: 'url'
                readonly sk: 'customerId'
                readonly projectionType: 'ALL'
            }
            readonly ByCustomerFolder: {
                readonly pk: 'customerId'
                readonly sk: 'folder'
                readonly projectionType: 'ALL'
            }
        }>()
        expectTypeOf(customerBookmarkTable.definition.validator).toEqualTypeOf<'zod' | 'ajv'>()

        expectTypeOf(customers.entityType).toEqualTypeOf<undefined>()
        expectTypeOf(bookmarks.entityType).toEqualTypeOf<undefined>()
    })

    it('should create a customer', async () => {
        // Set up DynamoDB client pointing to local instance
        const client = DynamoDBDocument.from(
            new DynamoDBClient({
                endpoint: 'http://localhost:8000', // Default port for local DynamoDB
                region: 'local-env',
                credentials: {
                    accessKeyId: 'fakeAccessKey',
                    secretAccessKey: 'fakeSecretKey',
                },
            }),
        )

        // Initialize table and entity client
        const table = new CustomerBookmarkTable({
            client,
            tableName: 'CustomerBookmark',
        })

        const customersClient = new CustomersEntityClient({ table })

        // Create test customer with random ID
        const customerId = '54321'
        const result = await customersClient.createCustomerCommand({
            customerId,
            email: 'test@example.com',
            fullName: 'Test User',
            userPreferences: { theme: 'dark' },
        })

        // Verify successful creation
        expect(result.left).toBeUndefined()
        expect(result.right).toBeNull()
        expect(result.$response).toBeDefined()
    })

    it('should get a customer', async () => {
        // Set up DynamoDB client pointing to local instance
        const client = DynamoDBDocument.from(
            new DynamoDBClient({
                endpoint: 'http://localhost:8000',
                region: 'local-env',
                credentials: {
                    accessKeyId: 'fakeAccessKey',
                    secretAccessKey: 'fakeSecretKey',
                },
            }),
        )

        // Initialize table and entity client
        const table = new CustomerBookmarkTable({
            client,
            tableName: 'CustomerBookmark',
        })

        const customersClient = new CustomersEntityClient({ table })

        // First create a customer to retrieve
        const customerId = '12345'
        await customersClient.createCustomerCommand({
            customerId,
            email: 'get-test@example.com',
            fullName: 'Get Test User',
            userPreferences: { notifications: true },
        })

        // Now retrieve the customer
        const result = await customersClient.getCustomerCommand({
            customerId,
        })
        if ('right' in result) {
            expectTypeOf(result.right).toEqualTypeOf<CustomersEntity | undefined>()
        }

        // Verify successful retrieval with correct data
        expect(result.left).toBeUndefined()
        expect(result.right).toEqual({
            customerId,
            sk: `CUST#${customerId}`,
            creationDate: expect.any(String),
            updateDate: expect.any(String),
            entityType: 'customer',
            email: 'get-test@example.com',
            fullName: 'Get Test User',
        })
    })
})
