import { $getItemCommand } from '../../../src/lib/primitives/dynamodb/commands/get-item/command.js'
import { $putItemCommand } from '../../../src/lib/primitives/dynamodb/commands/put-item/command.js'
import { $queryCommand } from '../../../src/lib/primitives/dynamodb/commands/query/command.js'
import { $scanCommand } from '../../../src/lib/primitives/dynamodb/commands/scan/command.js'
import { $updateItemCommand } from '../../../src/lib/primitives/dynamodb/commands/update-item/command.js'
import { $dynamodb } from '../../../src/lib/primitives/dynamodb/dynamodb.js'
import { $object } from '../../../src/lib/primitives/object/object.js'
import { $ref } from '../../../src/lib/primitives/ref/ref.js'
import { $string } from '../../../src/lib/primitives/string/string.js'
import { Pet } from '../../restclients/petstore/petstore.type.js'

// // export const pet = baseData('pet')
// //     // biome-ignore lint/suspicious/noExplicitAny: taking a shortcut to not have to type the whole object
// //     .merge($ref(Pet))
// //     .validator()

// // export const owner = baseData('owner')
// //     .extend({
// //         ownerId: $string,
// //         name: $string,
// //         dateOfBirth: $string().date(),
// //     })
// //     .validator()

// // export const petOwnership = baseData('ownership')
// //     .extend({
// //         id: $string().describe('ID of the Pet'),
// //         ownerId: $string().describe('ID of the Owner'),
// //     })
// //     .validator()

export const petDataTable = $dynamodb.table(
    $object({
        pk: $string,
        sk: $string,
        entityType: $string,
        createdAt: $string().datetime(),
        updatedAt: $string().datetime(),
    }),
    {
        pk: 'pk',
        sk: 'sk',
        entityType: 'entityType',
        tableName: 'pet-data',
        indexes: {
            'sk-pk-index': {
                pk: 'sk',
                sk: 'pk',
            },
        },
    },
)

// const p = $ref(Pet)

export const pet = $dynamodb.entity(
    petDataTable,
    'pet',
    $ref(Pet).extend({
        ownerId: $string,
    }),
    {
        pk: 'owner#{ownerId}',
        sk: 'pet#{id}',
    },
)

export const updatePetName = $updateItemCommand(pet, 'updatePetName', {
    condition: (existing, _input) => existing.category.eq(() => 'foo'),
    update: (existing, input) => ({
        name: existing.name.ifNotExists(input.name),
    }),
})
export const updatePetName1 = $updateItemCommand(
    pet,
    'updatePetName1',
    {
        condition: (existing, _input) => existing.category.eq(() => 'foo'),
        update: (existing, input) => ({
            category: input.category,
            name: existing.name.ifNotExists(input.name),
        }),
    },
    { ReturnValues: 'ALL_NEW' },
)

export const getPet = $getItemCommand(pet, 'getPet', { projection: (existing) => [existing.name, existing.category] })
export const createPet = $putItemCommand(pet, 'createPet', {})

export const listPets = $scanCommand(pet, 'listPets', {
    filter: (x) => x.entityType.eq(pet.entityType),
    projection: (x) => [x.category],
})

export const listPetsByOwner = $queryCommand(pet, 'listPetsByOwner', {
    key: (existing) => existing.sk.beginsWith(`${pet.entityType}#`),
})

export const listCategoriesByOwner = $queryCommand(pet, 'listCategoriesByOwner', {
    key: (existing) => existing.sk.beginsWith(`${pet.entityType}#`),
    projection: (x) => [x.category],
})
