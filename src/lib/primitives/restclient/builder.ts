import { entriesOf, isDefined, keysOf, memoize, omitUndefined, pick, unique, valuesOf } from '@skyleague/axioms'
import camelCase from 'camelcase'
import type CodeBlockWriter from 'code-block-writer'
import { capitalize, singularize } from 'inflection'
import * as pointer from 'jsonpointer'
import converter from 'swagger2openapi'
import { sanitizeTypescriptTypeName } from '../../../commands/generate/output/typescript.js'
import { jsonPointer } from '../../../common/json/json.js'
import type { JsonSchema } from '../../../json.js'
import type { OpenapiV3, Operation, Parameter, PathItem, RequestBody, Response, Responses } from '../../../types/openapi.type.js'
import { constants } from '../../constants.js'
import type { TypescriptOutput } from '../../cst/cst.js'
import { ajvSymbols, gotSymbols, httpSymbols, kySymbols, zodSymbols } from '../../cst/module.js'
import { Node } from '../../cst/node.js'
import { JSDoc } from '../../visitor/typescript/jsdoc.js'
import { asString, objectProperty } from '../../visitor/typescript/literal.js'
import type { TypescriptTypeWalkerContext } from '../../visitor/typescript/typescript-type.js'
import { createWriter } from '../../writer.js'
import { $jsonschema } from '../jsonschema/jsonschema.js'
import type { RestClientOptions } from './restclient.js'
import { type MappableSecurityScheme, toSecurityDeclaration, toSecurityHook } from './security.js'

const methodToName: Record<string, string> = {
    get: 'get',
    put: 'set',
    post: 'create',
    delete: 'delete',
    options: 'options',
    head: 'describe',
    patch: 'patch',
    trace: 'trace',
}

export function methodIsMutation(method: string) {
    return ['post', 'put', 'delete'].includes(method)
}

export function methodName(
    path: string,
    method: string,
    operation: Operation,
    { preferOperationId = true }: { preferOperationId?: boolean } = {},
) {
    if (preferOperationId && operation.operationId !== undefined) {
        return camelCase(sanitizeTypescriptTypeName(operation.operationId))
    }
    const [, relevantPath, action] = path.match(/^(.*?)(?::(.*))?$/) ?? [undefined, undefined, undefined]
    const hasAction = action !== undefined

    const pathParts = relevantPath
        ?.replaceAll(':', '/')
        .replaceAll('}{', '}/{')
        .split('/')
        .filter((p) => p.length > 0)
        .map((p, i, xs) => ({ name: p, isLast: i === xs.length - 1, isFirst: i === 0 }))
    const staticParts =
        pathParts
            ?.filter((p) => !p.name.includes('{'))
            .map((p) => (!p.isLast || methodIsMutation(method) ? singularize(p.name) : p.name)) ?? []
    const dynamicParts =
        pathParts
            ?.filter((p) => p.name.includes('{'))
            .filter((x) => x.isLast || x.isFirst)
            .map((p) => p.name.match(/^{(.*)}$/)?.[1]) ?? []

    return camelCase(
        [
            action ?? methodToName[method],
            ...staticParts,
            ...(dynamicParts.length > 0 && !hasAction ? ['by', dynamicParts.join('_and_')] : []),
        ].join('_'),
    )
}

const jsonMime = /(application|\*)\/(.*json|\*)/
const yamlMime = /(application|\*)\/(.*yaml|\*)/
const formUrlEncodedMime = /^application\/x-www-form-urlencoded$/
const binaryMime = /application\/.*octet-stream/
const multipartFormMime = /^multipart\/form-data$/

export type AsRequestBody =
    | {
          schema?: Node
          name: 'body'
          type: 'json' | 'form' | 'body'
          mimeType?: string
          definition: (args: { reference: (node: Node) => string }) => string
          variableName?: string
          precode?: (args: { reference: (node: Node) => string }) => string
      }
    | {
          schema?: undefined
          mimeType?: string
          name: 'body'
          type: 'body'
          definition: (args: { reference: (node: Node) => string }) => string
          variableName?: string
          precode?: (args: { reference: (node: Node) => string }) => string
      }

export type ResponseBodyDefinition =
    | {
          statusCode: string
          schema: Node
          mimeType: string
          type: 'json'
          isUnknown?: boolean
      }
    | {
          statusCode: string
          schema: Node | undefined
          mimeType: string | undefined
          type: 'text'
          isUnknown?: boolean
      }

export interface ResponseBodies {
    responses: Record<string, ResponseBodyDefinition>
    success: ResponseBodyDefinition[]
    failure: ResponseBodyDefinition[]
    default?: ResponseBodyDefinition | undefined
    mimeType?: string | undefined
    responseType?: 'json' | 'text' | undefined
}

export const parseString = {
    ajv: '{ parse: (x: unknown) => ({ right: x }) }',
    zod: '{ safeParse: (x: unknown) => ({ success: true, data: x }) }',
}
export const parseUnknown = {
    ajv: '{ parse: (x: unknown) => ({ right: x }) }',
    zod: '{ safeParse: (x: unknown) => ({ success: true, data: x }) }',
}
export const isStringIs = {
    ajv: '{is: (x: unknown): x is string => true}',
    zod: '{parse: (x: unknown): string => x as string}',
}

export const isUnknownIs = {
    ajv: '{is: (x: unknown): x is unknown => true}',
    zod: '{parse: (x: unknown): unknown => x}',
}

export interface AsPathItem {
    httpMethod: string
    method: string
    path: `x-${string}` | `/${string}`
    pathItem: PathItem
    operation: Operation
}

export class EitherHelper extends Node {
    public override _type = 'restclient:either' as const
    public override _name = 'restclient:either'
    public override _canReference: false = false
    public client: 'ky' | 'got' | undefined

