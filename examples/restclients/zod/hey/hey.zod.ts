/**
 * Generated by @skyleague/therefore
 * Do not manually touch this
 */
/* eslint-disable */

import { z } from 'zod'

export const ModelWithString = z
    .object({
        prop: z.string().describe('This is a simple string property').optional(),
    })
    .describe('This is a model with one string property')

export type ModelWithString = z.infer<typeof ModelWithString>

export const ModelWithReadOnlyAndWriteOnly = z.object({
    bar: z.string(),
    baz: z.string(),
    foo: z.string(),
})

export type ModelWithReadOnlyAndWriteOnly = z.infer<typeof ModelWithReadOnlyAndWriteOnly>

export const ModelWithInteger = z
    .object({
        prop: z.number().int().describe('This is a simple number property').optional(),
    })
    .describe('This is a model with one number property')

export type ModelWithInteger = z.infer<typeof ModelWithInteger>

export const ModelWithBoolean = z
    .object({
        prop: z.boolean().describe('This is a simple boolean property').optional(),
    })
    .describe('This is a model with one boolean property')

export type ModelWithBoolean = z.infer<typeof ModelWithBoolean>

export const ModelWithDictionary = z
    .object({
        prop: z.record(z.string().optional()).optional(),
    })
    .describe('This is a model with one property containing a dictionary')

export type ModelWithDictionary = z.infer<typeof ModelWithDictionary>

export const ModelWithArray = z
    .object({
        prop: ModelWithString.array().optional(),
        propWithFile: z.unknown().array().optional(),
        propWithNumber: z.number().array().optional(),
    })
    .describe('This is a model with one property containing an array')

export type ModelWithArray = z.infer<typeof ModelWithArray>

export const ModelWithEnum = z
    .object({
        bool: z.literal(true).describe('Simple boolean enum').optional(),
        'foo_bar-enum': z
            .enum(['Success', 'Warning', 'Error', 'ØÆÅ字符串'])
            .describe('This is a simple enum with strings')
            .optional(),
        statusCode: z
            .enum(['100', '200 FOO', '300 FOO_BAR', '400 foo-bar', '500 foo.bar', '600 foo&bar'])
            .describe('These are the HTTP error code enums')
            .optional(),
    })
    .describe('This is a model with one enum')

export type ModelWithEnum = z.infer<typeof ModelWithEnum>

export const ModelWithArrayReadOnlyAndWriteOnly = z
    .object({
        prop: ModelWithReadOnlyAndWriteOnly.array().optional(),
        propWithFile: z.unknown().array().optional(),
        propWithNumber: z.number().array().optional(),
    })
    .describe('This is a model with one property containing an array')

export type ModelWithArrayReadOnlyAndWriteOnly = z.infer<typeof ModelWithArrayReadOnlyAndWriteOnly>

export const ModelThatExtends = z
    .object({})
    .describe('This is a model that extends another model')
    .and(ModelWithString)
    .and(
        z.object({
            propExtendsA: z.string().optional(),
            propExtendsB: ModelWithString.optional(),
        }),
    )
    .describe('This is a model that extends another model')

export type ModelThatExtends = z.infer<typeof ModelThatExtends>

export const NonAsciiString = z
    .string()
    .describe('A string with non-ascii (unicode) characters valid in typescript identifiers (æøåÆØÅöÔèÈ字符串)')

export type NonAsciiString = z.infer<typeof NonAsciiString>

export const ArrayWithStrings = z.string().array().describe('This is a simple array with strings').default(['test'])

export type ArrayWithStrings = z.infer<typeof ArrayWithStrings>

export const CallWithDuplicateResponsesResponse200 = z.intersection(ModelWithBoolean, ModelWithInteger)

export type CallWithDuplicateResponsesResponse200 = z.infer<typeof CallWithDuplicateResponsesResponse200>

export const CallWithParametersRequest = z.object({})

export type CallWithParametersRequest = z.infer<typeof CallWithParametersRequest>

export const CallWithResponseAndNoContentResponseResponse200 = z.number()

export type CallWithResponseAndNoContentResponseResponse200 = z.infer<typeof CallWithResponseAndNoContentResponseResponse200>

export const CallWithResponsesResponse200 = z.object({
    '@namespace.integer': z.number().int().optional(),
    '@namespace.string': z.string().optional(),
    value: ModelWithString.array().optional(),
})

export type CallWithResponsesResponse200 = z.infer<typeof CallWithResponsesResponse200>

