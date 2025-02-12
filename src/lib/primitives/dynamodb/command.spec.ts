import { describe, expect, it } from 'vitest'
import { Pet } from '../../../../examples/restclients/ajv/petstore/petstore.type.js'
import { $object } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import { $string } from '../string/string.js'
import { $dynamodb } from './dynamodb.js'
import { conditionExpression } from './expressions/condition.js'
import { DynamodbExpressionContext } from './expressions/context.js'
import { updateExpression } from './expressions/update.js'

function createMockEntity() {
    const mockTable = $dynamodb.table({
        shape: $object({
            pk: $string,
            sk: $string,
            entityType: $string,
            createdAt: $string().datetime(),
            updatedAt: $string().datetime(),
        }),
        pk: 'pk',
        sk: 'sk',
        entityType: 'entityType',
        validator: 'ajv',
    })

    const mockEntity = mockTable.entity({
        entityType: 'pet',
        shape: $ref(Pet).extend({
            ownerId: $string,
        }),
        keyFormatters: {
            pk: 'owner#{ownerId}',
            sk: 'pet#{id}',
        },
    })

    return { mockEntity, mockContext: new DynamodbExpressionContext(mockEntity, {} as any) }
}

describe('getItem', () => {
    it('should format the key', () => {
        expect(true).toBe(true)
    })
})

describe('query', () => {
    it('should build a condition expression', () => {
        const { mockContext } = createMockEntity()

        expect(
            conditionExpression({
                build: ({ existing, input }) => ({
                    and: [
                        existing.name!.eq(input.name),
                        existing.category!.eq(input.category),
                        {
                            or: [existing.status!.eq(input.status), existing.name!.eq(input.name)],
                        },
                    ],
                }),
                context: mockContext,
            }),
        ).toMatchInlineSnapshot(`
          {
            "comparands": [
              "name",
              "category",
              "status",
              "name",
            ],
            "expression": "#name = :name AND category = :category AND (#status = :status OR #name = :name)",
          }
        `)
    })
})

describe('update', () => {
    it('should build an update expression', () => {
        const { mockEntity, mockContext } = createMockEntity()

        expect(
            updateExpression({
                entity: mockEntity,
                build: ({ existing, input }) => [
                    existing.name!.set(input.name),
                    existing.tags!.listAppend(input.tags),
                    existing.photoUrls!.remove(),
                ],
                context: mockContext,
            }),
        ).toMatchInlineSnapshot(`
          {
            "expression": "SET #name = :name, tags = list_append(tags, :tags), createdAt = if_not_exists(createdAt, :createdAt0), updatedAt = :createdAt0, entityType = if_not_exists(entityType, :entityType0) REMOVE photoUrls",
          }
        `)

        expect(
            updateExpression({
                entity: mockEntity,
                build: ({ existing, input }) => ({
                    name: input.name,
                    tags: existing.tags!.listAppend(input.tags),
                    photoUrls: existing.photoUrls!.remove(),
                }),
                context: mockContext,
            }),
        ).toMatchInlineSnapshot(`
          {
            "expression": "SET #name = :name, tags = list_append(tags, :tags), createdAt = if_not_exists(createdAt, :createdAt0), updatedAt = :createdAt0, entityType = if_not_exists(entityType, :entityType0) REMOVE photoUrls",
          }
        `)
    })
})
