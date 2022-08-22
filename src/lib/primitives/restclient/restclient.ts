import type {
    ApiKeySecurityScheme,
    HttpSecurityScheme,
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
import type { CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import { toJSDoc } from '../../visitor/typescript/jsdoc'
import { objectProperty } from '../../visitor/typescript/literal'
import { createWriter } from '../../writer'
import { $jsonschema } from '../jsonschema'
import type { CustomType, ThereforeCst } from '../types'

import {
    asyncCollect,
    asyncMap,
    entriesOf,
    fromEntries,
    hasPropertiesDefined,
    isDefined,
    keysOf,
    omitUndefined,
} from '@skyleague/axioms'
import camelCase from 'camelcase'
import inflection from 'inflection'
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
    const [, relevantPath, action] = path.match(/^(.*?)(?::(.*))?$/) ?? []
    const hasAction = action !== undefined

    const pathParts = relevantPath
        .replaceAll(':', '/')
        .split('/')
        .filter((p) => p.length > 0)
        .map((p, i, xs) => ({ name: p, isLast: i === xs.length - 1, isFirst: i === 0 }))
    const staticParts = pathParts
        .filter((p) => !p.name.includes('{'))
        .map((p) => (!p.isLast || methodIsMutation(method) ? inflection.singularize(p.name) : p.name))
    const dynamicParts = pathParts
        .filter((p) => p.name?.includes('{'))
        .filter((x) => x.isLast || x.isFirst)
        .map((p) => p.name.match(/^{(.*)}$/)?.[1])

    return camelCase(
        [
            action ?? methodToName[method],
            ...staticParts,
            ...(dynamicParts.length > 0 && !hasAction ? ['by', dynamicParts.join('_and_')] : []),
        ].join('_')
    )
}

const jsonMime = /(application|\*)\/(.*json|\*)/
const binaryMime = /application\/.*octet-stream/
export async function getRequestBody({
    request,
    openapi,
    method,
    references,
}: {
    request: RequestBody | undefined
    openapi: OpenapiV3
    method: string
    references: Map<string, [name: string, value: () => Promise<CstSubNode>]>
}) {
    const jsonContent = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(jsonMime))?.[1]
    if (jsonContent !== undefined) {
        const schema = jsonContent.schema ?? {}
        const therefore = await $jsonschema(schema as JsonSchema, {
            name: `${method}Request`,
            root: openapi as JsonSchema,
            references,
            exportAllSymbols: true,
        })
        if (!['number', 'string', 'boolean', 'enum', 'integer'].includes(therefore.type)) {
            therefore.description.validator ??= { enabled: true, assert: true }
            therefore.description.validator.assert = true
            return { schema: therefore, name: 'body', type: 'json', declaration: `{{${therefore.uuid}:uniqueSymbolName}}` }
        } else {
            return { name: 'body', type: 'body', declaration: therefore.type.replace('integer', 'number') }
        }
    }

    const binaryContent = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(binaryMime))?.[1]
    if (binaryContent !== undefined) {
        return { name: 'body', type: 'body', declaration: 'string | Buffer' }
    }
    return undefined
}

export async function getResponseBodies({
    responses,
    openapi,
    method,
    references,
    useEither,
}: {
    responses: Responses | undefined
    openapi: OpenapiV3
    method: string
    references: Map<string, [name: string, value: () => Promise<CstSubNode>]>
    useEither: boolean
}) {
    const result: [string, ThereforeCst][] = []
    const successCodesCount = keysOf(responses ?? {}).filter((s) => s.toString().startsWith('2')).length
    for await (const [statusCode, responseRef] of entriesOf(responses ?? {})) {
        const reference = responseRef as Reference | Response
        const response = (await jsonPointer({ schema: openapi, ptr: responseRef ?? {} })) as Response
        const content = entriesOf(response.content ?? {}).find(([mime]) => mime.match(jsonMime))?.[1]
        const schema = content?.schema ?? {}

        const therefore = await $jsonschema(schema as JsonSchema, {
            name: `${method}Response${statusCode.startsWith('2') && successCodesCount <= 1 ? '' : statusCode}`,
            root: openapi as JsonSchema,
            references,
            reference: '$ref' in reference ? reference.$ref : undefined,
            exportAllSymbols: true,
        })
        therefore.description.validator ??= { enabled: true, assert: false }
        therefore.description.validator.assert ||= !useEither
        if (therefore.type !== 'unknown') {
            result.push([statusCode, therefore])
        }
    }
    if (result.length > 0) {
        return { right: fromEntries(result) }
    }
    return { left: undefined }
}