    public override get _output(): TypescriptOutput[] {
        return [
            {
                type: 'typescript' as const,
                subtype: undefined,
                isTypeOnly: true,
                isGenerated: () => true,
                targetPath: ({ _sourcePath: sourcePath }) => sourcePath,
                definition: (_: Node, { reference }) => {
                    const IncomingHttpHeaders =
                        this.client === 'ky' ? 'Headers' : reference(httpSymbols.IncomingHttpHeadersNode())
                    const HeaderVar = this.client === 'ky' ? 'HeaderResponse' : 'Headers'

                    const writer = createWriter()
                        .writeLine(
                            "export type Status<Major> = Major extends string ? Major extends `1${number}`? 'informational': Major extends `2${number}` ? 'success' : Major extends `3${number}` ? 'redirection' : Major extends `4${number}` ? 'client-error' : 'server-error' : undefined",
                        )
                        .writeLine(
                            `export interface SuccessResponse<StatusCode extends string, T> { success: true; statusCode: StatusCode; status: Status<StatusCode>; headers: ${IncomingHttpHeaders}; right: T }`,
                        )
                        .writeLine(
                            `export interface FailureResponse<StatusCode = string, T = unknown, Where = never, ${HeaderVar} = ${IncomingHttpHeaders}> {`,
                        )
                        .writeLine('success: false')
                        .writeLine('statusCode: StatusCode')
                        .writeLine('status: Status<StatusCode>')
                        .writeLine(`headers: ${HeaderVar}`)
                    if (this._validator === 'ajv') {
                        const DefinedError = reference(ajvSymbols.DefinedError())
                        writer.writeLine(`validationErrors: ${DefinedError}[] | undefined`)
                    } else if (this._validator === 'zod') {
                        const ZodError = reference(zodSymbols.ZodError())
                        writer.writeLine(`error: ${ZodError}<T> | undefined`)
                    }
                    return (
                        writer
                            .writeLine('left: T')
                            .writeLine('where: Where')
                            .writeLine('}')
                            // .writeLine('type ParseInt<T> = T extends `${infer N extends number}` ? N : never')
                            // .writeLine('type digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9')
                            .writeLine('export type StatusCode<Major extends number = 1 | 2 | 3 | 4 | 5> = `${Major}${number}`')
                            .newLine()
                            .toString()
                    )
                },
            },
        ]
    }

    private static _cache = new Map<string, EitherHelper>()
    public static from({ sourcePath, client }: { sourcePath: string; client: 'ky' | 'got' | undefined }) {
        if (EitherHelper._cache.has(sourcePath)) {
            // biome-ignore lint/style/noNonNullAssertion: ignore
            return EitherHelper._cache.get(sourcePath)!
        }
        const instance = new EitherHelper({})
        EitherHelper._cache.set(sourcePath, instance)
        instance._sourcePath = sourcePath
        instance.client = client
        return instance
    }
}

export class RestClientBuilder {
    public openapi: OpenapiV3
    public options: Required<Omit<RestClientOptions, 'filename'>>
    public references = new Map<string, () => Node>()
    public connections: Node[] = []
    public pathItems: AsPathItem[]

    public requestBodies = new WeakMap<AsPathItem, AsRequestBody | undefined>()
    public responseBodies = new WeakMap<AsPathItem, ResponseBodies | undefined>()

    public children: Node[] = []

    public hasAwaitResponse = false
    public hasValidateRequestBody = false

    public static async from(definition: OpenapiV3, options: Partial<RestClientOptions> = {}) {
        if ((definition as { swagger?: string }).swagger?.startsWith('2.')) {
            console.warn('Loading swagger 2.0 definitions will be deprecated in the future, please use openapi 3.0/3.1 instead')
        }
        const converted: { openapi: OpenapiV3 } = await converter.convertObj(definition, {
            path: true,
        })
        const openapi: OpenapiV3 =
            options.transformOpenapi === undefined ? converted.openapi : options.transformOpenapi(converted.openapi)

        return new RestClientBuilder(openapi, options)
    }

    private constructor(
        openapi: OpenapiV3,
        {
            transformOpenapi = (x) => x,
            preferOperationId = true,
            useEither = true,
            explicitContentNegotiation = false,
            strict = false,
            optionalNullable = false,
            allowIntersectionTypes = false,
            compile = true,
            formats = true,
            client = 'got',
            validator = constants.defaultValidator,
        }: Partial<RestClientOptions> = {},
    ) {
        this.openapi = openapi
        this.options = {
            transformOpenapi,
            preferOperationId,
            useEither,
            explicitContentNegotiation,
            strict,
            optionalNullable,
            allowIntersectionTypes,
            compile,
            formats,
            client,
            validator,
        }
        this.pathItems = this._pathItems

        const seenChildren = new WeakSet<Node>()
        for (const item of this.pathItems) {
            const { operation, method } = item
            const requestBody = this.asRequestBody({
                request: jsonPointer({ schema: openapi, ptr: operation.requestBody }) as RequestBody | undefined,
                method,
            })
            this.requestBodies.set(item, requestBody)

            if (requestBody?.schema !== undefined && !seenChildren.has(requestBody.schema)) {
                this.children.push(requestBody.schema)
                seenChildren.add(requestBody.schema)
            }

            const responses = this.asResponseBodies({
                responses: operation.responses,
                method,
            })
            this.responseBodies.set(item, responses)

            for (const [, { schema: responseSchema }] of entriesOf(responses?.responses ?? {})) {
                if (responseSchema !== undefined && !seenChildren.has(responseSchema)) {
                    this.children.push(responseSchema)
                    seenChildren.add(responseSchema)
                }
            }
        }
    }

