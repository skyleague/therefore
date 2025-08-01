import type {
    APIKeySecurityScheme,
    HTTPSecurityScheme,
    OAuth2SecurityScheme,
    OpenIdConnectSecurityScheme,
} from '../../../types/openapi.type.js'
import { accessProperty } from '../../visitor/typescript/literal.js'
import { createWriter } from '../../writer.js'
import type { RestClientOptions } from './restclient.js'

export type MappableSecurityScheme =
    | APIKeySecurityScheme
    | OAuth2SecurityScheme
    | OpenIdConnectSecurityScheme
    | (HTTPSecurityScheme & { type: 'http' })

export const toSecurityDeclaration: {
    [T in MappableSecurityScheme['type']]: (s: Extract<MappableSecurityScheme, { type: T }>) => string | undefined
} = {
    http: (s: HTTPSecurityScheme & { type: 'http' }) => {
        if (s.scheme === 'basic') {
            return '[username: string, password: string] | (() => Promise<[username: string, password: string]>)'
        }
        if (s.scheme === 'bearer') {
            return 'string | (() => Promise<string>)'
        }
        return ''
    },
    apiKey: (_s: APIKeySecurityScheme) => 'string | (() => Promise<string>)',
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => 'string | (() => Promise<string>)',
    oauth2: (_s: OAuth2SecurityScheme) => 'string | (() => Promise<string>)',
} as const

export const toSecurityHook: {
    [T in MappableSecurityScheme['type']]: (
        s: Extract<MappableSecurityScheme, { type: T }>,
        name: string,
        options: RestClientOptions,
    ) => { decl: string; headers: string[] } | undefined
} = {
    http: (s: HTTPSecurityScheme & { type: 'http' }, name, { client }) => {
        const hook = createWriter()
        const headers: string[] = []
        hook.writeLine('async (options) => ').block(() => {
            if (s.scheme === 'basic') {
                hook.writeLine(`const ${name} = this.auth.${name}`)
                    .writeLine(`if (${name} !== undefined)`)
                    .block(() => {
                        hook.writeLine(`const [username, password] = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                            .conditionalWriteLine(client === 'got', 'options.username = username')
                            .conditionalWriteLine(client === 'got', 'options.password = password')
                            .conditionalWriteLine(
                                client === 'ky',
                                // biome-ignore lint/suspicious/noTemplateCurlyInString: we know it's a string
                                'options.headers.set("Authorization", `Basic ${btoa(`${username}:${password}`)}`)',
                            )
                    })
            } else if (s.scheme === 'bearer') {
                hook.writeLine(`const ${name} = this.auth.${name}!`)
                    .writeLine(`const token = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                    // biome-ignore lint/suspicious/noTemplateCurlyInString: we know it's a string
                    .conditionalWriteLine(client === 'got', 'options.headers.Authorization = `Bearer ${token}`')
                    // biome-ignore lint/suspicious/noTemplateCurlyInString: we know it's a string
                    .conditionalWriteLine(client === 'ky', 'options.headers.set(`Authorization`, `Bearer ${token}`)')
                headers.push('Authorization')
            }
        })
        return { decl: hook.toString(), headers }
    },
    apiKey: (s: APIKeySecurityScheme, name, { client }) => {
        const hook = createWriter()
        hook.writeLine('async (options) => ').block(() => {
            hook.writeLine(`const ${name} = this.auth.${name}`)
                .writeLine(`const key = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                .conditionalWriteLine(client === 'got', `options.headers${accessProperty(s.name)} = key`)
                .conditionalWriteLine(client === 'ky', `options.headers.set('${s.name}', \`\${key}\`)`)
        })
        return { decl: hook.toString(), headers: [s.name] }
    },
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => undefined,
    oauth2: (_s: OAuth2SecurityScheme) => undefined,
}
