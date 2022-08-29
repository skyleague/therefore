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
import { toArbitrary } from '../src'

import { eitherToError, forAll } from '@skyleague/axioms'
import nock from 'nock'

const prefixUrl = 'http://www.example.com'

describe('updatePet', () => {
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
})

describe('entities satisfy arbitrary', () => {
    test('Pet', async () => {
        forAll(await toArbitrary(Pet), (x) => Pet.is(x))
    })

    test('FindPetsByStatusResponse', async () => {
        forAll(await toArbitrary(FindPetsByStatusResponse), (x) => FindPetsByStatusResponse.is(x))
    })

    test('FindPetsByTagsResponse', async () => {
        forAll(await toArbitrary(FindPetsByTagsResponse), (x) => FindPetsByTagsResponse.is(x))
    })

    test('ApiResponse', async () => {
        forAll(await toArbitrary(ApiResponse), (x) => ApiResponse.is(x))
    })

    test('GetInventoryResponse', async () => {
        forAll(await toArbitrary(GetInventoryResponse), (x) => GetInventoryResponse.is(x))
    })

    test('Order', async () => {
        forAll(await toArbitrary(Order), (x) => Order.is(x))
    })

    test('User', async () => {
        forAll(await toArbitrary(User), (x) => User.is(x))
    })

    test('CreateUsersWithListInputRequest', async () => {
        forAll(await toArbitrary(CreateUsersWithListInputRequest), (x) => CreateUsersWithListInputRequest.is(x))
    })

    test('LoginUserResponse', async () => {
        forAll(await toArbitrary(LoginUserResponse), (x) => LoginUserResponse.is(x))
    })

    test('use schema', async () => {
        forAll(await toArbitrary(LoginUserResponse, { useSchema: false }), (x) => LoginUserResponse.is(x))
    })
})
