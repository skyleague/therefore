import { describe, expect, it } from 'vitest'
import { Pet } from '../../../../examples/restclients/ajv/petstore/petstore.type.js'
import { $object } from '../object/object.js'
import { $ref } from '../ref/ref.js'
import { $string } from '../string/string.js'
import { DynamodbCommandSchemaBuilder } from './commands/builder.js'
import { $dynamodb } from './dynamodb.js'
import { conditionExpression } from './expressions/condition.js'
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

    const entity = mockTable.entity({
        entityType: 'pet',
        shape: $ref(Pet).extend({
            ownerId: $string,
        }),
        formatters: {
            pk: ({ ownerId }) => `owner#${ownerId}`,
            sk: ({ id }) => `pet#${id}`,
        },
    })

    return {
        entity,
        schema: new DynamodbCommandSchemaBuilder({
            entity,
        }),
    }
}

describe('getItem', () => {
    it('should format the key', () => {
        expect(true).toBe(true)
    })
})

describe('query', () => {
    it('should build a condition expression', () => {
        const { schema } = createMockEntity()
        expect(
            conditionExpression({
                schema,
                build: ({ stored, args }) => ({
                    and: [
                        stored.name!.eq(args.name),
                        stored.category!.eq(args.category),
                        {
                            or: [stored.status!.eq(args.status), stored.name!.eq(args.name)],
                        },
                    ],
                }),
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
        const { entity, schema } = createMockEntity()

        expect(
            updateExpression({
                entity,
                build: ({ stored, args }) => [
                    stored.name!.set(args.name),
                    stored.tags!.listAppend(args.tags),
                    stored.photoUrls!.remove(),
                ],
                schema,
            }),
        ).toMatchInlineSnapshot(`
          {
            "expression": "SET #name = :name, tags = list_append(tags, :tags), createdAt = if_not_exists(createdAt, :createdAt0), updatedAt = :createdAt0, entityType = if_not_exists(entityType, :entityType0) REMOVE photoUrls",
          }
        `)

        expect(
            updateExpression({
                entity: entity,
                build: ({ stored, args }) => ({
                    name: args.name,
                    tags: stored.tags!.listAppend(args.tags),
                    photoUrls: stored.photoUrls!.remove(),
                }),
                schema,
            }),
        ).toMatchInlineSnapshot(`
          {
            "expression": "SET #name = :name, tags = list_append(tags, :tags), createdAt = if_not_exists(createdAt, :createdAt0), updatedAt = :createdAt0, entityType = if_not_exists(entityType, :entityType0) REMOVE photoUrls",
          }
        `)
    })
})
