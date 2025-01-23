/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { DynamoDBServiceException } from '@aws-sdk/client-dynamodb'
import { GetCommand, PutCommand, UpdateCommand, paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import {
    createPetCommand,
    getPetCommand,
    listCategoriesByOwnerCommand,
    listPetEntityCollectionCommand,
    listPetsByOwnerCommand,
    listPetsBySkCommand,
    listPetsCommand,
    updatePetName1Command,
    updatePetNameCommand,
    upsertPetNameCommand,
} from './petstore.command.js'
import { GetPetResult, ListCategoriesByOwnerResult, ListPetsBySkResult, ListPetsResult, PetEntity } from './petstore.type.js'
import type {
    CreatePetInput,
    GetPetInput,
    ListCategoriesByOwnerInput,
    ListPetEntityCollectionInput,
    ListPetsByOwnerInput,
    ListPetsBySkInput,
    UpdatePetName1Input,
    UpdatePetNameInput,
    UpsertPetNameInput,
} from './petstore.type.js'

export class PetEntityClient {
    public entityType = 'pet' as const
    public table: PetDataTable

    public constructor({ table }: { table: PetDataTable }) {
        this.table = table
    }

    public async updatePetName({ input }: { input: UpdatePetNameInput }) {
        const command = updatePetNameCommand({ tableName: this.table.tableName, input })

        try {
            const result = await this.table.client.send(new UpdateCommand(command))
            return { right: null, $response: result }
        } catch (error) {
            return { left: error as DynamoDBServiceException, $response: error }
        }
    }

    public async upsertPetName({ input }: { input: UpsertPetNameInput }) {
        const command = upsertPetNameCommand({ tableName: this.table.tableName, input })

        try {
            const result = await this.table.client.send(new UpdateCommand(command))
            return { right: null, $response: result }
        } catch (error) {
            return { left: error as DynamoDBServiceException, $response: error }
        }
    }

    public async updatePetName1({ input }: { input: UpdatePetName1Input }) {
        const command = updatePetName1Command({ tableName: this.table.tableName, input })

        try {
            const result = await this.table.client.send(new UpdateCommand(command))
            const data = PetEntity.parse(result.Attributes ?? {})
            return { ...data, $response: result }
        } catch (error) {
            return { left: error as DynamoDBServiceException, $response: error }
        }
    }

    public async getPet({ input }: { input: GetPetInput }) {
        const command = getPetCommand({ tableName: this.table.tableName, input })

        try {
            const result = await this.table.client.send(new GetCommand(command))
            if (result.Item === undefined) {
                return { right: null, $response: result }
            }
            return { ...GetPetResult.parse(result.Item), $response: result }
        } catch (error) {
            return { left: error as DynamoDBServiceException, $response: error }
        }
    }

    public async createPet({ input }: { input: CreatePetInput }) {
        const command = createPetCommand({ tableName: this.table.tableName, input })

        try {
            const result = await this.table.client.send(new PutCommand(command))
            return { right: null, $response: result }
        } catch (error) {
            return { left: error as DynamoDBServiceException, $response: error }
        }
    }

    public async *listPets() {
        const command = listPetsCommand({ tableName: this.table.tableName })

        try {
            for await (const page of paginateScan({ client: this.table.client }, command)) {
                for (const item of page.Items ?? []) {
                    yield { ...ListPetsResult.parse(item), status: 'success' as const, $response: page }
                }
            }
        } catch (error) {
            yield { left: error as DynamoDBServiceException, status: 'error' as const, $response: error }
        }
    }

    public async *listPetsByOwner({ input }: { input: ListPetsByOwnerInput }) {
        const command = listPetsByOwnerCommand({ tableName: this.table.tableName, input })

        try {
            for await (const page of paginateQuery({ client: this.table.client }, command)) {
                for (const item of page.Items ?? []) {
                    yield { ...PetEntity.parse(item), status: 'success' as const, $response: page }
                }
            }
        } catch (error) {
            yield { left: error as DynamoDBServiceException, status: 'error' as const, $response: error }
        }
    }

    public async *listCategoriesByOwner({ input }: { input: ListCategoriesByOwnerInput }) {
        const command = listCategoriesByOwnerCommand({ tableName: this.table.tableName, input })

        try {
            for await (const page of paginateQuery({ client: this.table.client }, command)) {
                for (const item of page.Items ?? []) {
                    yield { ...ListCategoriesByOwnerResult.parse(item), status: 'success' as const, $response: page }
                }
            }
        } catch (error) {
            yield { left: error as DynamoDBServiceException, status: 'error' as const, $response: error }
        }
    }

    public async *listPetEntityCollection({ input }: { input: ListPetEntityCollectionInput }) {
        const command = listPetEntityCollectionCommand({ tableName: this.table.tableName, input })

        try {
            for await (const page of paginateQuery({ client: this.table.client }, command)) {
                for (const item of page.Items ?? []) {
                    yield { ...PetEntity.parse(item), status: 'success' as const, $response: page }
                }
            }
        } catch (error) {
            yield { left: error as DynamoDBServiceException, status: 'error' as const, $response: error }
        }
    }

    public async *listPetsBySk({ input }: { input: ListPetsBySkInput }) {
        const command = listPetsBySkCommand({ tableName: this.table.tableName, input })

        try {
            for await (const page of paginateQuery({ client: this.table.client }, command)) {
                for (const item of page.Items ?? []) {
                    yield { ...ListPetsBySkResult.parse(item), status: 'success' as const, $response: page }
                }
            }
        } catch (error) {
            yield { left: error as DynamoDBServiceException, status: 'error' as const, $response: error }
        }
    }
}

export class PetDataTable {
    public tableName = 'pet-data' as const

    public client: DynamoDBDocument

    public constructor({
        client,
    }: {
        client: DynamoDBDocument
    }) {
        this.client = client
    }
}
