import { z } from 'zod'
import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'

const picturesShape = z.object({
    FrontView: z.string().url(),
    RearView: z.string().url(),
    SideView: z.string().url(),
})

const productReviewsShape = z.object({
    FiveStar: z.array(z.string()),
    OneStar: z.array(z.string()),
})

export const productCatalog = $dynamodb.table({
    shape: z.object({
        Id: z.number(),
        Price: z.number(),
        ProductCategory: z.enum(['Book', 'Bicycle', 'Home Improvement']),

        Title: z.string().optional(),
        Dimensions: z.string().optional(),

        // From documention
        InStock: z.boolean().optional(),
        QuantityOnHand: z.number().nullable().optional(),
        RelatedItems: z.array(z.number()).optional(),
        Pictures: picturesShape.optional(),
        ProductReviews: productReviewsShape.optional(),
        Comment: z.string().optional(),
        'Safety.Warning': z.string().optional(),
    }),
    pk: 'Id',
})

export const book = productCatalog.entity({
    shape: z.object({
        ISBN: z.string(),
        Authors: z.array(z.string()),
        PageCount: z.number(),
        InPublication: z.boolean(),
        ProductCategory: z.literal('Book'),
    }),
})

export const bicycle = productCatalog.entity({
    shape: z.object({
        Description: z.string(),
        BicycleType: z.string(),
        Brand: z.string(),
        Color: z.array(z.string()),
        ProductCategory: z.literal('Bicycle'),
    }),
})

export const createBook = book.putItem()
export const createBicycle = bicycle.putItem()

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
export const getBookReservedKeywords = book.getItem({
    projection: ({ stored: { Comment } }) => [Comment],
})

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
export const getBookSpecialCharacters = book.getItem({
    projection: ({ stored: { 'Safety.Warning': warning } }) => [warning],
})

//@TODO
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeValues.html
export const getProductsByColourAndPrice = bicycle.scan({
    filter: ({ stored: { Color, Price }, args }) => ({
        and: [Color.contains(args.color), Price.lte(args.price)],
    }),
})

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
// aws dynamodb get-item \
//     --table-name ProductCatalog \
//     --key '"Id": { "N": "123" } \
//     --projection-expression "Description, RelatedItems[0], ProductReviews.FiveStar"
export const getBicycleProjection = bicycle.getItem({
    projection: ({ stored: { Description, RelatedItems, ProductReviews } }) => [
        Description,
        // @TODO
        // RelatedItems.at(0),
        // ProductReviews.shape.FiveStar,
    ],
})

// aws dynamodb put-item \
//     --table-name ProductCatalog \
//     --item file://item.json
// {
//     "Id": {"N": "789"},
//     "ProductCategory": {"S": "Home Improvement"},
//     "Price": {"N": "52"},
//     "InStock": {"BOOL": true},
//     "Brand": {"S": "Acme"}
// }

export const homeImprovement = productCatalog.entity({
    shape: z.object({
        ProductCategory: z.literal('Home Improvement'),
    }),
})

export const createHomeImprovement = homeImprovement.putItem()

// aws dynamodb update-item \
//     --table-name ProductCatalog \
//     --key '{"Id":{"N":"789"}}' \
//     --update-expression "SET ProductCategory = :c, Price = :p" \
//     --expression-attribute-values file://values.json \
//     --return-values ALL_NEW

export const updateHomeImprovement = homeImprovement.updateItem({
    update: ({ args }) => ({
        ProductCategory: args.ProductCategory,
        Price: args.Price,
    }),
})

export const getHomeImprovement = homeImprovement.getItem()