    public definition(node: Node, { declare, reference, value }: TypescriptTypeWalkerContext): string {
        const writer = createWriter()
        const IncomingHttpHeaders = memoize(() => reference(httpSymbols.IncomingHttpHeadersNode()))

        writer.write(declare('class', node)).block(() => {
            this.writeConstructor({ reference, value, writer })

            for (const item of this.pathItems) {
                const { httpMethod, pathItem, path, operation, method } = item
                const { securities } = this.security({ reference })
                const request = this.requestBodies.get(item)
                let hasBodyValidation = false
                let requestValidationStr = ''
                if (request?.schema !== undefined) {
                    hasBodyValidation = true
                    this.hasValidateRequestBody = true
                    if (this.options.useEither) {
                        requestValidationStr = createWriter()
                            .writeLine(`const _body = this.validateRequestBody(${value(request.schema)}, ${request.name})`)
                            .writeLine("if ('left' in _body) {")
                            .writeLine('return Promise.resolve(_body)')
                            .writeLine('}')
                            .toString()
                        request.variableName ??= '_body.right' //`_body.right as ${reference(request.schema)}`
                    } else {
                        requestValidationStr = `this.validateRequestBody(${value(request.schema)}, ${request.name})`
                    }
                }
                const parameters: Parameter[] = Iterator.from(
                    unique(
                        [...(operation.parameters ?? []), ...(pathItem.parameters ?? [])]
                            .map((parameter) => jsonPointer({ schema: this.openapi, ptr: parameter }) as Parameter | undefined)
                            .filter(isDefined),
                        (a, b) => a.name === b.name && a.in === b.in,
                    ),
                ).toArray()

                let clientDecl = 'this.client'
                const authMethods: string[] = []
                const security = operation.security ?? this.openapi.security
                const usedSecurityHeaders: string[] = []
                if (security !== undefined) {
                    const hasAuthParameters = operation.security !== undefined && operation.security.length > 0
                    for (const secMethods of security) {
                        const required = keysOf(secMethods)
                            .map((sm) => securities.find((s) => s.type === sm)?.name)
                            .filter((x): x is string => x !== undefined)
                        authMethods.push(`[${required.map((r) => `'${r}'`).join(', ')}]`)
                        usedSecurityHeaders.push(
                            ...keysOf(secMethods)
                                .flatMap((sm) => securities.find((s) => s.type === sm)?.headers)
                                .filter((x): x is string => x !== undefined),
                        )
                    }
                    clientDecl = `this.buildClient(${hasAuthParameters ? 'auth' : ''})`
                }

                // check if there are implicit path parameters
                const ids = path
                    .split('/')
                    .map((x) => x.match(/{(.*?)}/)?.[1])
                    .filter(isDefined)
                for (const id of ids) {
                    const found = parameters.find((p) => p.in === 'path' && p.name === id)
                    if (found === undefined) {
                        parameters.push({
                            in: 'path',
                            name: id,
                            required: true,
                        })
                    }
                }

                const pathParameters = this.asPathParameters(parameters)
                const queryParameters = this.asQueryParameters(parameters)
                const headerParameters = this.asHeaderParameters(parameters, usedSecurityHeaders)

                // biome-ignore lint/style/noNonNullAssertion: this was already checked
                const responses = this.responseBodies.get(item)!

                const parameterizedPath = pathParameters
                    .reduce<string>((p, x) => p.replace(`{${x.id}}`, `{${x.name}}`), path)
                    .replaceAll('{', '${path.')

                const urlPath = parameterizedPath.startsWith('/') ? parameterizedPath.slice(1) : parameterizedPath

                const pathArguments = pathParameters.map((p) => `${p.name}: ${p.type}`).join(', ')
                const queryArguments = queryParameters
                    .map((p) => `${objectProperty(p.name)}${p.required === true ? '' : '?'}: ${p.type}`)
                    .join(', ')
                const queryOptionalStr = queryParameters.every((q) => q.required === true) ? '' : '?'
                const headerArguments = headerParameters
                    .map((p) => `${objectProperty(p.name)}${p.required === true ? '' : '?'}: ${p.type}`)
                    .join(', ')

                const hasRequiredBody = request?.definition({ reference }) !== undefined
                const hasRequiredPathArgument = pathArguments.length > 0
                const hasRequiredQueryArguments = queryParameters.some((q) => q.required === true)
                const hasRequiredHeaderArguments = headerParameters.some((q) => q.required === true)

                const hasRequiredArguments =
                    hasRequiredBody || hasRequiredPathArgument || hasRequiredQueryArguments || hasRequiredHeaderArguments

                const headerOptionalStr = hasRequiredHeaderArguments ? '' : '?'
                const methodArgumentsInner = [
                    ...(request?.definition !== undefined
                        ? [[request.name, `${request.name}: ${request.definition({ reference })}`]]
                        : []),
                    ...(pathArguments.length > 0 ? [['path', `path: { ${pathArguments} }`]] : []),
                    ...(queryArguments.length > 0 ? [['query', `query${queryOptionalStr}: { ${queryArguments} }`]] : []),
                    ...(headerArguments.length > 0 ? [['headers', `headers${headerOptionalStr}: { ${headerArguments} }`]] : []),
                    ...(operation.security?.length !== undefined && operation.security.length > 0
                        ? [[`auth = [${authMethods.join(', ')}]`, 'auth?: string[][] | string[]']]
                        : []),
                ]

                const methodArguments =
                    methodArgumentsInner.length > 0
                        ? `{${methodArgumentsInner.map(([name]) => name).join(', ')}}: {${methodArgumentsInner
                              .map(([, a]) => a)
                              .join(', ')}}`
                        : ''

                writer.write('\n')
                const jsdoc = JSDoc.from({
                    prepend: `${httpMethod.toUpperCase()} ${path}`,
                    _definition: operation,
                })
                if (jsdoc !== undefined) {
                    writer.write(jsdoc)
                }

                const hasResponse = responses !== undefined
                let responseType: 'json' | 'text' | undefined
                this.hasAwaitResponse ||= hasResponse

                writer.write(
                    `public ${method}(${methodArguments}${
                        methodArgumentsInner.length > 0 && !hasRequiredArguments ? ' = {}' : ''
                    })`,
                )

                if (this.options.useEither && hasResponse) {
                    writer.write(': Promise<')

                    const successCodes: string[] = responses.success.map((s) => s.statusCode)
                    const errorCodes: string[] = responses.failure.map((s) => s.statusCode)

                    const hasDefault = responses.default !== undefined
                    if (hasDefault) {
                        const responseRef = responses.default?.schema !== undefined ? value(responses.default.schema) : undefined
                        if (responseRef !== undefined) {
                            if (successCodes.length > 0) {
                                // typescript collapses this variant too eagerly and makes it `2${number}`
                                // writer.writeLine(
                                //     `| SuccessResponse<Exclude<StatusCode<2>, ${successCodes
                                //         .map((s) => `"${s}"`)
                                //         .join(' | ')}>, ${responseRef}>`,
                                // )
                                const knownSuccessCodes = new Set(
                                    [200, 201, 202, 203, 204, 205, 206, 207, 208, 226].map((x) => x.toString()),
                                )
                                for (const definedCode of successCodes) {
                                    knownSuccessCodes.delete(definedCode)
                                }
                                writer.writeLine(
                                    `| SuccessResponse<${[...knownSuccessCodes].map((s) => `"${s}"`).join(' | ')}, ${responseRef}>`,
                                )
                            } else {
                                writer.writeLine(`| SuccessResponse<StatusCode<2>, ${responseRef}>`)
                            }
                        }
                    }
                    for (const [statusCode, responseSchema] of entriesOf(responses.responses)) {
                        if (statusCode === 'default') {
                            continue
                        }
                        const isError = !statusCode.startsWith('2')
                        const responseRef = responseSchema.schema !== undefined ? value(responseSchema.schema) : 'unknown'
                        if (isError) {
                            writer.writeLine(`| FailureResponse<'${statusCode}', ${responseRef}, 'response:statuscode'>`)
                        } else {
                            writer.writeLine(`| SuccessResponse<'${statusCode}', ${responseRef}>`)
                        }
                    }

                    if (hasBodyValidation) {
                        writer.writeLine(`| FailureResponse<undefined, unknown, 'request:body', undefined>`)
                    }

                    const ClientIncomingHttpHeaders = this.options.client === 'ky' ? () => 'Headers' : IncomingHttpHeaders

                    writer.writeLine(`| FailureResponse<StatusCode<2>, string, 'response:body', ${ClientIncomingHttpHeaders()}>`)

                    if (errorCodes.length > 0) {
                        writer.writeLine(
                            `| FailureResponse<Exclude<StatusCode<1 | 3 | 4 | 5>, ${errorCodes
                                .map((s) => `"${s}"`)
                                .join(' | ')}>, unknown, 'response:statuscode', ${ClientIncomingHttpHeaders()}>`,
                        )
                    } else {
                        writer.writeLine(
                            `| FailureResponse<StatusCode<1 | 3 | 4 | 5>, string, 'response:statuscode', ${ClientIncomingHttpHeaders()}>`,
                        )
                    }

                    writer.write('>')
                }
                writer.newLine()

                writer
                    .block(() => {
                        const hasInputObj =
                            request !== undefined ||
                            queryParameters.length > 0 ||
                            headerParameters.length > 0 ||
                            (this.options.explicitContentNegotiation && hasResponse)
                        const hasSyntaxSugarMethod = ['get', 'delete', 'post', 'put', 'patch'].includes(httpMethod)
                        writer.conditionalWriteLine(requestValidationStr !== '', `${requestValidationStr}\n`)
                        if (request?.precode !== undefined) {
                            writer.writeLine(request.precode({ reference }))
                        }
                        writer
                            .conditionalWrite(hasResponse, 'return this.awaitResponse(')
                            .conditionalWrite(!hasResponse, 'return ')
                            .conditionalWrite(hasSyntaxSugarMethod, `${clientDecl}.${httpMethod}(${asString(urlPath)}`)
                            .conditionalWrite(!hasSyntaxSugarMethod, `${clientDecl}(${asString(urlPath)}`)
                        if (hasInputObj || hasResponse || !hasSyntaxSugarMethod) {
                            writer
                                .write(', ')
                                .inlineBlock(() => {
                                    writer
                                        .conditionalWrite(
                                            request !== undefined,
                                            `${request?.type ?? ''}: ${request?.variableName ?? request?.name ?? ''},`,
                                        )
                                        .conditionalWrite(
                                            queryParameters.length > 0,
                                            `searchParams: query${queryOptionalStr.length > 0 ? ' ?? {}' : ''},`,
                                        )

                                    let hasWrittenHeaders = false
                                    if (
                                        this.options.explicitContentNegotiation &&
                                        hasResponse &&
                                        responses.mimeType !== undefined
                                    ) {
                                        writer.write(
                                            `headers: { Accept: "${responses.mimeType}"${
                                                headerParameters.length > 0 ? ', ...headers' : ''
                                            } },`,
                                        )
                                        hasWrittenHeaders = true
                                    }
                                    writer.conditionalWrite(
                                        headerParameters.length > 0 && !hasWrittenHeaders,
                                        `headers: headers${headerOptionalStr.length > 0 ? ' ?? {}' : ''},`,
                                    )
                                    if (hasResponse && responses.responseType !== undefined && this.options.client === 'got') {
                                        writer.write(`responseType: '${responses.responseType}',`)
                                    }
                                    if (!hasSyntaxSugarMethod) {
                                        writer.write(`method: '${httpMethod.toUpperCase()}',`)
                                    }
                                })
                                .write(')')
                        } else {
                            writer.write(')')
                        }
                        if (hasResponse) {
                            writer
                                .write(', ')
                                .inlineBlock(() => {
                                    for (const [statusCode, { schema: responseSchema, isUnknown }] of entriesOf(
                                        responses.responses,
                                    )) {
                                        const statusCodeLiteral = statusCode.match(/\d+[a-zA-Z]+/)
                                            ? `"${statusCode}"`
                                            : statusCode
                                        if (responseSchema !== undefined && isUnknown !== true) {
                                            writer.write(`${statusCodeLiteral}: ${value(responseSchema)},`)
                                        } else if (statusCode !== 'default') {
                                            if (this.options.useEither) {
                                                writer.write(
                                                    `${statusCodeLiteral}: ${
                                                        responseType === 'text' || responseType === undefined
                                                            ? parseString[this.options.validator]
                                                            : parseUnknown[this.options.validator]
                                                    },`,
                                                )
                                            } else {
                                                writer.write(
                                                    `${statusCodeLiteral}: ${
                                                        responseType === 'text' || responseType === undefined
                                                            ? isStringIs[this.options.validator]
                                                            : isUnknownIs[this.options.validator]
                                                    },`,
                                                )
                                            }
                                        }
                                    }
                                })
                                .conditionalWriteLine(
                                    this.options.client === 'ky' && responses?.responseType !== undefined,
                                    `, "${responses?.responseType}"`,
                                )
                                .write(')')
                                .conditionalWrite(this.options.useEither, ` as ReturnType<this["${method}"]>`)
                        }
                    })
                    .newLine()
            }

            if (this.hasValidateRequestBody) {
                writer.writeLine(this.writeValidateRequestBody(reference))
            }

            if (this.hasAwaitResponse) {
                writer.writeLine(this.writeAwaitResponse(reference, this.options.validator))
            }

            this.writeAuthenticator({ reference, writer })
        })

        return writer.toString()
    }

