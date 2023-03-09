import type {
    APIKeySecurityScheme,
    HTTPSecurityScheme,
    OAuth2SecurityScheme,
    OpenapiV3,
    OpenIdConnectSecurityScheme,
    Operation,
    Parameter,
    PathItem,
    Reference,
    RequestBody,
    Responses,
    SecurityScheme,
    Server,
    Response,
} from './openapi.type'

import { jsonPointer } from '../../../common/json/json'
import type { JsonSchema } from '../../../json'
import type { ThereforeNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import { annotate } from '../../visitor/jsonschema/jsonschema'
import { toJSDoc } from '../../visitor/typescript/jsdoc'
import { objectProperty } from '../../visitor/typescript/literal'
import { createWriter } from '../../writer'
import { $jsonschema } from '../jsonschema'
import type { CustomType, ThereforeCst } from '../types'

import { entriesOf, fromEntries, hasPropertiesDefined, isDefined, keysOf, omitUndefined, valuesOf } from '@skyleague/axioms'
import camelCase from 'camelcase'
import { singularize } from 'inflection'
import * as pointer from 'jsonpointer'
import converter from 'swagger2openapi'

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
    { preferOperationId = true }: { preferOperationId?: boolean } = {}
) {
    if (preferOperationId && operation.operationId !== undefined) {
        return camelCase(operation.operationId)
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
        ].join('_')
    )
}

const jsonMime = /(application|\*)\/(.*json|\*)/
const yamlMime = /(application|\*)\/(.*yaml|\*)/
const formUrlEncodedMime = /^application\/x-www-form-urlencoded$/
const binaryMime = /application\/.*octet-stream/
export function getRequestBody({
    request,
    openapi,
    method,
    references,
    strict,
    optionalNullable,
}: {
    request: RequestBody | undefined
    openapi: OpenapiV3
    method: string
    references: Map<string, [name: string, value: () => ThereforeNode]>
    strict: boolean
    optionalNullable: boolean
}) {
    const [jsonMimeType, jsonContent] = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(jsonMime)) ?? [
        undefined,
        undefined,
    ]
    if (jsonContent !== undefined) {
        const schema = jsonContent.schema ?? {}
        const therefore = $jsonschema(schema as JsonSchema, {
            name: `${method}Request`,
            root: openapi as JsonSchema,
            references,
            exportAllSymbols: true,
            strict,
            optionalNullable,
        })
        if (!['number', 'string', 'boolean', 'enum', 'integer'].includes(therefore.type)) {
            therefore.description.validator = { enabled: true, assert: true }
            return {
                schema: therefore,
                mimeType: jsonMimeType,
                name: 'body',
                type: 'json',
                declaration: `{{${therefore.uuid}:uniqueSymbolName}}`,
            }
        } else {
            return {
                name: 'body',
                type: 'body',
                mimeType: jsonMimeType,
                declaration: therefore.type.replace('integer', 'number'),
            }
        }
    }

    const formContent = entriesOf(request?.content ?? {}).find(([mime]) => formUrlEncodedMime.test(mime))?.[1]
    if (formContent !== undefined) {
        const schema = formContent.schema ?? {}
        const therefore = $jsonschema(schema as JsonSchema, {
            name: `${method}Request`,
            root: openapi as JsonSchema,
            references,
            exportAllSymbols: true,
            strict,
            optionalNullable,
        })
        therefore.description.validator = { enabled: true, assert: true }
        return { schema: therefore, name: 'body', type: 'form', declaration: `{{${therefore.uuid}:uniqueSymbolName}}` }
    }

    const [binaryMimeType, binaryContent] = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(binaryMime)) ?? [
        undefined,
        undefined,
    ]
    if (binaryContent !== undefined) {
        return { name: 'body', type: 'body', mimeType: binaryMimeType, declaration: 'string | Buffer' }
    }
    return undefined
}

const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1)

export const isStringIs = '{is: (x: unknown): x is string => true}'
export const isUnknownIs = '{is: (x: unknown): x is unknown => true}'

