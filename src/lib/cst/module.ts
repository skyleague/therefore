import { memoize } from '@skyleague/axioms'
import { Node } from './node.js'

export interface ModuleOptions {
    'value:export'?: string
}

export class ModuleNode extends Node {
    public override _type = 'module' as const

    public constructor(module: string, symbol: string, { 'value:export': valueExport }: ModuleOptions = {}) {
        super({})
        this._sourcePath = module
        this._attributes.typescript['value:source'] = symbol
        this._attributes.typescript['type:source'] = symbol
        this._attributes.typescript.isModule = true
        this._attributes.typescript['value:path'] = module
        this._attributes.typescript['type:path'] = module

        if (valueExport !== undefined) {
            this._attributes.typescript['value:export'] = valueExport
        }
    }

    public override get _output() {
        return [
            {
                type: 'typescript' as const,
                subtype: undefined,
                isTypeOnly: true,
                definition: () => {
                    return undefined
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
    client: moduleSymbol('ky', 'ky', { 'value:export': 'default' }),
}

export const ajvSymbols = {
    ValidationError: moduleSymbol('ajv', 'ValidationError'),
    DefinedError: moduleSymbol('ajv', 'DefinedError'),
    ValidateFunction: moduleSymbol('ajv', 'ValidateFunction'),
    AjvValidator: moduleSymbol('ajv', 'Ajv'),
}

export const ajvFormatsSymbols = {
    addFormats: moduleSymbol('ajv-formats', 'addFormats', { 'value:export': 'default' }),
    FormatName: moduleSymbol('ajv-formats', 'FormatName'),
}

export const zodSymbols = {
    z: moduleSymbol('zod', 'z'),
    SafeParseReturnType: moduleSymbol('zod', 'SafeParseReturnType'),
    ZodError: moduleSymbol('zod', 'ZodError'),
    ZodType: moduleSymbol('zod', 'ZodType'),
}

export const httpSymbols = {
    IncomingHttpHeadersNode: moduleSymbol('node:http', 'IncomingHttpHeaders'),
}