    private writeAwaitResponse(reference: (node: Node) => string, validator: 'ajv' | 'zod') {
        const statusAccessor = this.options.client === 'ky' ? 'status' : 'statusCode'
        const _body = this.options.client === 'ky' ? '_body' : 'result.body'

        const RequestPromise = reference(this._client.RequestPromise())
        const writer = createWriter()
        if (this.options.useEither) {
            const DefinedError = reference(ajvSymbols.DefinedError())
            writer
                .newLine()
                .conditionalWriteLine(
                    validator === 'ajv',
                    `public async awaitResponse<I, S extends Record<PropertyKey, { parse: (o: I) => { left: ${DefinedError}[] } | { right: unknown } }>>(response: `,
                )
            if (validator === 'zod') {
                const SafeParseReturnType = reference(zodSymbols.SafeParseReturnType())
                writer.writeLine(
                    `public async awaitResponse<I, S extends Record<PropertyKey, { safeParse: (o: unknown) => ${SafeParseReturnType}<unknown, I> }>>(response: `,
                )
            }

            if (this.options.client === 'got') {
                const Response = reference(this._client.Response())
                writer.writeLine(`${RequestPromise}<NoInfer<${Response}<I>>>`)
            }

            return writer
                .conditionalWrite(this.options.client === 'ky', `${RequestPromise}<I>`)
                .write(', schemas: S')
                .conditionalWrite(this.options.client === 'ky', ', responseType?: "json" | "text"')
                .write(')')
                .block(() => {
                    writer
                        .conditionalWriteLine(this.options.client === 'got', 'const result = await response')
                        .conditionalWriteLine(
                            this.options.client === 'ky',
                            'const _body = (await (responseType !== undefined ? response[responseType]() : response.text())) as I',
                        )
                        .conditionalWriteLine(this.options.client === 'ky', 'const result = await response')
                        .writeLine(
                            `const status = result.${statusAccessor} < 200 ? 'informational' : result.${statusAccessor} < 300 ? 'success' : result.${statusAccessor} < 400 ? 'redirection' : result.${statusAccessor} < 500 ? 'client-error' : 'server-error'`,
                        )
                        .writeLine(`const validator = schemas[result.${statusAccessor}] ?? schemas.default`)
                    if (validator === 'ajv') {
                        writer
                            .writeLine(`const body = validator?.parse?.(${_body})`)
                            .writeLine(`if (result.${statusAccessor} < 200 || result.${statusAccessor} >= 300)`)
                            .block(() => {
                                writer.writeLine(
                                    `return {success: false as const, statusCode: result.${statusAccessor}.toString(), status, headers: result.headers, left: body !== undefined && 'right' in body ? body.right : ${_body}, validationErrors: body !== undefined && 'left' in body ? body.left : undefined, where: 'response:statuscode' } `,
                                )
                            })
                            .writeLine("if (body === undefined || 'left' in body)")
                            .block(() => {
                                writer.writeLine(
                                    `return {success: body === undefined, statusCode: result.${statusAccessor}.toString(), status, headers: result.headers, left: ${_body}, validationErrors: body?.left, where: 'response:body' }`,
                                )
                            })
                            .writeLine(
                                `return {success: true as const, statusCode: result.${statusAccessor}.toString(), status, headers: result.headers, right: ${_body} }`,
                            )
                    } else if (validator === 'zod') {
                        writer
                            .writeLine(`const body = validator?.safeParse?.(${_body})`)
                            .writeLine(`if (result.${statusAccessor} < 200 || result.${statusAccessor} >= 300)`)
                            .block(() => {
                                writer.writeLine(
                                    `return {success: false as const, statusCode: result.${statusAccessor}.toString(), status, headers: result.headers, left: body?.success ? body.data : ${_body}, error: body !== undefined && !body.success ? body.error : undefined, where: 'response:statuscode' } `,
                                )
                            })
                            .writeLine('if (body === undefined || !body.success)')
                            .block(() => {
                                writer.writeLine(
                                    `return {success: body === undefined, statusCode: result.${statusAccessor}.toString(), status, headers: result.headers, left: ${_body}, error: body?.error, where: 'response:body' }`,
                                )
                            })
                            .writeLine(
                                `return {success: true as const, statusCode: result.${statusAccessor}.toString(), status, headers: result.headers, right: body.data }`,
                            )
                    }
                })
                .toString()
        }

        if (this.options.validator === 'zod') {
            writer
                .newLine()
                .writeLine(
                    'public async awaitResponse<I, S extends Record<PropertyKey, { parse: (o: unknown) => I }>>(response: ',
                )

            if (this.options.client === 'got') {
                const Response = reference(this._client.Response())
                writer.writeLine(`${RequestPromise}<${Response}>`)
            }

            return writer
                .conditionalWrite(this.options.client === 'ky', `${RequestPromise}`)
                .write(', schemas: S')
                .conditionalWrite(this.options.client === 'ky', ', responseType?: "json" | "text"')
                .write(')')
                .block(() => {
                    writer
                        .writeLine(
                            'type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string ? `${S}` extends `${T}${infer _X}` ? S : never : never',
                        )
                        .writeLine('type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never')
                        .writeLine('const result = await response')
                        .conditionalWriteLine(
                            this.options.client === 'ky',
                            'const _body = responseType !== undefined ? result[responseType](): result.text()',
                        )
                        .writeLine(`const schema = schemas[result.${statusAccessor}] ?? schemas.default`)
                        .writeLine(`const body = schema?.parse?.(${_body}) ?? ${_body}`)
                        .writeLine(
                            `return {statusCode: result.${statusAccessor}, headers: result.headers, body: body as InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]> }`,
                        )
                })
                .toString()
        }

        writer
            .newLine()
            .writeLine(
                'public async awaitResponse<T, S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; assert?: (o: unknown) => void }>>(response: ',
            )

        if (this.options.client === 'got') {
            const Response = reference(this._client.Response())
            writer.writeLine(`${RequestPromise}<${Response}>`)
        }

        return writer
            .conditionalWrite(this.options.client === 'ky', `${RequestPromise}`)
            .write(', schemas: S')
            .conditionalWrite(this.options.client === 'ky', ', responseType?: "json" | "text"')
            .write(')')
            .block(() => {
                writer
                    .writeLine(
                        'type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string ? `${S}` extends `${T}${infer _X}` ? S : never : never',
                    )
                    .writeLine('type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never')
                    .writeLine('const result = await response')
                    .conditionalWriteLine(
                        this.options.client === 'ky',
                        'const _body = responseType !== undefined ? result[responseType](): result.text()',
                    )
                    .writeLine(`const schema = schemas[result.${statusAccessor}] ?? schemas.default`)
                    .writeLine(`schema?.assert?.(${_body})`)
                    .writeLine(
                        `return {statusCode: result.${statusAccessor}, headers: result.headers, body: ${_body} as InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]> }`,
                    )
            })
            .toString()
    }

