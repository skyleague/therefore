import {
    ApiResponse,
    CreateUsersWithListInputRequest,
    FindPetsByStatusResponse,
    FindPetsByTagsResponse,
    GetInventoryResponse,
    LoginUserResponse,
    Order,
    Pet,
    User,
} from '../../../examples/restclients/petstore/petstore.type.js'
import { compileOutput } from '../../../src/commands/generate/generate.js'
import { arbitrary } from '../../../src/index.js'

import { asyncForAll, constant, eitherToError, forAll, json, string, tuple } from '@skyleague/axioms'

import type { IncomingHttpHeaders } from 'node:http'
import type { DefinedError } from 'ajv'
import nock from 'nock'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import {
    type FailureResponse,
    PetStore,
    type StatusCode,
    type SuccessResponse,
} from '../../../examples/restclients/petstore/petstore.client.js'
import { $nockClient } from '../../../src/lib/primitives/restclient/mock.js'

const prefixUrl = 'http://www.example.com'

it('output generation', async () => {
    expect(
        await compileOutput(['examples/restclients/petstore/petstore.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

describe('methods', () => {
    beforeEach(() => nock.disableNetConnect())
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    const client = new PetStore({ prefixUrl, auth: { apiKey: 'foo-key' } })

    it('addPet', async () => {
        await asyncForAll(arbitrary(Pet), async (pet) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.addPet().reply(200, pet)

            const result = await client.addPet({ body: pet })

            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<Pet>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.statusCode).toEqualTypeOf<'200'>()
            } else {
                expectTypeOf(result.left).toEqualTypeOf<unknown>()
                expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode | undefined>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders | undefined>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'request:body' | 'response:body' | 'response:statuscode'>()

                if (result.statusCode === '405') {
                    expectTypeOf(`${result.statusCode}` as const).toEqualTypeOf<'405'>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }

                if (result.where === 'request:body') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<undefined>()
                    expectTypeOf(result.headers).toEqualTypeOf<undefined>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'request:body'>()
                }

                if (result.where === 'response:body') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<`2${number}`>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:body'>()
                }

                if (result.where === 'response:statuscode') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode<1 | 3 | 4 | 5>>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }
            }

            if (result.status === 'informational') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }
            if (result.status === 'success') {
                expectTypeOf(result).toEqualTypeOf<
                    SuccessResponse<'200', Pet> | FailureResponse<`2${number}`, string, 'response:body', IncomingHttpHeaders>
                >()
            }
            if (result.status === 'client-error') {
                expectTypeOf(result).toEqualTypeOf<
                    | FailureResponse<'405', unknown, 'response:statuscode', IncomingHttpHeaders>
                    | FailureResponse<
                          `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                          string,
                          'response:statuscode',
                          IncomingHttpHeaders
                      >
                >()
            }
            if (result.status === 'server-error') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }

            expect(result.statusCode).toEqual('200')
            expect(eitherToError(result)).toEqual(pet)

            if ('right' in result) {
                expect(result.right).toEqual(pet)
                expectTypeOf(result.right).toEqualTypeOf<Pet>()
            }
        })
    })

    it('addPet - 405 -> json', async () => {
        await asyncForAll(
            tuple(
                arbitrary(Pet),
                json().map((x) => JSON.stringify(x)),
            ),
            async ([pet, response]) => {
                nock.cleanAll()

                const nockClient = $nockClient(client)
                nockClient.addPet().reply(405, response)

                const result = await client.addPet({ body: pet })
                expect(result).toEqual({
                    statusCode: '405',
                    status: 'client-error',
                    left: JSON.parse(response),
                    headers: {},
                    validationErrors: undefined,
                    where: 'response:statuscode',
                })
            },
        )
    })

    it('addPet - 406 -> json', async () => {
        await asyncForAll(tuple(arbitrary(Pet), constant('{')), async ([pet, response]) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.addPet().reply(405, response)

            const result = await client.addPet({ body: pet })
            expect(result).toEqual({
                statusCode: '405',
                status: 'client-error',
                left: response,
                headers: {},
                validationErrors: undefined,
                where: 'response:statuscode',
            })
        })
    })

    it('createUser', async () => {
        await asyncForAll(arbitrary(User), async (user) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.createUser().reply(200, user)

            const result = await client.createUser({ body: user })

            expect(result.statusCode).toEqual('200')
            expect(eitherToError(result)).toEqual(user)

            if ('right' in result) {
                expect(result.right).toEqual(user)
                expectTypeOf(result.right).toEqualTypeOf<User>()
            }
        })
    })

    it('createUsersWithListInput', async () => {
        await asyncForAll(tuple(arbitrary(CreateUsersWithListInputRequest), arbitrary(User)), async ([input, user]) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.createUsersWithListInput().reply(200, user)

            const result = await client.createUsersWithListInput({ body: input })

            expect(result.statusCode).toEqual('200')
            expect(eitherToError(result)).toEqual(user)

            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<User>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.statusCode).toEqualTypeOf<'200'>()

                if (result.statusCode === '200') {
                    expectTypeOf(result.right).toEqualTypeOf<User>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.statusCode).toEqualTypeOf<'200'>()
                }
            } else {
                expectTypeOf(result.left).toEqualTypeOf<unknown>()
                expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode | undefined>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders | undefined>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'request:body' | 'response:body' | 'response:statuscode'>()

                if (result.statusCode === '405') {
                    expectTypeOf(`${result.statusCode}` as const).toEqualTypeOf<'405'>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }

                if (result.where === 'request:body') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<undefined>()
                    expectTypeOf(result.headers).toEqualTypeOf<undefined>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'request:body'>()
                }

                if (result.where === 'response:body') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<`2${number}`>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:body'>()
                }

                if (result.where === 'response:statuscode') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode<1 | 3 | 4 | 5>>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }
            }

            if (result.status === 'informational') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }
            if (result.status === 'success') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<`2${number}`, string, 'response:body', IncomingHttpHeaders> | SuccessResponse<'200', User>
                >()
            }
            if (result.status === 'client-error') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }
            if (result.status === 'server-error') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }

            if ('right' in result) {
                expect(result.right).toEqual(user)
                expectTypeOf(result.right).toEqualTypeOf<User>()
            }
        })
    })

    it('deleteOrder', async () => {
        await asyncForAll(string({ format: 'alpha-numeric', minLength: 1 }), async (orderId) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.deleteOrder({ path: { orderId } }).reply(200)

            const result = await client.deleteOrder({ path: { orderId } })

            expect(result.statusCode).toEqual('200')
            expect(result).toEqual({
                statusCode: '200',
                status: 'success',
                left: '',
                headers: {},
                validationErrors: undefined,
                where: 'response:body',
            })
            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<unknown>()
            }
        })
    })

    it('deletePet', async () => {
        await asyncForAll(string({ format: 'alpha-numeric', minLength: 1 }), async (petId) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.deletePet({ path: { petId } }).reply(200)

            const result = await client.deletePet({ path: { petId } })

            expect(result.statusCode).toEqual('200')
            expect(result).toEqual({
                statusCode: '200',
                status: 'success',
                left: '',
                headers: {},
                validationErrors: undefined,
                where: 'response:body',
            })

            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<unknown>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode>()
            } else {
                expectTypeOf(result.left).toEqualTypeOf<unknown>()
                expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'response:statuscode' | 'response:body'>()

                if (result.statusCode === '400') {
                    expectTypeOf(result.left).toEqualTypeOf<unknown>()
                    expectTypeOf(`${result.statusCode}` as const).toEqualTypeOf<'400'>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }

                if (result.statusCode === '500') {
                    expectTypeOf(result.left).toEqualTypeOf<string>()
                    expectTypeOf(`${result.statusCode}` as const).toEqualTypeOf<'500'>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }

                if (result.statusCode === '200') {
                    expectTypeOf(`${result.statusCode}` as const).toEqualTypeOf<'200'>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:body'>()
                }

                if (result.where === 'response:statuscode') {
                    expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode<1 | 3 | 4 | 5>>()
                    expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                    expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                    expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
                }
            }

            if (result.status === 'informational') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }
            if (result.status === 'success') {
                expectTypeOf(result).toEqualTypeOf<FailureResponse<`2${number}`, string, 'response:body', IncomingHttpHeaders>>()
            }
            if (result.status === 'client-error') {
                expectTypeOf(result).toEqualTypeOf<
                    | FailureResponse<
                          `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                          string,
                          'response:statuscode',
                          IncomingHttpHeaders
                      >
                    | FailureResponse<'400', unknown, 'response:statuscode', IncomingHttpHeaders>
                >()
            }
            if (result.status === 'server-error') {
                expectTypeOf(result).toEqualTypeOf<
                    FailureResponse<
                        `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                        string,
                        'response:statuscode',
                        IncomingHttpHeaders
                    >
                >()
            }
        })
    })

    it('deleteUser', async () => {
        await asyncForAll(string({ format: 'alpha-numeric', minLength: 1 }), async (username) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.deleteUser({ path: { username } }).reply(200)

            const result = await client.deleteUser({ path: { username } })

            expect(result.statusCode).toEqual('200')
            expect(result).toEqual({
                statusCode: '200',
                status: 'success',
                left: '',
                headers: {},
                validationErrors: undefined,
                where: 'response:body',
            })

            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<unknown>()
            }
        })
    })

    it('findPetsByStatus', async () => {
        await asyncForAll(arbitrary(FindPetsByStatusResponse), async (response) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.findPetsByStatus().reply(200, response)

            const result = await client.findPetsByStatus()

            expect(result.statusCode).toEqual('200')
            expect(eitherToError(result)).toEqual(response)

            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<FindPetsByStatusResponse>()
            }
        })
    })

    it('findPetsByTags', async () => {
        await asyncForAll(arbitrary(FindPetsByTagsResponse), async (response) => {
            nock.cleanAll()

            const nockClient = $nockClient(client)
            nockClient.findPetsByTags().reply(200, response)

            const result = await client.findPetsByTags()

            expect(result.statusCode).toEqual('200')
            expect(eitherToError(result)).toEqual(response)

            if ('right' in result) {
                expectTypeOf(result.right).toEqualTypeOf<FindPetsByTagsResponse>()
            }
        })
    })

    it('gives valid response', async () => {
        const updatedPet: Pet = { name: 'FooPet', photoUrls: ['example.com'] }

        const nockClient = $nockClient(client)

        nockClient.updatePet().reply(200, updatedPet)

        const result = await client.updatePet({ body: updatedPet })

        if ('right' in result) {
            expectTypeOf(result.right).toEqualTypeOf<Pet>()
            expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
            expectTypeOf(result.statusCode).toEqualTypeOf<'200'>()
        } else {
            expectTypeOf(result.left).toEqualTypeOf<unknown>()
            expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode | undefined>()
            expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders | undefined>()
            expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
            expectTypeOf(result.where).toEqualTypeOf<'request:body' | 'response:body' | 'response:statuscode'>()

            if (result.statusCode === '400' || result.statusCode === '404' || result.statusCode === '405') {
                expectTypeOf(`${result.statusCode}` as const).toEqualTypeOf<'400' | '404' | '405'>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
            }

            if (result.where === 'request:body') {
                expectTypeOf(result.statusCode).toEqualTypeOf<undefined>()
                expectTypeOf(result.headers).toEqualTypeOf<undefined>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'request:body'>()
            }

            if (result.where === 'response:body') {
                expectTypeOf(result.statusCode).toEqualTypeOf<`2${number}`>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'response:body'>()
            }

            if (result.where === 'response:statuscode') {
                expectTypeOf(result.statusCode).toEqualTypeOf<StatusCode<1 | 3 | 4 | 5>>()
                expectTypeOf(result.headers).toEqualTypeOf<IncomingHttpHeaders>()
                expectTypeOf(result.validationErrors).toEqualTypeOf<DefinedError[] | undefined>()
                expectTypeOf(result.where).toEqualTypeOf<'response:statuscode'>()
            }
        }

        if (result.status === 'informational') {
            expectTypeOf(result).toEqualTypeOf<
                FailureResponse<
                    `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                    string,
                    'response:statuscode',
                    IncomingHttpHeaders
                >
            >()
        }
        if (result.status === 'success') {
            expectTypeOf(result).toEqualTypeOf<
                SuccessResponse<'200', Pet> | FailureResponse<`2${number}`, string, 'response:body', IncomingHttpHeaders>
            >()
        }
        if (result.status === 'client-error') {
            expectTypeOf(result).toEqualTypeOf<
                | FailureResponse<'405', unknown, 'response:statuscode', IncomingHttpHeaders>
                | FailureResponse<
                      `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                      string,
                      'response:statuscode',
                      IncomingHttpHeaders
                  >
                | FailureResponse<'400', unknown, 'response:statuscode'>
                | FailureResponse<'404', unknown, 'response:statuscode'>
                | FailureResponse<'405', unknown, 'response:statuscode'>
            >()
        }
        if (result.status === 'server-error') {
            expectTypeOf(result).toEqualTypeOf<
                FailureResponse<
                    `1${number}` | `3${number}` | `4${number}` | `5${number}`,
                    string,
                    'response:statuscode',
                    IncomingHttpHeaders
                >
            >()
        }

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
