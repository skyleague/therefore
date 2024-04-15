import type {
    APIKeySecurityScheme,
    HTTPSecurityScheme,
    OAuth2SecurityScheme,
    OpenIdConnectSecurityScheme,
} from '../../../types/openapi.type.js'
import { accessProperty } from '../../visitor/typescript/literal.js'
import { createWriter } from '../../writer.js'

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
                            .writeLine('options.username = username')
                            .writeLine('options.password = password')
                    })
            } else if (s.scheme === 'bearer') {
                hook.writeLine(`const ${name} = this.auth.${name}!`)
                    .writeLine(`const token = typeof ${name} === 'function' ? await ${name}() : ${name}`)
                    .writeLine('options.headers.Authorization = `Bearer ${token}`')
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
                .writeLine(`options.headers${accessProperty(s.name)} = key`)
        })
        return { decl: hook.toString(), headers: [s.name] }
    },
    openIdConnect: (_s: OpenIdConnectSecurityScheme) => undefined,
    oauth2: (_s: OAuth2SecurityScheme) => undefined,
}
