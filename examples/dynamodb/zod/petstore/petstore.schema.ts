import { z } from 'zod'
import { $dynamodb } from '../../../../src/lib/primitives/dynamodb/dynamodb.js'
import { Pet } from '../../../restclients/zod/petstore/petstore.zod.js'

export const entity = z.object({
    pk: z.string(),
    sk: z.string(),
    entityType: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
})

export const petDataTable = $dynamodb.table({
    shape: entity,
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
    validator: 'zod',
})

export const pet = petDataTable.entity({
    entityType: 'pet',
    shape: Pet.extend({
        ownerId: z.string(),
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
    update: ({ stored, args }) => ({
        name: stored.name.ifNotExists(args.name),
    }),
})

export const updatePetName1 = pet
    .updateItem({
        condition: ({ stored }) => stored.category.eq('foo'),
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
    key: ({ stored, args }) => stored.pk.eq(args.pk),
    // key: ({ existing, context }) => existing.pk.eq(pet.formatAttribute('pk', context))
})

export const listPetsBySk = pet.queryIndex('sk-pk-index', {
    // key: ({ stored, context }) => stored.sk.eq(pet.formatAttribute('sk', context)),
    // projection: ({ stored }) => [stored.category, stored.pk],
})

export const deletePet = pet.deleteItem({
    condition: ({ stored }) => stored.sk.exists(),
})