export const ComplexParamsRequest = z.object({
    enabled: z.boolean().default(true).optional(),
    key: z
        .string()
        .max(64)
        .regex(/^[a-zA-Z0-9_]*$/)
        .nullable(),
    listOfModels: ModelWithString.array().nullable().optional(),
    listOfStrings: z.string().array().nullable().optional(),
    name: z.string().max(255).nullable(),
    parameters: z.union([ModelWithString, ModelWithEnum, ModelWithArray, ModelWithDictionary]),
    type: z.enum(['Monkey', 'Horse', 'Bird']),
    user: z
        .object({
            id: z.number().int().optional(),
            name: z.string().nullable().optional(),
        })
        .optional(),
})

export type ComplexParamsRequest = z.infer<typeof ComplexParamsRequest>

export const ComplexTypesResponse = ModelWithString.array()

export type ComplexTypesResponse = z.infer<typeof ComplexTypesResponse>

export const DictionaryWithArray = z.record(ModelWithString.array().optional()).describe('This is a complex dictionary')

export type DictionaryWithArray = z.infer<typeof DictionaryWithArray>

export const Hey = z.string().describe('Model with number-only name')

export type Hey = z.infer<typeof Hey>

export const Import = z.string().describe('Model with restricted keyword name')

export type Import = z.infer<typeof Import>

export const ImportRequest = z.union([ModelWithReadOnlyAndWriteOnly, ModelWithArrayReadOnlyAndWriteOnly])

export type ImportRequest = z.infer<typeof ImportRequest>

export const ModelFromZendesk = z
    .string()
    .describe(
        '`Comment` or `VoiceComment`. The JSON object for adding voice comments to tickets is different. See [Adding voice comments to tickets](/documentation/ticketing/managing-tickets/adding-voice-comments-to-tickets)',
    )

export type ModelFromZendesk = z.infer<typeof ModelFromZendesk>

export const ModelThatExtendsExtends = z
    .object({})
    .describe('This is a model that extends another model')
    .and(ModelWithString)
    .and(ModelThatExtends)
    .and(
        z.object({
            propExtendsC: z.string().optional(),
            propExtendsD: ModelWithString.optional(),
        }),
    )
    .describe('This is a model that extends another model')

export type ModelThatExtendsExtends = z.infer<typeof ModelThatExtendsExtends>

export const ModelWithOneOfEnum = z.union([
    z.object({
        foo: z.literal('Bar'),
    }),
    z.object({
        foo: z.literal('Baz'),
    }),
    z.object({
        foo: z.literal('Qux'),
    }),
    z.object({
        content: z.string().datetime({ offset: true }),
        foo: z.literal('Quux'),
    }),
    z.object({
        content: z.tuple([z.string().datetime({ offset: true }), z.string()]),
        foo: z.literal('Corge'),
    }),
])

export type ModelWithOneOfEnum = z.infer<typeof ModelWithOneOfEnum>

export const ModelWithStringError = z
    .object({
        prop: z.string().describe('This is a simple string property').optional(),
    })
    .describe('This is a model with one string property')

export type ModelWithStringError = z.infer<typeof ModelWithStringError>

export const MultipartRequestRequest = z.object({
    content: z.string().optional(),
    data: ModelWithString.nullable().optional(),
})

export type MultipartRequestRequest = z.infer<typeof MultipartRequestRequest>

export const NonAsciiResponse = NonAsciiString.array()

export type NonAsciiResponse = z.infer<typeof NonAsciiResponse>

export const OperationApiSimpleResponse200 = z.number()

export type OperationApiSimpleResponse200 = z.infer<typeof OperationApiSimpleResponse200>

export const PostCallWithOptionalParamRequest = z.object({
    offset: z.number().nullable().optional(),
})

export type PostCallWithOptionalParamRequest = z.infer<typeof PostCallWithOptionalParamRequest>

export const PostCallWithOptionalParamResponse200 = z.number()

export type PostCallWithOptionalParamResponse200 = z.infer<typeof PostCallWithOptionalParamResponse200>

export const TypesResponse200 = z.number()

export type TypesResponse200 = z.infer<typeof TypesResponse200>

export const TypesResponse201 = z.string()

export type TypesResponse201 = z.infer<typeof TypesResponse201>

export const TypesResponse202 = z.boolean()

export type TypesResponse202 = z.infer<typeof TypesResponse202>

export const TypesResponse203 = z.object({})

export type TypesResponse203 = z.infer<typeof TypesResponse203>

export const UploadFileResponse = z.boolean()

export type UploadFileResponse = z.infer<typeof UploadFileResponse>
