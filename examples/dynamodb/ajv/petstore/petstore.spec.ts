import { expectTypeOf, it } from 'vitest'
import type { ArrayType } from '../../../../src/lib/primitives/array/array.js'
import type { DynamoDbEntityType } from '../../../../src/lib/primitives/dynamodb/entity.js'
import type { DynamoDbTableType } from '../../../../src/lib/primitives/dynamodb/table.js'
import type { EnumType } from '../../../../src/lib/primitives/enum/enum.js'
import type { NumberType } from '../../../../src/lib/primitives/number/number.js'
import type { ObjectType } from '../../../../src/lib/primitives/object/object.js'
import type { OptionalType } from '../../../../src/lib/primitives/optional/optional.js'
import type { StringType } from '../../../../src/lib/primitives/string/string.js'
import { pet, petDataTable } from './petstore.schema.js'

it('has the correct table type', () => {
    expectTypeOf(petDataTable).toEqualTypeOf<
        DynamoDbTableType<
            ObjectType<{
                pk: StringType
                sk: StringType
                entityType: StringType
                createdAt: StringType
                updatedAt: StringType
            }>,
            {
                shape: ObjectType<{
                    pk: StringType
                    sk: StringType
                    entityType: StringType
                    createdAt: StringType
                    updatedAt: StringType
                }>
                pk: 'pk'
                sk: 'sk'
                entityType: 'entityType'
                indexes: {
                    'sk-pk-index': {
                        pk: string
                        sk: string
                        projectionType: 'INCLUDE'
                        nonKeyAttributes: string[]
                    }
                }
                validator: 'ajv'
            }
        >
    >()
})

it('has the correct pet entity type', () => {
    expectTypeOf(pet).toEqualTypeOf<
        DynamoDbEntityType<
            ObjectType<{
                category: OptionalType<
                    ObjectType<{
                        id: OptionalType<NumberType>
                        name: OptionalType<StringType>
                    }>
                >
                id: OptionalType<NumberType>
                name: StringType
                photoUrls: ArrayType<StringType>
                status: OptionalType<EnumType<('available' | 'pending' | 'sold')[]>>
                tags: OptionalType<
                    ArrayType<
                        ObjectType<{
                            id: OptionalType<NumberType>
                            name: OptionalType<StringType>
                        }>
                    >
                >
                ownerId: StringType
            }>,
            'pet',
            DynamoDbTableType<
                ObjectType<{
                    pk: StringType
                    sk: StringType
                    entityType: StringType
                    createdAt: StringType
                    updatedAt: StringType
                }>,
                {
                    shape: ObjectType<{
                        pk: StringType
                        sk: StringType
                        entityType: StringType
                        createdAt: StringType
                        updatedAt: StringType
                    }>
                    pk: 'pk'
                    sk: 'sk'
                    entityType: 'entityType'
                    indexes: {
                        'sk-pk-index': {
                            pk: string
                            sk: string
                            projectionType: 'INCLUDE'
                            nonKeyAttributes: string[]
                        }
                    }
                    validator: 'ajv'
                }
            >
        >
    >()
})
