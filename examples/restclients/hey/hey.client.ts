/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { IncomingHttpHeaders } from 'node:http'

import type { DefinedError } from 'ajv'
import { got } from 'got'
import type { CancelableRequest, Got, Options, OptionsInit, Response } from 'got'

import {
    ArrayWithStrings,
    CallWithDuplicateResponsesResponse200,
    CallWithParametersRequest,
    CallWithResponseAndNoContentResponseResponse200,
    CallWithResponsesResponse200,
    ComplexParamsRequest,
    ComplexTypesResponse,
    DictionaryWithArray,
    Hey2,
    Import,
    ImportRequest,
    ModelFromZendesk,
    ModelThatExtends,
    ModelThatExtendsExtends,
    ModelWithBoolean,
    ModelWithOneOfEnum,
    ModelWithReadOnlyAndWriteOnly,
    ModelWithString,
    ModelWithStringError,
    NonAsciiResponse,
    PostCallWithOptionalParamRequest,
    PostCallWithOptionalParamResponse200,
    TypesResponse200,
    TypesResponse201,
    TypesResponse202,
    TypesResponse203,
    UploadFileResponse,
} from './hey.type.js'

/**
 * swagger
 */
export class Hey {
    public client: Got

    public constructor({
        prefixUrl = 'http://localhost:3000/base',
        options,
    }: {
        prefixUrl?: string | 'http://localhost:3000/base'
        options?: Options | OptionsInit
    } = {}) {
        this.client = got.extend(...[{ prefixUrl, throwHttpErrors: false }, options].filter((o): o is Options => o !== undefined))
    }

