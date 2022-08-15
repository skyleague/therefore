import { jsonPointer } from '../../../common/json/json'
import type { JsonSchema } from '../../../json'
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
    Response,
    Responses,
    SecurityScheme,
    Server,
} from '../../../openapi.type'
import type { CstSubNode } from '../../cst/cst'
import { cstNode } from '../../cst/cst'
import { toJSDoc } from '../../visitor/typescript/jsdoc'
import { objectProperty } from '../../visitor/typescript/literal'
import { createWriter } from '../../writer'
import { $jsonschema } from '../jsonschema'
import type { CustomType, ThereforeCst } from '../types'

import { asyncCollect, entriesOf, hasPropertiesDefined, isDefined, keysOf, omitUndefined } from '@skyleague/axioms'
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
        .map((p, i, xs) => ({ name: p, isLast: i === xs.length - 1 }))
    const staticParts = pathParts
        .filter((p) => !p.name.includes('{'))
        .map((p) => (!p.isLast || methodIsMutation(method) ? inflection.singularize(p.name) : p.name))
    const dynamicParts = pathParts
        .filter((p) => p.name?.includes('{'))
        .filter((x) => x.isLast)
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
        therefore.description.generateValidator = true
        return { schema: therefore, name: 'body', type: 'json', declaration: `{{${therefore.uuid}:referenceName}}` }
    }

    const binaryContent = entriesOf(request?.content ?? {}).find(([mime]) => mime.match(binaryMime))?.[1]
    if (binaryContent !== undefined) {
        return { name: 'body', type: 'body', declaration: 'string | Buffer' }
    }
    return undefined
}

export async function getResponseBody({
    responses,
    openapi,
    method,
    references,
}: {
    responses: Responses | undefined
    openapi: OpenapiV3
    method: string
    references: Map<string, [name: string, value: () => Promise<CstSubNode>]>
}) {
    if (responses?.['200'] !== undefined) {
        const response = responses['200'] as Response
        const content = entriesOf(response.content ?? {}).find(([mime]) => mime.match(jsonMime))?.[1]
        const schema = content?.schema ?? {}
        const therefore = await $jsonschema(schema as JsonSchema, {
            name: `${method}Response`,
            root: openapi as JsonSchema,
            references,
            exportAllSymbols: true,
            generateValidator: true,
        })
        therefore.description.generateValidator = true
        return therefore
    }
    return undefined
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
        entriesOf(securityRequirements ?? []).map(async ([name, securityRef]) => {
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
    transformOpenapi?: (openapi: OpenapiV3) => OpenapiV3
}

export async function $restclient(definition: OpenapiV3, options: Partial<RestclientOptions> = {}): Promise<CustomType> {
    const converted: { openapi: OpenapiV3 } = await converter.convertObj(definition, {
        path: true,
    })

    const openapi: OpenapiV3 =
        options.transformOpenapi === undefined ? converted.openapi : options.transformOpenapi(converted.openapi)
    const writer = createWriter()

    const references = new Map<string, [name: string, value: () => Promise<CstSubNode>]>()

    const children: ThereforeCst[] = []
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
                writer.conditionalWriteLine(hasAuth, 'auth,')
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
                    'this.client = got.extend(...[{ prefixUrl }, options].filter((o): o is Options => o !== undefined))'
                )

                writer.conditionalWriteLine(hasAuth, 'this.auth = auth')
                writer.conditionalWriteLine(hasAuth, 'this.availableAuth = new Set(Object.keys(auth))')
                writer.conditionalWriteLine(hasAuth, 'this.defaultAuth = defaultAuth')
            })
            .newLine()
            .newLine()

        let generateValidateResponse = false
        let generateValidateRequestBody = false
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
                            [...(operation.parameters ?? []), ...(pathItem.parameters ?? [])]?.map(
                                async (parameter) =>
                                    (await jsonPointer({ schema: openapi, ptr: parameter })) as Parameter | undefined
                            )
                        )
                    ).filter(isDefined)

                    const pathParameters = getPathParameters(parameters, openapi)
                    const queryParameters = getQueryParameters(parameters, openapi)

                    const response = await getResponseBody({
                        responses: operation.responses,
                        openapi,
                        method,
                        references,
                    })
                    let responseType = ''
                    let resultStr = ''
                    let returnStr = ''
                    let responseTypeJson = ''
                    if (response) {
                        children.push(response)
                        responseType = `: Promise<{{${response.uuid}:referenceName}}>`
                        returnStr = `return this.validateResponse({{${response.uuid}:symbolName}}, result)`
                        resultStr = 'const result = await '
                        responseTypeJson = `<{{${response.uuid}:referenceName}}>`
                        generateValidateResponse = true
                    } else {
                        responseType = ': Promise<void>'
                        resultStr = 'await '
                    }

                    let clientDecl = 'this.client'
                    const authMethods: string[] = []
                    if (operation.security !== undefined) {
                        for (const secMethods of operation.security) {
                            const required = keysOf(secMethods)
                                .map((sm) => securities.find((s) => s.type === sm)?.name)
                                .filter((x): x is string => x !== undefined)
                            authMethods.push(`[${required.map((r) => `'${r}'`).join(', ')}]`)
                        }
                        clientDecl = `this.buildClient(auth)`
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

                    const methodArgumentsInner = [
                        ...(pathArguments.length > 0 ? [['path', `path: { ${pathArguments} }`]] : []),
                        ...(queryArguments.length > 0 ? [['query', `query${queryOptionalStr}: { ${queryArguments} }`]] : []),
                        ...(request?.declaration !== undefined
                            ? [[request.name, `${request.name}: ${request.declaration}`]]
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

                    writer.writeLine(`public async ${method}(${methodArguments})${responseType}`)
                    writer
                        .block(() => {
                            const hasInputObj = request !== undefined || queryParameters.length > 0
                            if (hasInputObj) {
                                writer.conditionalWriteLine(requestValidationStr !== '', `${requestValidationStr}\n`)
                                writer
                                    .writeLine(`${resultStr}${clientDecl}.${httpMethod}(\`${urlPath}\`,`)
                                    .block(() => {
                                        if (request !== undefined) {
                                            writer.writeLine(`${request.type}: ${request.name},`)
                                        }
                                        writer.conditionalWriteLine(
                                            queryParameters.length > 0,
                                            `searchParams: query${queryOptionalStr.length > 0 ? ' ?? {}' : ''},`
                                        )
                                    })
                                    .writeLine(`).json${responseTypeJson}()`)
                            } else {
                                writer.writeLine(
                                    `${resultStr}${clientDecl}.${httpMethod}(\`${urlPath}\`).json${responseTypeJson}()`
                                )
                            }

                            writer.conditionalWriteLine(returnStr !== '', returnStr)
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

        if (generateValidateResponse) {
            writer
                .newLine()
                .writeLine(
                    `public validateResponse<T>(schema: { is: (o: unknown) => o is T, assert: (o: unknown) => void}, response: T)`
                )
                .block(() => {
                    writer.writeLine('schema.assert(response)')
                    writer.writeLine('return response')
                })
                .newLine()
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
                imports: [`import got, { Got, Options } from 'got'`],
                declaration: writer.toString(),
                declType: 'class',
            },
            fileSuffix: '.client.ts',
        },
        children
    )
}