    private writeValidateRequestBody(reference: (node: Node) => string) {
        const writer = createWriter()
        if (this.options.useEither) {
            if (this.options.validator === 'ajv') {
                const DefinedError = reference(ajvSymbols.DefinedError())
                return writer
                    .newLine()
                    .writeLine('public validateRequestBody<Body>(')
                    .writeLine(
                        `parser: { parse: (o: unknown) => { left: ${DefinedError}[] } | { right: Body } }, body: unknown )`,
                    )
                    .block(() => {
                        writer.writeLine('const _body = parser.parse(body)')
                        writer.writeLine("if ('left' in _body)").block(() => {
                            writer.writeLine(
                                "return {success: false as const, statusCode: undefined, status: undefined, headers: undefined, left: body, validationErrors: _body.left, where: 'request:body' } satisfies FailureResponse<undefined, unknown, 'request:body', undefined>",
                            )
                        })
                        writer.writeLine('return _body')
                    })
                    .toString()
            }
            if (this.options.validator === 'zod') {
                const SafeParseReturnType = reference(zodSymbols.SafeParseReturnType())
                return writer
                    .newLine()
                    .writeLine('public validateRequestBody<Body>(')
                    .writeLine(`parser: { safeParse: (o: unknown) => ${SafeParseReturnType}<unknown, Body> }, body: unknown )`)
                    .write(": {right: Body } | FailureResponse<undefined, unknown, 'request:body', undefined>")
                    .block(() => {
                        writer.writeLine('const _body = parser.safeParse(body)')
                        writer.writeLine('if (!_body.success)').block(() => {
                            writer.writeLine(
                                "return {success: false as const, statusCode: undefined, status: undefined, headers: undefined, left: body, error: _body.error, where: 'request:body' } satisfies FailureResponse<undefined, unknown, 'request:body', undefined>",
                            )
                        })
                        writer.writeLine('return {right: _body.data}')
                    })
                    .toString()
            }
        }
        if (this.options.validator === 'zod') {
            return writer
                .newLine()
                .writeLine('public validateRequestBody<Body>( parser: { parse: (o: unknown) => Body }, body: unknown )')
                .block(() => {
                    writer.writeLine('return parser.parse(body)')
                })
                .toString()
        }
        return writer
            .newLine()
            .writeLine(
                'public validateRequestBody<T>(schema: { is: (o: unknown) => o is T, assert: (o: unknown) => void}, body: T)',
            )
            .block(() => {
                writer.writeLine('schema.assert(body)')
                writer.writeLine('return body')
            })
            .toString()
    }