export function getPathParameters(parameters: Parameter[], _openapi: OpenapiV3) {
    const pathParameters = parameters
        ?.filter((p) => p.in === 'path')
        .map((p) => {
            // const parameterSchema = jsonPointer(openapi, p.schema ?? {})
            return {
                id: p.name,
                name: camelCase(p.name),
                type: 'string', ///(isArray(parameterSchema.type) ? 'string' : parameterSchema.type) ?? 'string',
            }
        })

    return pathParameters
}

export function getQueryParameters(parameters: Parameter[], _openapi: OpenapiV3) {
    const queryParameters =
        parameters
            ?.filter((p) => p.in === 'query')
            .map((p) => {
                // const parameterSchema = jsonPointer(openapi, p.schema ?? {})
                return {
                    name: p.name,
                    required: p.required,
                    type: 'string', ///(isArray(parameterSchema.type) ? 'string' : parameterSchema.type) ?? 'string',
                }
            }) ?? []
    return queryParameters
}

export function getHeaderParameters(parameters: Parameter[], _openapi: OpenapiV3) {
    const headerParameters =
        parameters
            ?.filter((p) => p.in === 'header')
            .map((p) => {
                // const parameterSchema = jsonPointer(openapi, p.schema ?? {})
                return {
                    name: p.name,
                    required: p.required,
                    type: 'string', ///(isArray(parameterSchema.type) ? 'string' : parameterSchema.type) ?? 'string',
                }
            }) ?? []
    return headerParameters
}

