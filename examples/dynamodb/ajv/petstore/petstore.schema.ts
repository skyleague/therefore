import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'
import { $object } from '../../../../src/lib/primitives/object/object.js'
import { $ref } from '../../../../src/lib/primitives/ref/ref.js'
import { $string } from '../../../../src/lib/primitives/string/string.js'
import { Pet } from '../../../restclients/ajv/petstore/petstore.type.js'

export const petDataTable = $dynamodb.table({
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
    indexes: {
        'sk-pk-index': {
            pk: 'sk',
            sk: 'pk',
            projectionType: 'INCLUDE',
            nonKeyAttributes: ['category'],
        },
    },
    validator: 'ajv',
})

export const pet = petDataTable.entity({
    entityType: 'pet',
    shape: $ref(Pet).extend({
        ownerId: $string,
    }),
    keyFormatters: {
        pk: 'owner#{ownerId}',
        sk: 'pet#{id}',
    },
})

export const updatePetName = pet.updateItem({
    condition: ({ existing }) => existing.sk.exists(),
    update: ({ existing, input }) => ({
        name: existing.name.ifNotExists(input.name),
    }),
})
export const upsertPetName = pet.updateItem({
    update: ({ existing, input }) => ({
        name: existing.name.ifNotExists(input.name),
    }),
})

export const updatePetName1 = pet
    .updateItem({
        condition: ({ existing }) => existing.category.eq(() => 'foo'),
        update: ({ existing, input }) => ({
            category: input.category,
            name: existing.name.ifNotExists(input.name),
        }),
    })
    .options({ ReturnValues: 'ALL_NEW' })

export const getPet = pet.getItem({ projection: ({ existing }) => [existing.name, existing.category] })
export const createPet = pet.putItem({ condition: ({ existing }) => ({ and: [existing.sk.notExists()] }) })

export const listPets = pet.scan({
    filter: ({ existing }) => existing.entityType.eq(pet.entityType),
    projection: ({ existing }) => [existing.category],
})

export const listPetsByOwner = pet.query({
    key: ({ existing }) => existing.sk.beginsWith(`${pet.entityType}#`),
})

export const listCategoriesByOwner = pet.query({
    key: ({ existing }) => existing.sk.beginsWith(`${pet.entityType}#`),
    projection: ({ existing }) => [existing.category],
})

export const listPetEntityCollection = pet.queryTable({
    key: ({ existing, context }) => existing.pk.eq(pet.formatAttribute('pk', context)),
})

export const listPetsBySk = pet.queryIndex('sk-pk-index', {
    // key: ({ existing, context }) => existing.sk.eq(pet.formatAttribute('sk', context)),
    // projection: ({ existing }) => [existing.category, existing.pk],
})