    public writeConstructor({
        reference,
        value,
        writer,
    }: {
        value: TypescriptTypeWalkerContext['value']
        reference: TypescriptTypeWalkerContext['reference']
        writer: CodeBlockWriter
    }) {
        const { prefixUrl, defaultValue } = this.prefixConfiguration
        const { authDeclaration, hasAuth } = this.security({ reference })

        writer.writeLine(`public client: ${reference(this._client.type())}`).newLine()
        if (hasAuth) {
            writer
                .write('public auth: ')
                .inlineBlock(() => {
                    writer.writeLine(authDeclaration)
                })
                .newLine()
                .newLine()
                .writeLine('public availableAuth: Set<string>')
                .writeLine('public defaultAuth: string[][] | string[] | undefined')
                .newLine()
        }

        const isDefaultConstructable = defaultValue !== undefined && !hasAuth
        const Options = reference(this._client.Options())
        writer
            .writeLine('public constructor(')
            .inlineBlock(() => {
                writer.writeLine(`prefixUrl${defaultValue !== undefined ? ` = '${defaultValue}'` : ''},`)
                writer.writeLine('options,')
                writer.conditionalWriteLine(hasAuth, 'auth = {},')
                writer.conditionalWriteLine(hasAuth, 'defaultAuth,')
                writer.writeLine(`client = ${value(this._client.client())}`)
            })
            .write(': ')
            .inlineBlock(() => {
                writer.writeLine(`prefixUrl${defaultValue !== undefined ? '?' : ''}: ${prefixUrl},`)
                if (this.options.client === 'got') {
                    writer.writeLine(`options?: ${Options} | ${reference(gotSymbols.OptionsInit())},`)
                }
                writer.conditionalWriteLine(this.options.client === 'ky', `options?: ${Options},`)
                if (hasAuth) {
                    writer.write('auth: ').inlineBlock(() => {
                        writer.writeLine(authDeclaration)
                    })
                    writer.writeLine('defaultAuth?: string[][] | string[]')
                }
                writer.writeLine(`client?: ${reference(this._client.type())}`)
            })
            .conditionalWrite(isDefaultConstructable, ' = {}')
            .write(')')
        writer
            .block(() => {
                writer.conditionalWriteLine(
                    this.options.client === 'got',
                    `this.client = client.extend(...[{ prefixUrl${
                        this.options.useEither ? ', throwHttpErrors: false' : ''
                    } }, options].filter((o): o is ${Options} => o !== undefined))`,
                )
                writer.conditionalWriteLine(
                    this.options.client === 'ky',
                    `this.client = client.extend({ prefixUrl${this.options.useEither ? ', throwHttpErrors: false' : ''}, ...options })`,
                )

                writer.conditionalWriteLine(hasAuth, 'this.auth = auth')
                writer.conditionalWriteLine(hasAuth, 'this.availableAuth = new Set(Object.keys(auth))')
                writer.conditionalWriteLine(hasAuth, 'this.defaultAuth = defaultAuth')
            })
            .newLine()
            .newLine()
    }

    public writeAuthenticator({
        reference,
        writer,
    }: { reference: TypescriptTypeWalkerContext['reference']; writer: CodeBlockWriter }) {
        const { securities } = this.security({ reference })
        if (securities.length > 0) {
            for (const sec of securities) {
                writer.newLine().writeLine(sec.clientFunc).newLine()
            }

            const clientType = reference(this._client.type())
            writer
                .writeLine(
                    `protected buildClient(auths: string[][] | string[] | undefined = this.defaultAuth, client?: ${clientType}): ${clientType}`,
                )
                .block(() => {
                    writer
                        .writeLine(
                            'const auth = (auths ?? [...this.availableAuth]).map(auth => Array.isArray(auth) ? auth : [auth]).filter((auth) => auth.every((a) => this.availableAuth.has(a)))',
                        )
                        .writeLine('let chosenClient = client ?? this.client')
                        .writeLine('for (const chosen of auth[0] ?? [])')
                        .block(() => {
                            let first = true
                            for (const sec of securities) {
                                writer.conditionalWrite(!first, 'else')
                                writer.writeLine(`if (chosen === '${sec.name}')`).block(() => {
                                    writer.writeLine(`chosenClient = this.${sec.clientRef}(chosenClient)`)
                                })
                                first = false
                            }
                        })
                        .writeLine('return chosenClient')
                })
                .newLine()
        }
    }

