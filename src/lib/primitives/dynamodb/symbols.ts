import { moduleSymbol } from '../../cst/module.js'

export const dynamodbSymbols = {
    DynamoDBDocument: moduleSymbol('@aws-sdk/lib-dynamodb', 'DynamoDBDocument'),
    UpdateCommandInput: moduleSymbol('@aws-sdk/lib-dynamodb', 'UpdateCommandInput'),
    GetCommandInput: moduleSymbol('@aws-sdk/lib-dynamodb', 'GetCommandInput'),
    PutCommandInput: moduleSymbol('@aws-sdk/lib-dynamodb', 'PutCommandInput'),
    ScanCommandInput: moduleSymbol('@aws-sdk/lib-dynamodb', 'ScanCommandInput'),
    QueryCommandInput: moduleSymbol('@aws-sdk/lib-dynamodb', 'QueryCommandInput'),
    GetCommandOutput: moduleSymbol('@aws-sdk/lib-dynamodb', 'GetCommandOutput'),
    DynamoDBServiceException: moduleSymbol('@aws-sdk/client-dynamodb', 'DynamoDBServiceException'),
    UpdateCommand: moduleSymbol('@aws-sdk/lib-dynamodb', 'UpdateCommand'),
    GetCommand: moduleSymbol('@aws-sdk/lib-dynamodb', 'GetCommand'),
    PutCommand: moduleSymbol('@aws-sdk/lib-dynamodb', 'PutCommand'),
    ScanCommand: moduleSymbol('@aws-sdk/lib-dynamodb', 'ScanCommand'),
    QueryCommand: moduleSymbol('@aws-sdk/lib-dynamodb', 'QueryCommand'),
    paginateQuery: moduleSymbol('@aws-sdk/lib-dynamodb', 'paginateQuery'),
    paginateScan: moduleSymbol('@aws-sdk/lib-dynamodb', 'paginateScan'),
}
