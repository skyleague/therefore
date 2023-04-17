import { PetStore } from '../examples/petstore/petstore.client.js'
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
} from '../examples/petstore/petstore.type.js'
import { arbitrary } from '../src/index.js'

import { eitherToError, forAll } from '@skyleague/axioms'
import nock from 'nock'
import { expect, describe, beforeEach, afterEach, it } from 'vitest'

const prefixUrl = 'http://www.example.com'

describe('updatePet', () => {
    beforeEach(() => nock.disableNetConnect())
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    const client = new PetStore({ prefixUrl, auth: { apiKey: 'foo-key' } })

    it('gives valid response', async () => {
        const updatedPet: Pet = { name: 'FooPet', photoUrls: ['example.com'] }
        nock('http://www.example.com:80').put('/pet').reply(200, updatedPet)
        const result = await client.updatePet({ body: updatedPet })
        expect(eitherToError(result)).toEqual(updatedPet)
        if ('right' in result) {
            const pet: Pet = result.right
            expect(updatedPet).toEqual(pet)
        }
    })

    it('allows additional properties', async () => {
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

    it('create user with default response', async () => {
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
    it('Pet', () => {
        forAll(arbitrary(Pet), (x) => Pet.is(x))
    })

    it('FindPetsByStatusResponse', () => {
        forAll(arbitrary(FindPetsByStatusResponse), (x) => FindPetsByStatusResponse.is(x))
    })

    it('FindPetsByTagsResponse', () => {
        forAll(arbitrary(FindPetsByTagsResponse), (x) => FindPetsByTagsResponse.is(x))
    })

    it('ApiResponse', () => {
        forAll(arbitrary(ApiResponse), (x) => ApiResponse.is(x))
    })

    it('GetInventoryResponse', () => {
        forAll(arbitrary(GetInventoryResponse), (x) => GetInventoryResponse.is(x))
    })

    it('Order', () => {
        forAll(arbitrary(Order), (x) => Order.is(x))
    })

    it('User', () => {
        forAll(arbitrary(User), (x) => User.is(x))
    })

    it('CreateUsersWithListInputRequest', () => {
        forAll(arbitrary(CreateUsersWithListInputRequest), (x) => CreateUsersWithListInputRequest.is(x))
    })

    it('LoginUserResponse', () => {
        forAll(arbitrary(LoginUserResponse), (x) => LoginUserResponse.is(x))
    })
})