    public asRequestBody({ request, method }: { request: RequestBody | undefined; method: string }): AsRequestBody | undefined {
        const [jsonMimeType, jsonContent] = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(jsonMime)) ?? [
            undefined,
            undefined,
        ]
        if (jsonContent !== undefined) {
            const schema = jsonContent.schema ?? {}
            const name = `${method}Request`
            const therefore = $jsonschema(schema as JsonSchema, {
                name,
                document: this.openapi,
                references: this.references,
                exportAllSymbols: true,
                validator: this.options.validator,
                formats: this.options.formats,
                ...pick(this.options, ['optionalNullable', 'allowIntersectionTypes']),
            })
            this.connections.push(...(therefore._connections ?? []))
            if (!['number', 'string', 'boolean', 'enum', 'integer'].includes(therefore._type)) {
                const validator = this.asValidator(therefore, { assert: !this.options.useEither })
                return {
                    schema: validator,
                    mimeType: jsonMimeType,
                    name: 'body',
                    type: 'json',
                    definition: ({ reference }) => reference(validator),
                } satisfies AsRequestBody
            }
            return {
                schema: undefined,
                mimeType: jsonMimeType,
                name: 'body',
                type: 'body',
                definition: () => therefore._type.replace('integer', 'number'),
            }
        }

        const formUrlContent = entriesOf(request?.content ?? {}).find(([mime]) => formUrlEncodedMime.test(mime))?.[1]
        const multipartContent = entriesOf(request?.content ?? {}).find(([mime]) => multipartFormMime.test(mime))?.[1]
        const formContent = formUrlContent ?? multipartContent
        const isMultipart = multipartContent !== undefined

        if (formContent !== undefined) {
            const schema = formContent.schema ?? {}

            if ((schema as { type?: string }).type === 'file') {
                return { name: 'body', type: 'form', definition: () => 'FormData' }
            }

            const name = `${method}Request`
            const therefore = $jsonschema(schema as JsonSchema, {
                name,
                document: this.openapi,
                references: this.references,
                exportAllSymbols: true,
                validator: this.options.validator,
                formats: this.options.formats,
                ...pick(this.options, ['optionalNullable', 'allowIntersectionTypes']),
            })
            this.connections.push(...(therefore._connections ?? []))
            const validator = this.asValidator(therefore, { assert: !this.options.useEither })

            if (this.options.client === 'ky') {
                if (isMultipart) {
                    return {
                        type: 'body',
                        schema: validator,
                        name: 'body',
                        definition: ({ reference }) => reference(validator),
                        precode: ({ reference }) =>
                            [
                                'const _form = new FormData()',
                                `for (const [key, value] of Object.entries(_body.right as ${reference(validator)})) {`,
                                '    if (value instanceof Blob || value instanceof File) {',
                                '        _form.append(key, value)',
                                '    } else if (value !== null && value !== undefined) {',
                                '        _form.append(key, value as string)',
                                '    }',
                                '}',
                            ].join('\n'),
                        variableName: '_form',
                    }
                }
                return {
                    type: 'body',
                    schema: validator,
                    name: 'body',
                    definition: ({ reference }) => reference(validator),
                    precode: ({ reference }) =>
                        [
                            'const _form = new URLSearchParams()',
                            `for (const [key, value] of Object.entries(_body.right as ${reference(validator)})) {`,
                            '    if (value !== null && value !== undefined) {',
                            '        _form.set(key, value as string)',
                            '    }',
                            '}',
                        ].join('\n'),
                    variableName: '_form',
                }
            }

            return {
                schema: validator,
                name: 'body',
                type: 'form',
                definition: ({ reference }) => reference(validator),
            }
        }