export function getPrefixUrlConfiguration(servers?: Server[]) {
    const args: string[] = ['string']
    const defaultValues: string[] = []
    for (const server of servers ?? []) {
        if (server.variables !== undefined) {
            let templateUrl = `\`${server.url.replaceAll('{', '${')}\``
            let defaultUrl = server.url
            let allDefault = false
            for (const [name, values] of entriesOf(server.variables)) {
                const variations = new Set(['string', values.default, ...(values.enum ?? [])])
                templateUrl = templateUrl.replace(name, [...variations].join(' | '))
                allDefault = allDefault && values.default !== undefined
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
    | ApiKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdConnectSecurityScheme
    | (HttpSecurityScheme & { type: 'http' })

const toSecurityDeclaration: {
    [T in MappableSecurityScheme['type']]: (s: Extract<MappableSecurityScheme, { type: T }>) => string | undefined
} = {
    http: (s: HttpSecurityScheme & { type: 'http' }) => {
        if (s.scheme === 'basic') {
            return '[username: string, password: string] | (() => Promise<[username: string, password: string]>)'
        } else if (s.scheme === 'bearer') {
            return 'string | (() => Promise<string>)'
        }
        return ''
    },
    apiKey: (_s: ApiKeySecurityScheme) => 'string | (() => Promise<string>)',
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => 'string | (() => Promise<string>)',
    oauth2: (_s: OAuth2SecurityScheme) => 'string | (() => Promise<string>)',
}

const toSecurityHook: {
    [T in MappableSecurityScheme['type']]: (s: Extract<MappableSecurityScheme, { type: T }>, name: string) => string | undefined
} = {
    http: (s: HttpSecurityScheme & { type: 'http' }, name) => {
        const hook = createWriter()
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
            }
        })
        return hook.toString()
    },
    apiKey: (s: ApiKeySecurityScheme, name) => {
        const hook = createWriter()
        hook.writeLine('async (options) => ').block(() => {
            hook.writeLine(`const ${name} = this.auth.${name}`)
                .writeLine(`const key = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                .writeLine(`options.headers['${s.name}'] = key`)
        })
        return hook.toString()
    },
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => undefined,
    oauth2: (_s: OAuth2SecurityScheme) => undefined,
}

export async function getSecurity(
    securityRequirements: Record<string, Reference | SecurityScheme> | undefined,
    openapi: OpenapiV3
) {
    const securities = await asyncCollect(
        asyncMap(entriesOf(securityRequirements ?? []), async ([name, securityRef]) => {
            const security = (await jsonPointer({ schema: openapi, ptr: securityRef ?? {} })) as unknown as MappableSecurityScheme
            const type = security?.type ?? ('http' as const)
            const convert = toSecurityDeclaration[type]

            const camelName = camelCase(name)
            const clientRef = camelCase(`build_${camelName}_client`)
            const clientWriter = createWriter()
            const hook = toSecurityHook[type](security as never, camelName)
            clientWriter.writeLine(`protected ${clientRef}(client: Got)`).block(() => {
                if (hook !== undefined && hook.length > 0) {
                    clientWriter
                        .writeLine('return client.extend({')
                        .writeLine('hooks: {')
                        .writeLine('beforeRequest: [')
                        .writeLine(hook)
                        .writeLine(`],},})`)
                } else {
                    clientWriter.writeLine('return client')
                }
            })

            return {
                type: name,
                required: false,
                clientRef,
                name: camelName,
                declaration: convert(security as never),
                clientFunc: clientWriter.toString(),
            }
        })
    )
    const activatedAuth = securities.filter(hasPropertiesDefined(['declaration']))
    const hasAuth = activatedAuth.length > 0

    return {
        authDeclaration: activatedAuth.map((s) => `${s.name}?: ${s.declaration}`).join(','),
        securities,
        hasAuth,
    }
}

export interface RestclientOptions {
    preferOperationId?: boolean
    useEither?: boolean
    transformOpenapi?: (openapi: OpenapiV3) => OpenapiV3
}

export async function $restclient(definition: OpenapiV3, options: Partial<RestclientOptions> = {}): Promise<CustomType> {
    const converted: { openapi: OpenapiV3 } = await converter.convertObj(definition, {
        path: true,
    })

    const openapi: OpenapiV3 =
        options.transformOpenapi === undefined ? converted.openapi : options.transformOpenapi(converted.openapi)
    const writer = createWriter()

    const { useEither = true } = options
    const references = new Map<string, [name: string, value: () => Promise<CstSubNode>]>()

    const children: ThereforeCst[] = []
    const seenChildren = new WeakSet<ThereforeCst>()

    let generateAwaitResponse = false
    let generateValidateRequestBody = false
    await writer.blockAsync(async () => {
        const { prefixUrl, defaultValue } = getPrefixUrlConfiguration(openapi.servers)
        const { authDeclaration, securities, hasAuth } = await getSecurity(openapi.components?.securitySchemes, openapi)

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
                for (const [httpMethod, operation] of entriesOf(
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
                    const request = await getRequestBody({
                        request: (await jsonPointer({ schema: openapi, ptr: operation.requestBody })) as RequestBody | undefined,
                        openapi,
                        method,
                        references,
                    })
                    let requestValidationStr = ''
                    if (request?.schema !== undefined) {
                        requestValidationStr = `this.validateRequestBody({{${request.schema.uuid}:symbolName}}, ${request.name})`
                        generateValidateRequestBody = true
                        children.push(request.schema)
                    }
                    const parameters: Parameter[] = (
                        await asyncCollect(
                            asyncMap(
                                [...(operation.parameters ?? []), ...(pathItem.parameters ?? [])] ?? [],
                                async (parameter) =>
                                    (await jsonPointer({ schema: openapi, ptr: parameter })) as Parameter | undefined
                            )
                        )
                    ).filter(isDefined)

                    const pathParameters = getPathParameters(parameters, openapi)
                    const queryParameters = getQueryParameters(parameters, openapi)
                    const headerParameters = getHeaderParameters(parameters, openapi)

                    const responses = await getResponseBodies({
                        responses: operation.responses,
                        openapi,
                        method,
                        references,
                        useEither,
                    })

                    let clientDecl = 'this.client'
                    const authMethods: string[] = []
                    const security = operation.security ?? openapi.security
                    if (security !== undefined) {
                        const hasAuthParameters = operation.security !== undefined
                        for (const secMethods of security) {
                            const required = keysOf(secMethods)
                                .map((sm) => securities.find((s) => s.type === sm)?.name)
                                .filter((x): x is string => x !== undefined)
                            authMethods.push(`[${required.map((r) => `'${r}'`).join(', ')}]`)
                        }
                        clientDecl = `this.buildClient(${hasAuthParameters ? 'auth' : ''})`
                    }

                    const parameterizedPath = pathParameters
                        .reduce<string>((p, x) => p.replace(`{${x.id}}`, `{${x.name}}`), path)
                        .replaceAll('{', '${path.')

                    const urlPath = parameterizedPath.startsWith('/') ? parameterizedPath.slice(1) : parameterizedPath

                    const pathArguments = (pathParameters?.map((p) => `${p.name}: ${p.type}`) ?? []).join(', ')
                    const queryArguments = (
                        queryParameters?.map((p) => `${objectProperty(p.name)}${p.required === true ? '' : '?'}: ${p.type}`) ?? []
                    ).join(', ')
                    const queryOptionalStr = queryParameters?.every((q) => q.required === true) ? '' : '?'
                    const headerArguments = (
                        headerParameters?.map((p) => `${objectProperty(p.name)}${p.required === true ? '' : '?'}: ${p.type}`) ??
                        []
                    ).join(', ')
                    const headerOptionalStr = headerParameters?.every((q) => q.required === true) ? '' : '?'

                    const methodArgumentsInner = [
                        ...(request?.declaration !== undefined
                            ? [[request.name, `${request.name}: ${request.declaration}`]]
                            : []),
                        ...(pathArguments.length > 0 ? [['path', `path: { ${pathArguments} }`]] : []),
                        ...(queryArguments.length > 0 ? [['query', `query${queryOptionalStr}: { ${queryArguments} }`]] : []),
                        ...(headerArguments.length > 0
                            ? [['headers', `headers{headerOptionalStr}: { ${headerArguments} }`]]
                            : []),
                        ...(operation.security?.length !== undefined && operation.security?.length > 0
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

                    writer.writeLine(`public async ${method}(${methodArguments})`)
                    writer
                        .block(() => {
                            const hasInputObj = request !== undefined || queryParameters.length > 0 || headerParameters.length > 0
                            const hasResponse = 'right' in responses
                            generateAwaitResponse ||= hasResponse

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
                                            .conditionalWrite(
                                                headerParameters.length > 0,
                                                `headers: headers${headerOptionalStr.length > 0 ? ' ?? {}' : ''},`
                                            )
                                            .conditionalWrite(hasResponse, `responseType:'json',`)
                                    })
                                    .write(')')
                            } else {
                                writer.write(')')
                            }
                            if (hasResponse) {
                                writer
                                    .write(', ')
                                    .inlineBlock(() => {
                                        for (const [statusCode, response] of entriesOf(responses.right)) {
                                            if (!seenChildren.has(response as ThereforeCst)) {
                                                children.push(response as ThereforeCst)
                                            }
                                            writer.write(`${statusCode}: {{${response.uuid}:symbolName}},`)
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
                        `public async awaitResponse<T, S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; validate: ValidateFunction<T> }>>(response: CancelableRequest<Response<unknown>>, schemas: S)`
                    )
                    .block(() => {
                        writer
                            .writeLine(
                                'type FilterStartingWith<S extends PropertyKey, T extends string> = S extends number | string ? `${S}` extends `${T}${infer _X}` ? S : never : never'
                            )
                            .writeLine(
                                'type InferSchemaType<T> = T extends { is: (o: unknown) => o is infer S; assert: (o: unknown) => void } ? S : never'
                            )
                            .writeLine('const result = await response')
                            .writeLine('const validator = schemas[result.statusCode]')
                            .writeLine(
                                'if (validator?.is(result.body) === false || result.statusCode < 200 || result.statusCode >= 300)'
                            )
                            .block(() => {
                                writer
                                    .write(
                                        'return {statusCode: result.statusCode, headers: result.headers, left: result.body, validationErrors: validator?.validate.errors ?? undefined } as '
                                    )
                                    .writeLine(
                                        `{statusCode: number, headers: IncomingHttpHeaders, left: InferSchemaType<S[keyof S]>, validationErrors?: ErrorObject[]}`
                                    )
                            })
                            .write(`return {statusCode: result.statusCode, headers: result.headers, right: result.body } as `)
                            .writeLine(
                                `{statusCode: number, headers: IncomingHttpHeaders, right: InferSchemaType<S[keyof Pick<S, FilterStartingWith<keyof S, '2'>>]>}`
                            )
                    })
                    .newLine()
            } else {
                writer
                    .newLine()
                    .writeLine(
                        `public async awaitResponse<T, S extends Record<PropertyKey, undefined | { is: (o: unknown) => o is T; assert: (o: unknown) => void }>>(response: CancelableRequest<Response<unknown>>, schemas: S)`
                    )
                    .block(() => {
                        writer
                            .writeLine('const result = await response')
                            .writeLine('schemas[result.statusCode]?.assert(result.body)')
                            .writeLine(`return {statusCode: result.statusCode, headers: result.headers, body: result.body }`)
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
                            `const auth = (auths ?? []).map(auth => Array.isArray(auth) ? auth : [auth]).filter((auth) => auth.every((a) => this.availableAuth.has(a)))`
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
