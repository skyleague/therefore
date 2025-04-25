import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { beforeEach, describe, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import { EmployeeEntityClient, OfficeEntityClient, TaskManagerTable } from './task.client.js'
import { Employee, Office } from './task.js'
import { taskManagerTable } from './task.schema.js'

describe('Bookmark DynamoDB Integration', () => {
    it('has the correct types', () => {
        expectTypeOf(taskManagerTable.infer).toEqualTypeOf<z.infer<typeof shape>>()
        expectTypeOf(taskManagerTable.definition.pk).toEqualTypeOf<'customerId'>()
        expectTypeOf(taskManagerTable.definition.sk).toEqualTypeOf<'sk'>()
        expectTypeOf(taskManagerTable.definition.createdAt).toEqualTypeOf<'creationDate'>()
        expectTypeOf(taskManagerTable.definition.updatedAt).toEqualTypeOf<'updateDate'>()
        expectTypeOf(taskManagerTable.definition.entityType).toEqualTypeOf<undefined>()
        expectTypeOf(taskManagerTable.definition.indexes).toEqualTypeOf<{
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
        expectTypeOf(taskManagerTable.definition.validator).toEqualTypeOf<'zod' | 'ajv'>()

        expectTypeOf(customers.entityType).toEqualTypeOf<undefined>()
        expectTypeOf(bookmarks.entityType).toEqualTypeOf<undefined>()
    })
})

const taskManagerData = await (async (): any => {
    const response = await fetch(
        'https://raw.githubusercontent.com/tywalch/electrodb/49cc29c8c401870e23849de902faec05517d0cba/examples/taskManager/data.json',
    )
    return await response.json()
})()

describe('ProductCatalog DynamoDB Integration', () => {
    const ddb = new DynamoDBClient({
        endpoint: 'http://localhost:8000',
        region: 'local-env',
        credentials: {
            accessKeyId: 'fakeAccessKey',
            secretAccessKey: 'fakeSecretKey',
        },
    })
    const client = DynamoDBDocument.from(ddb)
    const table = new TaskManagerTable({
        client,
        tableName: 'TaskManager',
    })
    const officeClient = new OfficeEntityClient({ table })
    const employeeClient = new EmployeeEntityClient({ table })

    const seedOffices = async () => {
        for (const book of taskManagerData.offices) {
            const result = await officeClient.createOfficeCommand(Office.parse(book))
            if (result.left) {
                throw new Error(`Failed to create book ${book.Id}: ${result.left.message}`)
            }
        }
    }

    const seedEmployees = async () => {
        for (const employee of taskManagerData.employees) {
            const result = await employeeClient.createEmployeeCommand(Employee.parse(employee))
            if (result.left) {
                throw new Error(`Failed to create employee ${employee.Id}: ${result.left.message}`)
            }
        }
    }

    beforeEach(async () => {
        await taskManagerTable.createIfNotExists({
            client,
            tableName: 'TaskManager',
        })
    })

    // afterEach(async () => {
    //     await client.send(new DeleteTableCommand({ TableName: 'TaskManager' }))
    // })

    it('should create a bicycle with additional optional fields', async () => {
        await seedOffices()
        await seedEmployees()
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
        // const result = await bookClient.getBookReservedKeywordsCommand({
        //     Id: 123,
        // })
        // expect(result.right).toEqual({ Comment: 'This product sells out quickly during the summer' })
        // expect(result.$response.$metadata.httpStatusCode).toEqual(200)

        // if (result.right) {
        //     expectTypeOf(result.right).toEqualTypeOf<{ Comment?: string | undefined }>()
        //     expectTypeOf(result.right).toEqualTypeOf<z.infer<typeof GetBookReservedKeywordsResult>>()
        // }
    })
})