        const [binaryMimeType, binaryContent] = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(binaryMime)) ?? [
            undefined,
            undefined,
        ]
        if (binaryContent !== undefined) {
            return { name: 'body', type: 'body', mimeType: binaryMimeType, definition: () => 'string | Buffer' }
        }
        return undefined
    }

    public asResponseBodies({
        responses,
        method,
    }: { responses: Responses | undefined; method: string }): ResponseBodies | undefined {
        const result: [string, ResponseBodyDefinition][] = []
        const successCodesCount = keysOf(responses ?? {}).filter((s) => s.toString().startsWith('2') || s === 'default').length
        const success: ResponseBodyDefinition[] = []
        const failure: ResponseBodyDefinition[] = []
        let def: ResponseBodyDefinition | undefined = undefined
        for (const [statusCode, responseRef] of entriesOf(responses ?? {})) {
            const response = jsonPointer({ schema: this.openapi, ptr: responseRef ?? {} }) as unknown as Response
            const isOnlySuccess = (statusCode.startsWith('2') || statusCode === 'default') && successCodesCount <= 1
            const [jsonMimeType, jsonContent] = entriesOf(response.content ?? {}).find(([mime]) => mime.match(jsonMime)) ?? [
                undefined,
                undefined,
            ]
            let found: ResponseBodyDefinition | undefined = undefined
            if (jsonContent !== undefined) {
                const schema = jsonContent.schema ?? {}
                const name = `${method}Response${isOnlySuccess ? '' : capitalize(statusCode)}`
                const therefore = $jsonschema(schema as JsonSchema, {
                    name,
                    document: this.openapi,
                    references: this.references,
                    exportAllSymbols: true,
                    validator: this.options.validator,
                    formats: this.options.formats,
                    ...pick(this.options, ['optionalNullable', 'allowIntersectionTypes']),
                })

                this.connections.push(...(therefore._connections ?? []))
                const validator = this.asValidator(therefore, { assert: !this.options.useEither })
                found = {
                    statusCode,
                    schema: validator,
                    mimeType: jsonMimeType,
                    type: 'json',
                }
            }

            if (found === undefined) {
                const [yamlMimeType, yamlContent] = entriesOf(response.content ?? {}).find(([mime]) => mime.match(yamlMime)) ?? [
                    undefined,
                    undefined,
                ]
                if (yamlContent !== undefined) {
                    found = {
                        statusCode,
                        schema: undefined,
                        mimeType: yamlMimeType,
                        type: 'text',
                    }
                }
            }

            // catch all
            if (found === undefined) {
                found = {
                    statusCode,
                    schema: undefined,
                    mimeType: undefined,
                    type: 'text',
                    isUnknown: true,
                }
            }
            result.push([statusCode, found])
            if (statusCode.startsWith('2')) {
                success.push(found)
            } else if (statusCode !== 'default') {
                failure.push(found)
            } else {
                def = found
            }
        }
        if (result.length > 0) {
            const eligibleResponseTypes = success.length > 0 ? success : def !== undefined ? [def] : failure
            const eligibleResponse = eligibleResponseTypes[0]

            let responseType = eligibleResponse?.type
            if (this.options.client === 'ky' && responseType === 'json' && eligibleResponse?.statusCode === '204') {
                responseType = 'text'
                // change the schema on the matching response to unknown so the types are correct
                eligibleResponse.schema = undefined
            }
            return {
                responses: Object.fromEntries(result.sort(([a], [b]) => a.localeCompare(b))),
                success,
                failure,
                default: def,
                mimeType: eligibleResponse?.mimeType,
                responseType,
            }
        }
        return undefined
    }

    private asValidator(node: Node, { assert = false }: { assert?: boolean } = {}): Node {
        node._definition._validator ??= { assert }
        node._definition._validator.assert ||= assert
        if (this.options.compile !== undefined) {
            node._definition._validator.compile = this.options.compile
        }
        if (this.options.formats !== undefined) {
            node._definition._validator.formats = this.options.formats
        }
        return node
    }

    public asPathParameters(parameters: Parameter[]) {
        const pathParameters = parameters
            .filter((p) => p.in === 'path')
            .map((p) => {
                return {
                    id: p.name,
                    name: camelCase(p.name),
                    type: 'string',
                }
            })

        return pathParameters
    }

    public asQueryParameters(parameters: Parameter[]) {
        const queryParameters = parameters
            .filter((p) => p.in === 'query')
            .map((p) => {
                return {
                    name: p.name,
                    required: p.required,
                    type: 'string',
                }
            })
        return queryParameters
    }

    public asHeaderParameters(parameters: Parameter[], usedSecurityHeaders: string[]) {
        const headerParameters = parameters
            .filter((p) => p.in === 'header')
            .map((p) => {
                return {
                    name: p.name,
                    required: p.required && !usedSecurityHeaders.includes(p.name),
                    type: 'string',
                }
            })
        return headerParameters
    }

    public get prefixConfiguration() {
        const args: string[] = ['string']
        const defaultValues: string[] = []
        for (const server of this.openapi.servers ?? []) {
            if (server.variables !== undefined) {
                let templateUrl = `\`${server.url.replaceAll('{', '${')}\``
                let defaultUrl = server.url
                let allDefault = true
                for (const [name, values] of entriesOf(server.variables ?? {})) {
                    if (values !== undefined) {
                        const variations = new Set(['string', values.default, ...(values.enum ?? [])])
                        templateUrl = templateUrl.replace(name, [...variations].join(' | '))
                        allDefault = allDefault && values.default.length > 0
                        defaultUrl = defaultUrl.replace(`{${name}}`, values.default)
                    }
                }
                args.push(templateUrl)
                if (allDefault) {
                    defaultValues.push(defaultUrl)
                }
            } else if (server.url.startsWith('/')) {
                args.push(`\`\${string}${server.url}\``)
            } else {
                args.push(`'${server.url}'`)
                defaultValues.push(server.url)
            }
        }
        return { prefixUrl: args.join(' | '), defaultValue: defaultValues.length === 1 ? defaultValues[0] : undefined }
    }

    private _security = ({ reference }: { reference: TypescriptTypeWalkerContext['reference'] }) => {
        const securityRequirements = this.openapi.components?.securitySchemes
        const clientType = reference(this._client.type())
        const securities = entriesOf(securityRequirements ?? []).map(([name, securityRef]) => {
            const security = jsonPointer({ schema: this.openapi, ptr: securityRef }) as unknown as Partial<MappableSecurityScheme>
            const { type = 'http' } = security
            const convert = toSecurityDeclaration[type]

            const camelName = camelCase(name)
            const clientRef = camelCase(`build_${camelName}_client`)
            const clientWriter = createWriter()
            const hook = toSecurityHook[type](security as never, camelName, this.options)
            clientWriter.writeLine(`protected ${clientRef}(client: ${clientType})`).block(() => {
                if (hook !== undefined && hook.decl.length > 0) {
                    clientWriter
                        .writeLine('return client.extend({')
                        .writeLine('hooks: {')
                        .writeLine('beforeRequest: [')
                        .writeLine(hook.decl)
                        .writeLine('],},})')
                } else {
                    clientWriter.writeLine('return client')
                }
            })

            return {
                type: name,
                headers: hook?.headers,
                required: false,
                clientRef,
                name: camelName,
                declaration: convert(security as never),
                clientFunc: clientWriter.toString(),
            }
        })

        const activatedAuth = securities.filter((s) => 'declaration' in s)
        const hasAuth = activatedAuth.length > 0

        return {
            authDeclaration: activatedAuth.map((s) => `${s.name}?: ${s.declaration}`).join(','),
            securities,
            hasAuth,
        }
    }
    private _securityCache: ReturnType<RestClientBuilder['_security']> | undefined

    public security({ reference }: { reference: TypescriptTypeWalkerContext['reference'] }) {
        if (!this._securityCache) {
            this._securityCache = this._security({ reference })
        }
        return this._securityCache
    }

    private get _pathItems() {
        const pathItems = entriesOf(this.openapi.paths)
            .flatMap(([path, item]) => {
                let pathItem = item as PathItem
                if (path.startsWith('/')) {
                    pathItem = (pathItem.$ref !== undefined ? pointer.get(pathItem, pathItem.$ref) : pathItem) as PathItem
                    return Object.entries(
                        omitUndefined({
                            get: pathItem.get,
                            put: pathItem.put,
                            post: pathItem.post,
                            delete: pathItem.delete,
                            options: pathItem.options,
                            head: pathItem.head,
                            patch: pathItem.patch,
                            trace: 'trace' in pathItem ? pathItem.trace : undefined,
                        }),
                    ).map(([httpMethod, operation]) => {
                        const method = methodName(path, httpMethod, operation, this.options)
                        return {
                            httpMethod,
                            method,
                            path,
                            pathItem,
                            operation,
                        }
                    })
                }
                return undefined
            })
            .filter(isDefined)
            .toSorted((a, b) => a.method.localeCompare(b.method))

        // deduplicate methods by operation first
        const _groupedByOperation = valuesOf(Object.groupBy(pathItems, (x) => x.method))
            .filter((x) => x !== undefined)
            .filter((x) => x.length > 1)
            .map((x) => {
                for (const item of x) {
                    item.method = camelCase(`${item.httpMethod}_${item.method}`)
                }
                return x
            })
        const _groupedByNumber = valuesOf(Object.groupBy(pathItems, (x) => x.method))
            .filter((x) => x !== undefined)
            .filter((x) => x.length > 1)
            .map((x) => {
                for (const [i, item] of x.entries()) {
                    item.method = `${item.method}${i}`
                }
                return x
            })
        return pathItems
    }

    private get _client() {
        return this.options.client === 'got' ? gotSymbols : kySymbols
    }
}
