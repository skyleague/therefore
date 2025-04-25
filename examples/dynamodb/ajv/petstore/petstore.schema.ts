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

petDataTable.definition

export const pet = petDataTable.entity({
    entityType: 'pet',
    shape: $ref(Pet).extend({
        ownerId: $string,
    }),
    formatters: {
        pk: ({ ownerId }) => `owner#${ownerId}`,
        sk: ({ id }) => `pet#${id}`,
    },
})

export const updatePetName = pet.updateItem({
    condition: ({ stored }) => stored.sk.exists(),
    update: ({ stored, args }) => ({
        name: stored.name.ifNotExists(args.name),
    }),
})
export const upsertPetName = pet.updateItem({
    update: ({ stored: existing, args }) => ({
        name: existing.name.ifNotExists(args.name),
    }),
})

export const updatePetName1 = pet
    .updateItem({
        condition: ({ stored }) => stored.category.eq(() => 'foo'),
        update: ({ stored, args }) => ({
            category: args.category,
            name: stored.name.ifNotExists(args.name),
        }),
    })
    .options({ ReturnValues: 'ALL_NEW' })

export const getPet = pet.getItem({ projection: ({ stored }) => [stored.name, stored.category] })
export const createPet = pet.putItem({ condition: ({ stored }) => ({ and: [stored.sk.notExists()] }) })

export const listPets = pet.scan({
    filter: ({ stored }) => stored.entityType.eq(pet.entityType),
    projection: ({ stored }) => [stored.category],
})

export const listPetsByOwner = pet.query({
    key: ({ stored }) => stored.sk.beginsWith(`${pet.entityType}#`),
})

export const listCategoriesByOwner = pet.query({
    key: ({ stored }) => stored.sk.beginsWith(`${pet.entityType}#`),
    projection: ({ stored }) => [stored.category],
})

export const listPetEntityCollection = pet.queryTable({
    // key: ({ stored, context }) => stored.pk.eq(pet.formatAttribute('pk', context)),
    key: ({ stored, args, formatters }) => stored.pk.eq(formatters.pk(args)),
})

export const listPetsBySk = pet.queryIndex('sk-pk-index', {
    // key: ({ existing, context }) => existing.sk.eq(pet.formatAttribute('sk', context)),
    // projection: ({ existing }) => [existing.category, existing.pk],
})