export function getResponseBodies({
    responses,
    openapi,
    method,
    references,
    useEither,
    strict,
    optionalNullable,
}: {
    responses: Responses | undefined
    openapi: OpenapiV3
    method: string
    references: Map<string, [name: string, value: () => ThereforeNode]>
    useEither: boolean
    strict: boolean
    optionalNullable: boolean
}) {
    const result: [
        string,
        (
            | {
                  schema: ThereforeCst
                  mimeType: string
                  type: 'json'
                  isUnknown?: boolean
              }
            | {
                  schema: ThereforeCst | undefined
                  mimeType: string | undefined
                  type: 'text'
                  isUnknown?: boolean
              }
        )
    ][] = []
    const successCodesCount = keysOf(responses ?? {}).filter((s) => s.toString().startsWith('2') || s === 'default').length
    for (const [statusCode, responseRef] of entriesOf(responses ?? {})) {
        const reference = responseRef as Reference | Response
        const response = jsonPointer({ schema: openapi, ptr: responseRef ?? {} }) as Response
        const isOnlySuccess = (statusCode.startsWith('2') || statusCode === 'default') && successCodesCount <= 1
        const [jsonMimeType, jsonContent] = entriesOf(response.content ?? {}).find(([mime]) => mime.match(jsonMime)) ?? [
            undefined,
            undefined,
        ]
        if (jsonContent !== undefined) {
            const schema = jsonContent.schema ?? {}

            const therefore = $jsonschema(schema as JsonSchema, {
                name: `${method}Response${isOnlySuccess ? '' : capitalize(statusCode)}`,
                root: openapi as JsonSchema,
                references,
                reference: '$ref' in reference ? reference.$ref : undefined,
                exportAllSymbols: true,
                strict,
                optionalNullable,
            })
            therefore.description.validator ??= { enabled: true, assert: false }
            therefore.description.validator.assert ||= !useEither
            result.push([statusCode, { schema: therefore, mimeType: jsonMimeType, type: 'json' }])
            continue
        }

        const [yamlMimeType, yamlContent] = entriesOf(response.content ?? {}).find(([mime]) => mime.match(yamlMime)) ?? [
            undefined,
            undefined,
        ]
        if (yamlContent !== undefined) {
            result.push([statusCode, { schema: undefined, mimeType: yamlMimeType, type: 'text' }])

            continue
        }

        result.push([
            statusCode,
            {
                schema: undefined,
                mimeType: undefined,
                type: 'text',
                isUnknown: true,
            },
        ])
    }
    if (result.length > 0) {
        return { right: fromEntries(result) }
    }
    return { left: undefined }
}

