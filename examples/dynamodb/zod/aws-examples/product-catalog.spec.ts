import { DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { asyncCollect } from '@skyleague/axioms'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import type { z } from 'zod'
import { bookmarks, customerBookmarkTable, customers, type shape } from './bookmark.schema.js'
import { BicycleEntityClient, BookEntityClient, HomeImprovementEntityClient, ProductCatalog } from './product-catalog.client.js'
import { productCatalog } from './product-catalog.schema.js'
import type {
    BicycleEntity,
    GetBicycleProjectionResult,
    GetBookReservedKeywordsResult,
    GetBookSpecialCharactersResult,
} from './product-catalog.zod.js'

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
})

const booksSeed = [
    {
        Id: 101,
        Title: 'Book 101 Title',
        ISBN: '111-1111111111',
        Authors: ['Author1'],
        Price: 2,
        Dimensions: '8.5 x 11.0 x 0.5',
        PageCount: 500,
        InPublication: true,
        ProductCategory: 'Book' as const,
    },
    {
        Id: 102,
        Title: 'Book 102 Title',
        ISBN: '222-2222222222',
        Authors: ['Author1', 'Author2'],
        Price: 20,
        Dimensions: '8.5 x 11.0 x 0.8',
        PageCount: 600,
        InPublication: true,
        ProductCategory: 'Book' as const,
    },
    {
        Id: 103,
        Title: 'Book 103 Title',
        ISBN: '333-3333333333',
        Authors: ['Author1', 'Author2'],
        Price: 2000,
        Dimensions: '8.5 x 11.0 x 1.5',
        PageCount: 600,
        InPublication: false,
        ProductCategory: 'Book' as const,
    },
]
const bicyclesSeed = [
    {
        Id: 201,
        Title: '18-Bike-201',
        Description: '201 Description',
        BicycleType: 'Road',
        Brand: 'Mountain A',
        Price: 100,
        Color: ['Red', 'Black'],
        ProductCategory: 'Bicycle' as const,
        Dimensions: 'N/A',
    },
    {
        Id: 202,
        Title: '21-Bike-202',
        Description: '202 Description',
        BicycleType: 'Road',
        Brand: 'Brand-Company A',
        Price: 200,
        Color: ['Green', 'Black'],
        ProductCategory: 'Bicycle' as const,
        Dimensions: 'N/A',
    },
    {
        Id: 203,
        Title: '19-Bike-203',
        Description: '203 Description',
        BicycleType: 'Road',
        Brand: 'Brand-Company B',
        Price: 300,
        Color: ['Red', 'Green', 'Black'],
        ProductCategory: 'Bicycle' as const,
        Dimensions: 'N/A',
    },
    {
        Id: 204,
        Title: '18-Bike-204',
        Description: '204 Description',
        BicycleType: 'Mountain',
        Brand: 'Brand-Company B',
        Price: 400,
        Color: ['Red'],
        ProductCategory: 'Bicycle' as const,
        Dimensions: 'N/A',
    },
    {
        Id: 205,
        Title: '18-Bike-204',
        Description: '205 Description',
        BicycleType: 'Hybrid',
        Brand: 'Brand-Company C',
        Price: 500,
        Color: ['Red', 'Black'],
        ProductCategory: 'Bicycle' as const,
        Dimensions: 'N/A',
    },
]

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
    const table = new ProductCatalog({
        client,
        tableName: 'ProductCatalog',
    })
    const bookClient = new BookEntityClient({ table })
    const bicycleClient = new BicycleEntityClient({ table })
    const homeImprovementClient = new HomeImprovementEntityClient({ table })

    const seedBooks = async () => {
        for (const book of booksSeed) {
            const result = await bookClient.createBookCommand(book)
            if (result.left) {
                throw new Error(`Failed to create book ${book.Id}: ${result.left.message}`)
            }
        }
    }
    const seedBicycles = async () => {
        for (const bicycle of bicyclesSeed) {
            const result = await bicycleClient.createBicycleCommand(bicycle)
            if (result.left) {
                throw new Error(`Failed to create bicycle ${bicycle.Id}: ${result.left.message}`)
            }
        }
    }

    beforeEach(async () => {
        await productCatalog.createIfNotExists({
            client,
            tableName: 'ProductCatalog',
        })
    })

    afterEach(async () => {
        await client.send(new DeleteTableCommand({ TableName: 'ProductCatalog' }))
    })

    it('should create a bicycle with additional optional fields', async () => {
        const bicycleResult = await bicycleClient.createBicycleCommand({
            Id: 123,
            Title: 'Bicycle 123',
            Description: '123 description',
            BicycleType: 'Hybrid',
            Brand: 'Brand-Company C',
            Price: 500,
            Color: ['Red', 'Black'],
            ProductCategory: 'Bicycle',
            Dimensions: 'N/A',
            InStock: true,
            QuantityOnHand: null,
            RelatedItems: [341, 472, 649],
            Pictures: {
                FrontView: 'http://example.com/products/123_front.jpg',
                RearView: 'http://example.com/products/123_rear.jpg',
                SideView: 'http://example.com/products/123_left_side.jpg',
            },
            ProductReviews: {
                FiveStar: ["Excellent! Can't recommend it highly enough! Buy it!", 'Do yourself a favor and buy this.'],
                OneStar: ['Terrible product! Do not buy this.'],
            },
            Comment: 'This product sells out quickly during the summer',
            'Safety.Warning': 'Always wear a helmet',
        })
        if (bicycleResult.left) {
            throw new Error(`Failed to create bicycle 123: ${bicycleResult.left.message}`)
        }

        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
        const result = await bookClient.getBookReservedKeywordsCommand({
            Id: 123,
        })
        expect(result.right).toEqual({ Comment: 'This product sells out quickly during the summer' })
        expect(result.$response.$metadata.httpStatusCode).toEqual(200)

        if (result.right) {
            expectTypeOf(result.right).toEqualTypeOf<{ Comment?: string | undefined }>()
            expectTypeOf(result.right).toEqualTypeOf<z.infer<typeof GetBookReservedKeywordsResult>>()
        }
    })

    it('should create a bicycle with additional optional fields', async () => {
        // Create a bicycle with additional optional fields to test full schema support
        const bicycleResult = await bicycleClient.createBicycleCommand({
            Id: 123,
            Title: 'Bicycle 123',
            Description: '123 description',
            BicycleType: 'Hybrid',
            Brand: 'Brand-Company C',
            Price: 500,
            Color: ['Red', 'Black'],
            ProductCategory: 'Bicycle',
            Dimensions: 'N/A',
            InStock: true,
            QuantityOnHand: null,
            RelatedItems: [341, 472, 649],
            Pictures: {
                FrontView: 'http://example.com/products/123_front.jpg',
                RearView: 'http://example.com/products/123_rear.jpg',
                SideView: 'http://example.com/products/123_left_side.jpg',
            },
            ProductReviews: {
                FiveStar: ["Excellent! Can't recommend it highly enough! Buy it!", 'Do yourself a favor and buy this.'],
                OneStar: ['Terrible product! Do not buy this.'],
            },
            Comment: 'This product sells out quickly during the summer',
            'Safety.Warning': 'Always wear a helmet',
        })
        if (bicycleResult.left) {
            throw new Error(`Failed to create bicycle 123: ${bicycleResult.left.message}`)
        }

        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html#Expressions.ExpressionAttributeNames.AttributeNamesContainingSpecialCharacters
        const result = await bookClient.getBookSpecialCharactersCommand({
            Id: 123,
        })
        expect(result.right).toEqual({ 'Safety.Warning': 'Always wear a helmet' })
        expect(result.$response.$metadata.httpStatusCode).toEqual(200)

        if (result.right) {
            expectTypeOf(result.right).toEqualTypeOf<{ 'Safety.Warning'?: string | undefined }>()
            expectTypeOf(result.right).toEqualTypeOf<z.infer<typeof GetBookSpecialCharactersResult>>()
        }
    })

    //@TODO
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html

    it('should get products by colour and price', async () => {
        await seedBooks()
        await seedBicycles()

        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeValues.html
        const results = await asyncCollect(
            bicycleClient.getProductsByColourAndPriceCommand({
                price: 500,
                color: 'Black',
            }),
        )
        expect(
            results.sort((a, b) => {
                // Safely compare IDs by ensuring they exist
                const idA = a.right?.Id ?? 0
                const idB = b.right?.Id ?? 0
                return idA - idB
            }),
        ).toEqual([
            {
                success: true,
                right: {
                    Id: 201,
                    Title: '18-Bike-201',
                    Price: 100,
                    Dimensions: 'N/A',
                    ProductCategory: 'Bicycle',
                    Description: '201 Description',
                    BicycleType: 'Road',
                    Brand: 'Mountain A',
                    Color: ['Red', 'Black'],
                },
                $response: expect.any(Object),
            },
            {
                success: true,
                right: {
                    Id: 202,
                    Title: '21-Bike-202',
                    Price: 200,
                    Dimensions: 'N/A',
                    ProductCategory: 'Bicycle',
                    Description: '202 Description',
                    BicycleType: 'Road',
                    Brand: 'Brand-Company A',
                    Color: ['Green', 'Black'],
                },
                $response: expect.any(Object),
            },
            {
                success: true,
                right: {
                    Id: 203,
                    Title: '19-Bike-203',
                    Price: 300,
                    Dimensions: 'N/A',
                    ProductCategory: 'Bicycle',
                    Description: '203 Description',
                    BicycleType: 'Road',
                    Brand: 'Brand-Company B',
                    Color: ['Red', 'Green', 'Black'],
                },
                $response: expect.any(Object),
            },
            {
                success: true,
                right: {
                    Id: 205,
                    Title: '18-Bike-204',
                    Price: 500,
                    Dimensions: 'N/A',
                    ProductCategory: 'Bicycle',
                    Description: '205 Description',
                    BicycleType: 'Hybrid',
                    Brand: 'Brand-Company C',
                    Color: ['Red', 'Black'],
                },
                $response: expect.any(Object),
            },
        ])

        if (results[0]?.right) {
            expectTypeOf(results[0].right).toEqualTypeOf<z.infer<typeof BicycleEntity>>()
        }
    })

    it('gets the item with the correct projection', async () => {
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
        const bicycleResult = await bicycleClient.createBicycleCommand({
            Id: 123,
            Title: 'Bicycle 123',
            Description: '123 description',
            BicycleType: 'Hybrid',
            Brand: 'Brand-Company C',
            Price: 500,
            Color: ['Red', 'Black'],
            ProductCategory: 'Bicycle',
            Dimensions: 'N/A',
            InStock: true,
            QuantityOnHand: null,
            RelatedItems: [341, 472, 649],
            Pictures: {
                FrontView: 'http://example.com/products/123_front.jpg',
                RearView: 'http://example.com/products/123_rear.jpg',
                SideView: 'http://example.com/products/123_left_side.jpg',
            },
            ProductReviews: {
                FiveStar: ["Excellent! Can't recommend it highly enough! Buy it!", 'Do yourself a favor and buy this.'],
                OneStar: ['Terrible product! Do not buy this.'],
            },
            Comment: 'This product sells out quickly during the summer',
            'Safety.Warning': 'Always wear a helmet',
        })
        if (bicycleResult.left) {
            throw new Error(`Failed to create bicycle 123: ${bicycleResult.left.message}`)
        }

        const result = await bicycleClient.getBicycleProjectionCommand({
            Id: 123,
        })
        expect(result.right).toEqual({
            Description: '123 description',
        })
        expect(result.$response.$metadata.httpStatusCode).toEqual(200)

        if (result.right) {
            expectTypeOf(result.right).toEqualTypeOf<{ Description: string }>()
            expectTypeOf(result.right).toEqualTypeOf<z.infer<typeof GetBicycleProjectionResult>>()
        }
    })

    it('creates a home improvement item', async () => {
        const result = await homeImprovementClient.createHomeImprovementCommand({
            Id: 789,
            ProductCategory: 'Home Improvement',
            Price: 52,
            InStock: true,
            Title: 'Home Improvement 789',
        })
        if (result.left) {
            throw new Error(`Failed to create home improvement 789: ${result.left.message}`)
        }

        expect(result.right).toEqual(undefined)
        expect(result.$response.$metadata.httpStatusCode).toEqual(200)
    })

    it('updates a home improvement item', async () => {
        const result = await homeImprovementClient.createHomeImprovementCommand({
            Id: 789,
            ProductCategory: 'Home Improvement',
            Price: 52,
            InStock: true,
            Title: 'Home Improvement 789',
        })
        if (result.left) {
            throw new Error(`Failed to create home improvement 789: ${result.left.message}`)
        }

        const updateResult = await homeImprovementClient.updateHomeImprovementCommand({
            Id: 789,
            ProductCategory: 'Home Improvement',
            Price: 52,
        })

        expect(result.right).toEqual(undefined)
        expect(result.$response.$metadata.httpStatusCode).toEqual(200)
    })
})
