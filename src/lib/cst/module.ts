import { memoize } from '@skyleague/axioms'
import { Node } from './node.js'

export type ModuleOptions = {
    alias?: string
    transform?: Node['_transform']
}

export class ModuleNode extends Node {
    public override _type = 'module' as const

    public constructor(module: string, symbol: string, { alias, transform }: ModuleOptions = {}) {
        super({})
        this._sourcePath = module
        this._attributes.typescript.symbolName = symbol
        this._attributes.typescript.isModule = true
        this._attributes.typescript.path = module
        if (alias !== undefined) {
            this._attributes.typescript.aliasName = alias
        }

        this._transform = transform
    }

    public override get _output() {
        return [
            {
                type: 'typescript' as const,
                subtype: undefined,
                isTypeOnly: true,
                definition: () => {
                    return this._attributes.typescript.symbolName
                },
            },
        ]
    }
}

export function moduleSymbol(module: string, symbol: string, options: ModuleOptions = {}) {
    return memoize(() => new ModuleNode(module, symbol, options))
}

export const gotSymbols = {
    RequestPromise: moduleSymbol('got', 'CancelableRequest'),
    type: moduleSymbol('got', 'Got'),
    Options: moduleSymbol('got', 'Options'),
    OptionsInit: moduleSymbol('got', 'OptionsInit'),
    Response: moduleSymbol('got', 'Response'),
    client: moduleSymbol('got', 'got'),
}

export const kySymbols = {
    RequestPromise: moduleSymbol('ky', 'ResponsePromise'),
    type: moduleSymbol('ky', 'KyInstance'),
    Options: moduleSymbol('ky', 'Options'),
    Response: moduleSymbol('ky', 'Response'),
    client: moduleSymbol('ky', 'default', { alias: 'ky' }),
}

export const ajvSymbols = {
    ValidationError: moduleSymbol('ajv', 'ValidationError'),
    DefinedError: moduleSymbol('ajv', 'DefinedError'),
    ValidateFunction: moduleSymbol('ajv', 'ValidateFunction'),
    AjvValidator: moduleSymbol('ajv', 'Ajv'),
}

export const ajvFormatsSymbols = {
    addFormats: moduleSymbol('ajv-formats', 'default', { alias: 'addFormats' }),
    FormatName: moduleSymbol('ajv-formats', 'FormatName'),
}

export const zodSymbols = {
    z: moduleSymbol('zod', 'z'),
    SafeParseReturnType: moduleSymbol('zod', 'SafeParseReturnType'),
    ZodError: moduleSymbol('zod', 'ZodError'),
}

export const httpSymbols = {
    IncomingHttpHeadersNode: moduleSymbol('node:http', 'IncomingHttpHeaders'),
}
