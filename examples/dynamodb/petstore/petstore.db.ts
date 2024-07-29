import type { DynamoDBServiceException } from '@aws-sdk/client-dynamodb'
import type { DynamoDBDocument, GetCommandInput, GetCommandOutput, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { type Either, mapRight, mapTry, tryToEither, whenRight } from '@skyleague/axioms'
import type { DefinedError } from 'ajv'
import { Pet } from './petstore.type.js'

export class PetEntityClient {
    public client: DynamoDBDocument
    public TableName = 'pet-data'

    public constructor(client: DynamoDBDocument) {
        this.client = client
    }

    public async get(
        id: string,
    ): Promise<Either<DefinedError[] | DynamoDBServiceException, { item: Pet; $response: GetCommandOutput }>> {
        const result = tryToEither(
            await mapTry(
                {
                    TableName: this.TableName,
                    Key: {
                        pk: `pet#${id}`,
                        sk: `pet#${id}`,
                    },
                } satisfies GetCommandInput,
                (input) => this.client.get(input),
            ),
        ) as Either<DynamoDBServiceException, GetCommandOutput>

        return whenRight(result, (response) => mapRight(Pet.parse(response.Item), (item) => ({ item, $response: response })))
    }
}

export class OwnerEntityClient {
    public client: DynamoDBDocument
    public TableName = 'pet-data'

    public constructor(client: DynamoDBDocument) {
        this.client = client
    }

    public async get(id: string) {
        const result = await mapTry(
            {
                TableName: this.TableName,
                Key: {
                    pk: `owner#${id}`,
                    sk: `owner#${id}`,
                },
            } satisfies GetCommandInput,
            (input) => this.client.get(input),
        )

        return tryToEither(result) as Either<DynamoDBServiceException, GetCommandOutput>
    }
}

export class PetOwnershipEntityClient {
    public client: DynamoDBDocument
    public TableName = 'pet-data'

    public constructor(client: DynamoDBDocument) {
        this.client = client
    }

    public async get(id: string) {
        const result = await mapTry(
            {
                TableName: this.TableName,
                Key: {
                    pk: `owner#${id}`,
                    sk: `pet#${id}`,
                },
            } satisfies GetCommandInput,
            (input) => this.client.get(input),
        )

        return tryToEither(result) as Either<DynamoDBServiceException, GetCommandOutput>
    }

    public async listPets(ownerId: string) {
        const result = await mapTry(
            {
                TableName: this.TableName,
                KeyConditionExpression: 'pk = :pk',
                ExpressionAttributeValues: {
                    ':pk': `owner#${ownerId}`,
                },
            } satisfies QueryCommandInput,
            (input) => this.client.query(input),
        )

        return tryToEither(result) as Either<DynamoDBServiceException, GetCommandOutput>
    }

    public async listOwners(petId: string) {
        const result = await mapTry(
            {
                TableName: this.TableName,
                KeyConditionExpression: 'sk = :sk AND begins_with(pk, :pk)',
                IndexName: 'sk-index',
                ExpressionAttributeValues: {
                    ':sk': `pet#${petId}`,
                    ':pk': 'owner#',
                },
            } satisfies QueryCommandInput,
            (input) => this.client.query(input),
        )

        return tryToEither(result) as Either<DynamoDBServiceException, GetCommandOutput>
    }
}
