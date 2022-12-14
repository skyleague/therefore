import { PetStore } from '../examples/petstore/petstore.client'
import {
    Pet,
    FindPetsByStatusResponse,
    FindPetsByTagsResponse,
    ApiResponse,
    GetInventoryResponse,
    Order,
    User,
    CreateUsersWithListInputRequest,
    LoginUserResponse,
} from '../examples/petstore/petstore.type'
import { arbitrary } from '../src'

import { eitherToError, forAll } from '@skyleague/axioms'
import nock from 'nock'

const prefixUrl = 'http://www.example.com'

describe('updatePet', () => {
    beforeEach(() => nock.disableNetConnect())
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    const client = new PetStore({ prefixUrl, auth: { apiKey: 'foo-key' } })

    test('gives valid response', async () => {
        const updatedPet: Pet = { name: 'FooPet', photoUrls: ['example.com'] }
        nock('http://www.example.com:80').put('/pet').reply(200, updatedPet)
        const result = await client.updatePet({ body: updatedPet })
        expect(eitherToError(result)).toEqual(updatedPet)
        if ('right' in result) {
            const pet: Pet = result.right
            expect(updatedPet).toEqual(pet)
        }
    })

    test('allows additional properties', async () => {
        const updatedPet: Pet = { name: 'FooPet', photoUrls: ['example.com'] }
        nock('http://www.example.com:80')
            .put('/pet')
            .reply(200, { ...updatedPet, foo: 'bar' })
        const result = await client.updatePet({ body: updatedPet })
        expect(eitherToError(result)).toEqual({ ...updatedPet, foo: 'bar' })
        if ('right' in result) {
            const pet: Pet = result.right
            expect(pet).toMatchInlineSnapshot(`
                {
                  "foo": "bar",
                  "name": "FooPet",
                  "photoUrls": [
                    "example.com",
                  ],
                }
            `)
        }
    })

    test('create user with default response', async () => {
        const user: User = { id: 1 }
        nock('http://www.example.com:80').post('/user').reply(200, user)
        const result = await client.createUser({ body: user })
        expect(eitherToError(result)).toEqual(user)
        if ('right' in result) {
            const createdUser: User = result.right
            expect(createdUser).toMatchInlineSnapshot(`
                {
                  "id": 1,
                }
            `)
        }
    })
})

describe('entities satisfy arbitrary', () => {
    test('Pet', () => {
        forAll(arbitrary(Pet), (x) => Pet.is(x))
    })

    test('FindPetsByStatusResponse', () => {
        forAll(arbitrary(FindPetsByStatusResponse), (x) => FindPetsByStatusResponse.is(x))
    })

    test('FindPetsByTagsResponse', () => {
        forAll(arbitrary(FindPetsByTagsResponse), (x) => FindPetsByTagsResponse.is(x))
    })

    test('ApiResponse', () => {
        forAll(arbitrary(ApiResponse), (x) => ApiResponse.is(x))
    })

    test('GetInventoryResponse', () => {
        forAll(arbitrary(GetInventoryResponse), (x) => GetInventoryResponse.is(x))
    })

    test('Order', () => {
        forAll(arbitrary(Order), (x) => Order.is(x))
    })

    test('User', () => {
        forAll(arbitrary(User), (x) => User.is(x))
    })

    test('CreateUsersWithListInputRequest', () => {
        forAll(arbitrary(CreateUsersWithListInputRequest), (x) => CreateUsersWithListInputRequest.is(x))
    })

    test('LoginUserResponse', () => {
        forAll(arbitrary(LoginUserResponse), (x) => LoginUserResponse.is(x))
    })
})