export function getPathParameters(parameters: Parameter[], _openapi: OpenapiV3) {
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

export function getQueryParameters(parameters: Parameter[], _openapi: OpenapiV3) {
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

export function getHeaderParameters(parameters: Parameter[], usedSecurityHeaders: string[], _openapi: OpenapiV3) {
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

export function getPrefixUrlConfiguration(servers?: Server[]) {
    const args: string[] = ['string']
    const defaultValues: string[] = []
    for (const server of servers ?? []) {
        if (server.variables !== undefined) {
            let templateUrl = `\`${server.url.replaceAll('{', '${')}\``
            let defaultUrl = server.url
            let allDefault = true
            for (const [name, values] of entriesOf(server.variables)) {
                const variations = new Set(['string', values.default, ...(values.enum ?? [])])
                templateUrl = templateUrl.replace(name, [...variations].join(' | '))
                allDefault = allDefault && values.default.length > 0
                defaultUrl = defaultUrl.replace(`{${name}}`, values.default)
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

type MappableSecurityScheme =
    | APIKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdConnectSecurityScheme
    | (HTTPSecurityScheme & { type: 'http' })

const toSecurityDeclaration: {
    [T in MappableSecurityScheme['type']]: (s: Extract<MappableSecurityScheme, { type: T }>) => string | undefined
} = {
    http: (s: HTTPSecurityScheme & { type: 'http' }) => {
        if (s.scheme === 'basic') {
            return '[username: string, password: string] | (() => Promise<[username: string, password: string]>)'
        } else if (s.scheme === 'bearer') {
            return 'string | (() => Promise<string>)'
        }
        return ''
    },
    apiKey: (_s: APIKeySecurityScheme) => 'string | (() => Promise<string>)',
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => 'string | (() => Promise<string>)',
    oauth2: (_s: OAuth2SecurityScheme) => 'string | (() => Promise<string>)',
}

const toSecurityHook: {
    [T in MappableSecurityScheme['type']]: (
        s: Extract<MappableSecurityScheme, { type: T }>,
        name: string
    ) => { decl: string; headers: string[] } | undefined
} = {
    http: (s: HTTPSecurityScheme & { type: 'http' }, name) => {
        const hook = createWriter()
        const headers: string[] = []
        hook.writeLine('async (options) => ').block(() => {
            if (s.scheme === 'basic') {
                hook.writeLine(`const ${name} = this.auth.${name}`)
                    .writeLine(`if (${name} !== undefined)`)
                    .block(() => {
                        hook.writeLine(`const [username, password] = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                            .writeLine(`options.username = username`)
                            .writeLine(`options.password = password`)
                    })
            } else if (s.scheme === 'bearer') {
                hook.writeLine(`const ${name} = this.auth.${name}!`)
                    .writeLine(`const token = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                    .writeLine(`options.headers["Authorization"] = \`Bearer \${token}\``)
                headers.push('Authorization')
            }
        })
        return { decl: hook.toString(), headers }
    },
    apiKey: (s: APIKeySecurityScheme, name) => {
        const hook = createWriter()
        hook.writeLine('async (options) => ').block(() => {
            hook.writeLine(`const ${name} = this.auth.${name}`)
                .writeLine(`const key = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                .writeLine(`options.headers['${s.name}'] = key`)
        })
        return { decl: hook.toString(), headers: [s.name] }
    },
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => undefined,
    oauth2: (_s: OAuth2SecurityScheme) => undefined,
}

export function getSecurity(securityRequirements: Record<string, Reference | SecurityScheme> | undefined, openapi: OpenapiV3) {
    const securities = entriesOf(securityRequirements ?? []).map(([name, securityRef]) => {
        const security = jsonPointer({ schema: openapi, ptr: securityRef }) as unknown as Partial<MappableSecurityScheme>
        const { type = 'http' } = security
        const convert = toSecurityDeclaration[type]

        const camelName = camelCase(name)
        const clientRef = camelCase(`build_${camelName}_client`)
        const clientWriter = createWriter()
        const hook = toSecurityHook[type](security as never, camelName)
        clientWriter.writeLine(`protected ${clientRef}(client: Got)`).block(() => {
            if (hook !== undefined && hook.decl.length > 0) {
                clientWriter
                    .writeLine('return client.extend({')
                    .writeLine('hooks: {')
                    .writeLine('beforeRequest: [')
                    .writeLine(hook.decl)
                    .writeLine(`],},})`)
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

    const activatedAuth = securities.filter(hasPropertiesDefined(['declaration']))
    const hasAuth = activatedAuth.length > 0

    return {
        authDeclaration: activatedAuth.map((s) => `${s.name}?: ${s.declaration}`).join(','),
        securities,
        hasAuth,
    }
}

export interface RestclientOptions {
    /**
     * Toggles whether the given operationId should be preferred over the generated value.
     *
     * @defaultValue true
     */
    preferOperationId?: boolean
    /**
     * @defaultValue false
     */
    strict?: boolean
    /**
     * Toggles whether optional fields will be allowed to be null. Some Rest APIs implicitly return null on optional fields.
     *
     * @defaultValue false
     */
    optionalNullable?: boolean
    /**
     * Toggles whether an Either interface is generated or exceptions are used.
     *
     * @defaultValue true
     */
    useEither?: boolean
    /**
     * Toggles whether the content type header should always be part of the request.
     *
     * @defaultValue false
     */
    explicitContentNegotiation?: boolean
    /**
     * Allows for a transformation of the standardized openapi schema (swagger gets automatically converted to
     * openapiv3).
     */
    transformOpenapi?: (openapi: OpenapiV3) => OpenapiV3
}

/**
 * Create a new `CustomType` instance with the given options.
 *
 * ### Example
 * ```ts
 * export const petStore = got
    .get('https://petstore3.swagger.io/api/v3/openapi.json')
    .json<OpenapiV3>()
    .then((data) => $restclient(data, { strict: false }))
 * ```
 *
 * @param schema - The JSON Draft 7 schema.
 * @param options - Additional options to pass to the tuple.
 *
 * @group Schema
 */
export async function $restclient(definition: OpenapiV3, options: Partial<RestclientOptions> = {}): Promise<CustomType> {
    const converted: { openapi: OpenapiV3 } = await converter.convertObj(definition, {
        path: true,
    })

    const openapi: OpenapiV3 =
        options.transformOpenapi === undefined ? converted.openapi : options.transformOpenapi(converted.openapi)
    const writer = createWriter()

    const { useEither = true, explicitContentNegotiation = false, strict = false, optionalNullable = false } = options
    const references = new Map<string, [name: string, value: () => ThereforeNode]>()

    const children: ThereforeCst[] = []
    const seenChildren = new WeakSet<ThereforeCst>()

    let generateAwaitResponse = false
    let generateValidateRequestBody = false
    writer.block(() => {
        const { prefixUrl, defaultValue } = getPrefixUrlConfiguration(openapi.servers)
        const { authDeclaration, securities, hasAuth } = getSecurity(openapi.components?.securitySchemes, openapi)

        writer.writeLine('public client: Got').newLine()
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
        writer
            .writeLine(`public constructor(`)
            .inlineBlock(() => {
                writer.writeLine(`prefixUrl${defaultValue !== undefined ? ` = '${defaultValue}'` : ''},`)
                writer.writeLine(`options,`)
                writer.conditionalWriteLine(hasAuth, 'auth = {},')
                writer.conditionalWriteLine(hasAuth, 'defaultAuth,')
            })
            .write(': ')
            .inlineBlock(() => {
                writer.writeLine(`prefixUrl${defaultValue !== undefined ? '?' : ''}: ${prefixUrl},`)
                writer.writeLine('options?: Options,')
                if (hasAuth) {
                    writer.write('auth: ').inlineBlock(() => {
                        writer.writeLine(authDeclaration)
                    })
                    writer.writeLine(`defaultAuth?: string[][] | string[]`)
                }
            })
            .conditionalWrite(isDefaultConstructable, ' = {}')
            .write(`)`)
        writer
            .block(() => {
                writer.writeLine(
                    `this.client = got.extend(...[{ prefixUrl${
                        useEither ? ', throwHttpErrors: false' : ''
                    } }, options].filter((o): o is Options => o !== undefined))`
                )

                writer.conditionalWriteLine(hasAuth, 'this.auth = auth')
                writer.conditionalWriteLine(hasAuth, 'this.availableAuth = new Set(Object.keys(auth))')
                writer.conditionalWriteLine(hasAuth, 'this.defaultAuth = defaultAuth')
            })
            .newLine()
            .newLine()

        for (const [path, item] of entriesOf(openapi.paths)) {
            let pathItem = item as PathItem
            if (path.startsWith('/')) {
                pathItem = (pathItem.$ref !== undefined ? pointer.get(pathItem, pathItem.$ref) : pathItem) as PathItem
                for (const [httpMethod, operation] of Object.entries(
                    omitUndefined({
                        get: pathItem.get,
                        put: pathItem.put,
                        post: pathItem.post,
                        delete: pathItem.delete,
                        options: pathItem.options,
                        head: pathItem.head,
                        patch: pathItem.patch,
                        trace: 'trace' in pathItem ? pathItem.trace : undefined,
                    })
                )) {
                    const method = methodName(path, httpMethod, operation, options)
                    const request = getRequestBody({
                        request: jsonPointer({ schema: openapi, ptr: operation.requestBody }) as RequestBody | undefined,
                        openapi,
                        method,
                        references,
                        strict,
                        optionalNullable,
                    })
                    let requestValidationStr = ''
                    if (request?.schema !== undefined) {
                        requestValidationStr = `this.validateRequestBody({{${request.schema.uuid}:symbolName}}, ${request.name})`
                        generateValidateRequestBody = true
                        if (!seenChildren.has(request.schema)) {
                            children.push(request.schema)
                        }
                    }
                    const parameters: Parameter[] = [...(operation.parameters ?? []), ...(pathItem.parameters ?? [])]
                        .map((parameter) => jsonPointer({ schema: openapi, ptr: parameter }) as Parameter | undefined)
                        .filter(isDefined)

                    let clientDecl = 'this.client'
                    const authMethods: string[] = []
                    const security = operation.security ?? openapi.security
                    const usedSecurityHeaders: string[] = []
                    if (security !== undefined) {
                        const hasAuthParameters = operation.security !== undefined
                        for (const secMethods of security) {
                            const required = keysOf(secMethods)
                                .map((sm) => securities.find((s) => s.type === sm)?.name)
                                .filter((x): x is string => x !== undefined)
                            authMethods.push(`[${required.map((r) => `'${r}'`).join(', ')}]`)
                            usedSecurityHeaders.push(
                                ...keysOf(secMethods)
                                    .flatMap((sm) => securities.find((s) => s.type === sm)?.headers)
                                    .filter((x): x is string => x !== undefined)
                            )
                        }
                        clientDecl = `this.buildClient(${hasAuthParameters ? 'auth' : ''})`
                    }

                    const pathParameters = getPathParameters(parameters, openapi)
                    const queryParameters = getQueryParameters(parameters, openapi)
                    const headerParameters = getHeaderParameters(parameters, usedSecurityHeaders, openapi)

                    const responses = getResponseBodies({
                        responses: operation.responses,
                        openapi,
                        method,
                        references,
                        useEither,
                        strict,
                        optionalNullable,
                    })

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

                    const hasRequiredBody = request?.declaration !== undefined
                    const hasRequiredPathArgument = pathArguments.length > 0
                    const hasRequiredQueryArguments = queryParameters.some((q) => q.required === true)
                    const hasRequiredHeaderArguments = headerParameters.some((q) => q.required === true)

                    const hasRequiredArguments =
                        hasRequiredBody || hasRequiredPathArgument || hasRequiredQueryArguments || hasRequiredHeaderArguments

                    const headerOptionalStr = hasRequiredHeaderArguments ? '' : '?'
                    const methodArgumentsInner = [
                        ...(request?.declaration !== undefined
                            ? [[request.name, `${request.name}: ${request.declaration}`]]
                            : []),
                        ...(pathArguments.length > 0 ? [['path', `path: { ${pathArguments} }`]] : []),
                        ...(queryArguments.length > 0 ? [['query', `query${queryOptionalStr}: { ${queryArguments} }`]] : []),
                        ...(headerArguments.length > 0
                            ? [['headers', `headers${headerOptionalStr}: { ${headerArguments} }`]]
                            : []),
                        ...(operation.security?.length !== undefined && operation.security.length > 0
                            ? [[`auth = [${authMethods.join(', ')}]`, `auth?: string[][] | string[]`]]
                            : []),
                    ]

                    const methodArguments =
                        methodArgumentsInner.length > 0
                            ? `{${methodArgumentsInner.map(([name]) => name).join(', ')}}: {${methodArgumentsInner
                                  .map(([, a]) => a)
                                  .join(', ')}}`
                            : ''

                    writer.write('\n')
                    const jsdoc = toJSDoc({ meta: operation })
                    if (jsdoc !== undefined) {
                        writer.write(jsdoc)
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    const hasResponse = 'right' in responses && responses.right !== undefined
                    let responseType: 'json' | 'text' | undefined
                    generateAwaitResponse ||= hasResponse

                    writer.writeLine(
                        `public ${hasResponse ? 'async' : ''} ${method}(${methodArguments}${
                            methodArgumentsInner.length > 0 && !hasRequiredArguments ? ' = {}' : ''
                        })`
                    )
                    writer
                        .block(() => {
                            const hasInputObj =
                                request !== undefined ||
                                queryParameters.length > 0 ||
                                headerParameters.length > 0 ||
                                (explicitContentNegotiation && hasResponse)
                            writer
                                .conditionalWriteLine(requestValidationStr !== '', `${requestValidationStr}\n`)
                                .conditionalWrite(hasResponse, 'return this.awaitResponse(')
                                .conditionalWrite(!hasResponse, 'return ')
                                .write(`${clientDecl}.${httpMethod}(\`${urlPath}\``)
                            if (hasInputObj || hasResponse) {
                                writer
                                    .write(', ')
                                    .inlineBlock(() => {
                                        writer
                                            .conditionalWrite(
                                                request !== undefined,
                                                `${request?.type ?? ''}: ${request?.name ?? ''},`
                                            )
                                            .conditionalWrite(
                                                queryParameters.length > 0,
                                                `searchParams: query${queryOptionalStr.length > 0 ? ' ?? {}' : ''},`
                                            )

                                        const successResponses = hasResponse
                                            ? entriesOf(responses.right)
                                                  .filter((r) => r[1].isUnknown !== true)
                                                  .filter(([statusCode]) => statusCode.startsWith('2'))
                                            : ([undefined] as const)
                                        const defaultResponse = hasResponse
                                            ? entriesOf(responses.right).filter(
                                                  ([statusCode, response]) =>
                                                      response.isUnknown !== true && statusCode.startsWith('default')
                                              )
                                            : ([undefined] as const)
                                        const errorResponses = hasResponse
                                            ? entriesOf(responses.right).filter(
                                                  ([statusCode, response]) =>
                                                      response.isUnknown !== true &&
                                                      (statusCode.startsWith('4') || statusCode.startsWith('5'))
                                              )
                                            : ([undefined] as const)
                                        const eligibleResponseTypes = hasResponse
                                            ? successResponses.length > 0
                                                ? successResponses
                                                : defaultResponse.length > 0
                                                ? defaultResponse
                                                : errorResponses
                                            : ([undefined] as const)
                                        const eligibleResponse = eligibleResponseTypes[0]
                                        let hasWrittenHeaders = false
                                        if (
                                            explicitContentNegotiation &&
                                            hasResponse &&
                                            eligibleResponse?.[1].mimeType !== undefined
                                        ) {
                                            writer
                                                .conditionalWrite(
                                                    headerParameters.length > 0,
                                                    `headers: { Accept: "${eligibleResponse[1].mimeType}", ...headers },`
                                                )
                                                .conditionalWrite(
                                                    headerParameters.length === 0,
                                                    `headers: { Accept: "${eligibleResponse[1].mimeType}" },`
                                                )
                                            hasWrittenHeaders = true
                                        }
                                        writer.conditionalWrite(
                                            headerParameters.length > 0 && !hasWrittenHeaders,
                                            `headers: headers${headerOptionalStr.length > 0 ? ' ?? {}' : ''},`
                                        )
                                        if (eligibleResponse !== undefined) {
                                            responseType = eligibleResponse[1].type
                                            writer.write(`responseType: '${eligibleResponse[1].type}',`)
                                        } else if (hasResponse) {
                                            const found = [
                                                ...new Set(
                                                    ...valuesOf(responses.right)
                                                        .filter((r) => r.isUnknown !== true)
                                                        .map((r) => r.type)
                                                ),
                                            ]
                                            if (found.length === 1) {
                                                responseType = found[0] as typeof responseType
                                                writer.write(`responseType: '${found[0]}',`)
                                            }
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
                                            responses.right
                                        )) {
                                            if (responseSchema !== undefined && isUnknown !== true) {
                                                if (!seenChildren.has(responseSchema as ThereforeCst)) {
                                                    children.push(responseSchema as ThereforeCst)
                                                }
                                                writer.write(`${statusCode}: {{${responseSchema.uuid}:symbolName}},`)
                                            } else if (statusCode !== 'default' || entriesOf(responses.right).length === 1) {
                                                writer.write(
                                                    `${statusCode}: ${
                                                        responseType === 'text' || responseType === undefined
                                                            ? isStringIs
                                                            : isUnknownIs
                                                    },`
                                                )
                                            }
                                        }
                                    })
                                    .write(')')
                            }
                        })
                        .newLine()
                }
            }
        }

        if (generateValidateRequestBody) {
            writer
                .newLine()
                .writeLine(
                    `public validateRequestBody<T>(schema: { is: (o: unknown) => o is T, assert: (o: unknown) => void}, body: T)`
                )
                .block(() => {
                    writer.writeLine('schema.assert(body)')
                    writer.writeLine('return body')
                })
                .newLine()
        }

        if (generateAwaitResponse) {
            if (useEither) {
                writer
                    .newLine()
                    .writeLine(
                        `public async awaitResponse<T, S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; validate?: ValidateFunction<T> }>>(response: CancelableRequest<Response<unknown>>, schemas: S)`
                    )
                    .block(() => {
                        writer
                            .writeLine(
                                'type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string ? `${S}` extends `${T}${infer _X}` ? S : never : never'
                            )
                            .writeLine('type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never')
                            .writeLine('const result = await response')
                            .writeLine('const validator = schemas[result.statusCode] ?? schemas.default')
                            .writeLine(
                                'if (validator?.is(result.body) === false || result.statusCode < 200 || result.statusCode >= 300)'
                            )
                            .block(() => {
                                writer
                                    .write(
                                        'return {statusCode: result.statusCode, headers: result.headers, left: result.body, validationErrors: validator?.validate?.errors ?? undefined } as '
                                    )
                                    .writeLine(
                                        `{statusCode: number, headers: IncomingHttpHeaders, left: InferSchemaType<S[keyof S]>, validationErrors?: ErrorObject[]}`
                                    )
                            })
                            .write(`return {statusCode: result.statusCode, headers: result.headers, right: result.body } as `)
                            .writeLine(
                                `{statusCode: number, headers: IncomingHttpHeaders, right: InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]>}`
                            )
                    })
                    .newLine()
            } else {
                writer
                    .newLine()
                    .writeLine(
                        `public async awaitResponse<T, S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; assert?: (o: unknown) => void }>>(response: CancelableRequest<Response<unknown>>, schemas: S)`
                    )
                    .block(() => {
                        writer
                            .writeLine(
                                'type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string ? `${S}` extends `${T}${infer _X}` ? S : never : never'
                            )
                            .writeLine('type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S } ? S : never')
                            .writeLine('const result = await response')
                            .writeLine('const schema = schemas[result.statusCode] ?? schemas.default')
                            .writeLine('schema?.assert?.(result.body)')
                            .writeLine(
                                `return {statusCode: result.statusCode, headers: result.headers, body: result.body as InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2' | 'default'>>]> }`
                            )
                    })
                    .newLine()
            }
        }

        if (securities.length > 0) {
            for (const sec of securities) {
                writer.newLine().writeLine(sec.clientFunc).newLine()
            }

            writer
                .writeLine(
                    `protected buildClient(auths: string[][] | string[] | undefined = this.defaultAuth, client: Got = this.client): Got`
                )
                .block(() => {
                    writer
                        .writeLine(
                            `const auth = (auths ?? [...this.availableAuth]).map(auth => Array.isArray(auth) ? auth : [auth]).filter((auth) => auth.every((a) => this.availableAuth.has(a)))`
                        )
                        .writeLine(`for (const chosen of auth[0] ?? [])`)
                        .block(() => {
                            let first = true
                            for (const sec of securities) {
                                writer.conditionalWrite(!first, 'else')
                                writer.writeLine(`if (chosen === '${sec.name}')`).block(() => {
                                    writer.writeLine(`client = this.${sec.clientRef}(client)`)
                                })
                                first = false
                            }
                        })
                        .writeLine('return client')
                })
                .newLine()
        }
    })

    return cstNode(
        'custom',
        {
            ...annotate(definition.info),
            typescript: {
                imports: [
                    `import type { CancelableRequest, Got, Options, Response } from 'got'`,
                    `import got from 'got'`,
                    ...(generateAwaitResponse && useEither
                        ? [`import type { ValidateFunction, ErrorObject } from 'ajv'`, `import {IncomingHttpHeaders} from 'http'`]
                        : []),
                ],
                declaration: writer.toString(),
                declType: 'class',
            },
            fileSuffix: '.client.ts',
        },
        children
    )
}