    public apiVVersionODataControllerCount({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'200', ModelFromZendesk>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/simple/$count`, {
                responseType: 'json',
            }),
            {
                200: ModelFromZendesk,
            },
        ) as ReturnType<this['apiVVersionODataControllerCount']>
    }

    public callToTestOrderOfParams({
        path,
        query,
    }: {
        path: { apiVersion: string }
        query?: {
            parameterOptionalStringWithDefault?: string
            parameterOptionalStringWithEmptyDefault?: string
            parameterOptionalStringWithNoDefault?: string
            parameterStringWithDefault: string
            parameterStringWithEmptyDefault: string
            parameterStringWithNoDefault: string
            parameterStringNullableWithNoDefault?: string
            parameterStringNullableWithDefault?: string
        }
    }) {
        return this.client.put(`api/v${path.apiVersion}/defaults`, {
            searchParams: query ?? {},
        })
    }

    public callWithDefaultOptionalParameters({
        path,
        query,
    }: {
        path: { apiVersion: string }
        query?: {
            parameterString?: string
            parameterNumber?: string
            parameterBoolean?: string
            parameterEnum?: string
            parameterModel?: string
        }
    }) {
        return this.client.post(`api/v${path.apiVersion}/defaults`, {
            searchParams: query ?? {},
        })
    }

    public callWithDefaultParameters({
        path,
        query,
    }: {
        path: { apiVersion: string }
        query?: {
            parameterString?: string
            parameterNumber?: string
            parameterBoolean?: string
            parameterEnum?: string
            parameterModel?: string
        }
    }) {
        return this.client.get(`api/v${path.apiVersion}/defaults`, {
            searchParams: query ?? {},
        })
    }

    public callWithDescriptions({
        path,
        query,
    }: {
        path: { apiVersion: string }
        query?: {
            parameterWithBreaks?: string
            parameterWithBackticks?: string
            parameterWithSlashes?: string
            parameterWithExpressionPlaceholders?: string
            parameterWithQuotes?: string
            parameterWithReservedCharacters?: string
        }
    }) {
        return this.client.post(`api/v${path.apiVersion}/descriptions/`, {
            searchParams: query ?? {},
        })
    }

    public callWithDuplicateResponses({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<Exclude<StatusCode<2>, '200' | '201' | '202'>, ModelWithBoolean>
        | SuccessResponse<'200', CallWithDuplicateResponsesResponse200>
        | SuccessResponse<'201', ModelWithString>
        | SuccessResponse<'202', ModelWithString>
        | FailureResponse<'500', ModelWithStringError, 'response:statuscode'>
        | FailureResponse<'501', ModelWithStringError, 'response:statuscode'>
        | FailureResponse<'502', ModelWithStringError, 'response:statuscode'>
        | FailureResponse<'4XX', DictionaryWithArray, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '500' | '501' | '502' | '4XX'>,
              string,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/response`, {
                responseType: 'json',
            }),
            {
                200: CallWithDuplicateResponsesResponse200,
                201: ModelWithString,
                202: ModelWithString,
                500: ModelWithStringError,
                501: ModelWithStringError,
                502: ModelWithStringError,
                '4XX': DictionaryWithArray,
                default: ModelWithBoolean,
            },
        ) as ReturnType<this['callWithDuplicateResponses']>
    }

    public callWithNoContentResponse({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'204', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/no-content`, {
                responseType: 'text',
            }),
            {
                204: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['callWithNoContentResponse']>
    }

    public callWithParameters({
        body,
        path,
        query,
        headers,
    }: {
        body: CallWithParametersRequest
        path: { parameterPath: string; apiVersion: string }
        query?: { foo_ref_enum?: string; foo_all_of_enum: string; cursor: string }
        headers: { parameterHeader: string }
    }) {
        const _body = this.validateRequestBody(CallWithParametersRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.client.post(`api/v${path.apiVersion}/parameters/${path.parameterPath}`, {
            json: _body.right as CallWithParametersRequest,
            searchParams: query ?? {},
            headers: headers,
        })
    }

    public callWithResponse({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<StatusCode<2>, Import>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/response`, {
                responseType: 'json',
            }),
            {
                default: Import,
            },
        ) as ReturnType<this['callWithResponse']>
    }

    public callWithResponseAndNoContentResponse({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'200', CallWithResponseAndNoContentResponseResponse200>
        | SuccessResponse<'204', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/multiple-tags/response-and-no-content`, {
                responseType: 'json',
            }),
            {
                200: CallWithResponseAndNoContentResponseResponse200,
                204: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['callWithResponseAndNoContentResponse']>
    }

    public callWithResponses({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<Exclude<StatusCode<2>, '200' | '201' | '202'>, ModelWithStringError>
        | SuccessResponse<'200', CallWithResponsesResponse200>
        | SuccessResponse<'201', ModelThatExtends>
        | SuccessResponse<'202', ModelThatExtendsExtends>
        | FailureResponse<'500', ModelWithStringError, 'response:statuscode'>
        | FailureResponse<'501', ModelWithStringError, 'response:statuscode'>
        | FailureResponse<'502', ModelWithStringError, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '500' | '501' | '502'>,
              string,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        return this.awaitResponse(
            this.client.put(`api/v${path.apiVersion}/response`, {
                responseType: 'json',
            }),
            {
                200: CallWithResponsesResponse200,
                201: ModelThatExtends,
                202: ModelThatExtendsExtends,
                500: ModelWithStringError,
                501: ModelWithStringError,
                502: ModelWithStringError,
                default: ModelWithStringError,
            },
        ) as ReturnType<this['callWithResponses']>
    }

    public callWithResultFromHeader({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'500', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '500'>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/header`, {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
                400: { parse: (x: unknown) => ({ right: x }) },
                500: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['callWithResultFromHeader']>
    }

    public callWithWeirdParameterNames({
        body,
        path,
        query,
        headers,
    }: {
        body: ModelWithString
        path: { parameterPath1: string; parameterPath2: string; parameterPath3: string; apiVersion: string }
        query?: { default?: string; 'parameter-query': string }
        headers: { 'parameter.header': string }
    }) {
        const _body = this.validateRequestBody(ModelWithString, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.client.post(
            `api/v${path.apiVersion}/parameters/${path.parameterPath1}/${path.parameterPath2}/${path.parameterPath3}`,
            {
                json: _body.right as ModelWithString,
                searchParams: query ?? {},
                headers: headers,
            },
        )
    }

    public collectionFormat({
        path,
        query,
    }: {
        path: { apiVersion: string }
        query: {
            parameterArrayCSV: string
            parameterArraySSV: string
            parameterArrayTSV: string
            parameterArrayPipes: string
            parameterArrayMulti: string
        }
    }) {
        return this.client.get(`api/v${path.apiVersion}/collectionFormat`, {
            searchParams: query,
        })
    }

    public complexParams({
        body,
        path,
    }: { body: ComplexParamsRequest; path: { id: string; apiVersion: string } }): Promise<
        | SuccessResponse<'200', ModelWithString>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(ComplexParamsRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.put(`api/v${path.apiVersion}/complex/${path.id}`, {
                json: _body.right as ComplexParamsRequest,
                responseType: 'json',
            }),
            {
                200: ModelWithString,
            },
        ) as ReturnType<this['complexParams']>
    }

    public complexTypes({
        path,
        query,
    }: { path: { apiVersion: string }; query: { parameterObject: string; parameterReference: string } }): Promise<
        | SuccessResponse<'200', ComplexTypesResponse>
        | FailureResponse<'400', unknown, 'response:statuscode'>
        | FailureResponse<'500', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, '400' | '500'>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/complex`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: ComplexTypesResponse,
                400: { parse: (x: unknown) => ({ right: x }) },
                500: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['complexTypes']>
    }

    public createApiFormDatum({ path, query }: { path: { apiVersion: string }; query?: { parameter?: string } }) {
        return this.client.post(`api/v${path.apiVersion}/formData/`, {
            searchParams: query ?? {},
        })
    }

    public createApiRequestBody({
        body,
        path,
        query,
    }: { body: ModelWithString; path: { apiVersion: string }; query?: { parameter?: string } }) {
        const _body = this.validateRequestBody(ModelWithString, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.client.post(`api/v${path.apiVersion}/requestBody/`, {
            json: _body.right as ModelWithString,
            searchParams: query ?? {},
        })
    }

    public deleteCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client.delete(`api/v${path.apiVersion}/simple`)
    }

    public deleteFoo({
        path,
        headers,
    }: { path: { fooParam: string; barParam: string; apiVersion: string }; headers: { 'x-Foo-Bar': string } }) {
        return this.client.delete(`api/v${path.apiVersion}/foo/${path.fooParam}/bar/${path.barParam}`, {
            headers: headers,
        })
    }

    /**
     * @deprecated
     */
    public deprecatedCall({ path, headers }: { path: { apiVersion: string }; headers: { parameter: string } }) {
        return this.client.post(`api/v${path.apiVersion}/parameters/deprecated`, {
            headers: headers,
        })
    }

    public dummyA({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'200', Hey2>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/multiple-tags/a`, {
                responseType: 'json',
            }),
            {
                200: Hey2,
            },
        ) as ReturnType<this['dummyA']>
    }

    public dummyB({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'204', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/multiple-tags/b`, {
                responseType: 'text',
            }),
            {
                204: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['dummyB']>
    }

    public getDuplicateName({ path }: { path: { apiVersion: string } }) {
        return this.client.get(`api/v${path.apiVersion}/duplicate`)
    }

    public putDuplicateName({ path }: { path: { apiVersion: string } }) {
        return this.client.put(`api/v${path.apiVersion}/duplicate`)
    }

    public postDuplicateName({ path }: { path: { apiVersion: string } }) {
        return this.client.post(`api/v${path.apiVersion}/duplicate`)
    }

    public deleteDuplicateName({ path }: { path: { apiVersion: string } }) {
        return this.client.delete(`api/v${path.apiVersion}/duplicate`)
    }

    public export({ path }: { path: { apiVersion: string } }) {
        return this.client.get(`api/v${path.apiVersion}/no-tag`)
    }

    public fileResponse({
        path,
    }: { path: { id: string; apiVersion: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/file/${path.id}`, {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['fileResponse']>
    }

    public getCallWithOptionalParam({
        body,
        path,
        query,
    }: { body: ModelWithOneOfEnum; path: { apiVersion: string }; query?: { page?: string } }) {
        const _body = this.validateRequestBody(ModelWithOneOfEnum, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.client.get(`api/v${path.apiVersion}/parameters/`, {
            json: _body.right as ModelWithOneOfEnum,
            searchParams: query ?? {},
        })
    }

    public getCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client.get(`api/v${path.apiVersion}/simple`)
    }

    public headCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client(`api/v${path.apiVersion}/simple`, {
            method: 'HEAD',
        })
    }

    public import({
        body,
        path,
    }: { body: ImportRequest; path: { apiVersion: string } }): Promise<
        | SuccessResponse<Exclude<StatusCode<2>, '200'>, ModelWithReadOnlyAndWriteOnly>
        | SuccessResponse<'200', ModelFromZendesk>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(ImportRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/no-tag`, {
                json: _body.right as ImportRequest,
                responseType: 'json',
            }),
            {
                200: ModelFromZendesk,
                default: ModelWithReadOnlyAndWriteOnly,
            },
        ) as ReturnType<this['import']>
    }

    public multipartRequest({ path }: { path: { apiVersion: string } }) {
        return this.client.post(`api/v${path.apiVersion}/multipart`)
    }

    public multipartResponse({
        path,
    }: { path: { apiVersion: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/multipart`, {
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['multipartResponse']>
    }

    public nonAscii({
        path,
        query,
    }: { path: { apiVersion: string }; query: { nonAsciiParamæøåÆØÅöôêÊ: string } }): Promise<
        | SuccessResponse<'200', NonAsciiResponse>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/non-ascii-æøåÆØÅöôêÊ字符串`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: NonAsciiResponse,
            },
        ) as ReturnType<this['nonAscii']>
    }

    public optionsCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client(`api/v${path.apiVersion}/simple`, {
            method: 'OPTIONS',
        })
    }

    public patchCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client.patch(`api/v${path.apiVersion}/simple`)
    }

    public postCallWithOptionalParam({
        body,
        path,
        query,
    }: { body: PostCallWithOptionalParamRequest; path: { apiVersion: string }; query: { parameter: string } }): Promise<
        | SuccessResponse<'200', PostCallWithOptionalParamResponse200>
        | SuccessResponse<'204', unknown>
        | FailureResponse<undefined, unknown, 'request:body', undefined>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        const _body = this.validateRequestBody(PostCallWithOptionalParamRequest, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/parameters/`, {
                json: _body.right as PostCallWithOptionalParamRequest,
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: PostCallWithOptionalParamResponse200,
                204: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['postCallWithOptionalParam']>
    }

    public postCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client.post(`api/v${path.apiVersion}/simple`)
    }

    public putCallWithoutParametersAndResponse({ path }: { path: { apiVersion: string } }) {
        return this.client.put(`api/v${path.apiVersion}/simple`)
    }

    /**
     * Login User
     */
    public putWithFormUrlEncoded({ body, path }: { body: ArrayWithStrings; path: { apiVersion: string } }) {
        const _body = this.validateRequestBody(ArrayWithStrings, body)
        if ('left' in _body) {
            return Promise.resolve(_body)
        }

        return this.client.put(`api/v${path.apiVersion}/non-ascii-æøåÆØÅöôêÊ字符串`, {
            form: _body.right as ArrayWithStrings,
        })
    }

    public testErrorCode({
        path,
        query,
    }: { path: { apiVersion: string }; query: { status: string } }): Promise<
        | SuccessResponse<'200', unknown>
        | FailureResponse<'500', unknown, 'response:statuscode'>
        | FailureResponse<'501', unknown, 'response:statuscode'>
        | FailureResponse<'502', unknown, 'response:statuscode'>
        | FailureResponse<'503', unknown, 'response:statuscode'>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<
              Exclude<StatusCode<1 | 3 | 4 | 5>, '500' | '501' | '502' | '503'>,
              string,
              'response:statuscode',
              IncomingHttpHeaders
          >
    > {
        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/error`, {
                searchParams: query,
                responseType: 'text',
            }),
            {
                200: { parse: (x: unknown) => ({ right: x }) },
                500: { parse: (x: unknown) => ({ right: x }) },
                501: { parse: (x: unknown) => ({ right: x }) },
                502: { parse: (x: unknown) => ({ right: x }) },
                503: { parse: (x: unknown) => ({ right: x }) },
            },
        ) as ReturnType<this['testErrorCode']>
    }

    public types({
        path,
        query,
    }: {
        path: { id: string; apiVersion: string }
        query: {
            parameterNumber: string
            parameterString: string
            parameterBoolean: string
            parameterObject: string
            parameterArray: string
            parameterDictionary: string
            parameterEnum: string
        }
    }): Promise<
        | SuccessResponse<'200', TypesResponse200>
        | SuccessResponse<'201', TypesResponse201>
        | SuccessResponse<'202', TypesResponse202>
        | SuccessResponse<'203', TypesResponse203>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.get(`api/v${path.apiVersion}/types`, {
                searchParams: query,
                responseType: 'json',
            }),
            {
                200: TypesResponse200,
                201: TypesResponse201,
                202: TypesResponse202,
                203: TypesResponse203,
            },
        ) as ReturnType<this['types']>
    }

    public uploadFile({
        body,
        path,
    }: { body: FormData; path: { apiVersion: string } }): Promise<
        | SuccessResponse<'200', UploadFileResponse>
        | FailureResponse<StatusCode<2>, string, 'response:body', IncomingHttpHeaders>
        | FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', IncomingHttpHeaders>
    > {
        return this.awaitResponse(
            this.client.post(`api/v${path.apiVersion}/upload`, {
                form: body,
                responseType: 'json',
            }),
            {
                200: UploadFileResponse,
            },
        ) as ReturnType<this['uploadFile']>
    }

    public validateRequestBody<Parser extends { parse: (o: unknown) => { left: DefinedError[] } | { right: Body } }, Body>(
        parser: Parser,
        body: unknown,
    ) {
        const _body = parser.parse(body)
        if ('left' in _body) {
            return {
                statusCode: undefined,
                status: undefined,
                headers: undefined,
                left: body,
                validationErrors: _body.left,
                where: 'request:body',
            } satisfies FailureResponse<undefined, unknown, 'request:body', undefined>
        }
        return _body
    }

    public async awaitResponse<
        I,
        S extends Record<PropertyKey, { parse: (o: I) => { left: DefinedError[] } | { right: unknown } } | undefined>,
    >(response: CancelableRequest<Response<I>>, schemas: S) {
        const result = await response
        const status =
            result.statusCode < 200
                ? 'informational'
                : result.statusCode < 300
                  ? 'success'
                  : result.statusCode < 400
                    ? 'redirection'
                    : result.statusCode < 500
                      ? 'client-error'
                      : 'server-error'
        const validator = schemas[result.statusCode] ?? schemas.default
        const body = validator?.parse?.(result.body)
        if (result.statusCode < 200 || result.statusCode >= 300) {
            return {
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: body !== undefined && 'right' in body ? body.right : result.body,
                validationErrors: body !== undefined && 'left' in body ? body.left : undefined,
                where: 'response:statuscode',
            }
        }
        if (body === undefined || 'left' in body) {
            return {
                statusCode: result.statusCode.toString(),
                status,
                headers: result.headers,
                left: result.body,
                validationErrors: body?.left,
                where: 'response:body',
            }
        }
        return { statusCode: result.statusCode.toString(), status, headers: result.headers, right: result.body }
    }
}

export type Status<Major> = Major extends string
    ? Major extends `1${number}`
        ? 'informational'
        : Major extends `2${number}`
          ? 'success'
          : Major extends `3${number}`
            ? 'redirection'
            : Major extends `4${number}`
              ? 'client-error'
              : 'server-error'
    : undefined
export interface SuccessResponse<StatusCode extends string, T> {
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: IncomingHttpHeaders
    right: T
}
export interface FailureResponse<StatusCode = string, T = unknown, Where = never, Headers = IncomingHttpHeaders> {
    statusCode: StatusCode
    status: Status<StatusCode>
    headers: Headers
    validationErrors: DefinedError[] | undefined
    left: T
    where: Where
}
export type StatusCode<Major extends number = 1 | 2 | 3 | 4 | 5> = `${Major}${number}`
