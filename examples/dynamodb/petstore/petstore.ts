import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { tryToError } from '@skyleague/axioms'
import { OwnerEntityClient, PetEntityClient, PetOwnershipEntityClient } from './petstore.db.js'

export class PetDataRepository {
    public client: DynamoDBDocument
    public TableName = 'pet-data'
    public Pet: PetEntityClient
    public PetOwnership: PetOwnershipEntityClient
    public Owner: OwnerEntityClient

    public constructor(client: DynamoDBDocument) {
        this.client = client
        this.Pet = new PetEntityClient(client)
        this.PetOwnership = new PetOwnershipEntityClient(client)
        this.Owner = new OwnerEntityClient(client)
    }

    public async getPet(id: string) {
        return tryToError(await this.Pet.get(id))
    }
}
