import { memoize } from '@skyleague/axioms'
import { Node } from './node.js'

export type ModuleOptions = {
    alias?: string
    transform?: Node['transform']
}

export class ModuleNode extends Node {
    public override type = 'module' as const

    public constructor(module: string, symbol: string, { alias, transform }: ModuleOptions = {}) {
        super({})
        this.sourcePath = module
        this.attributes.typescript.symbolName = symbol
        this.attributes.typescript.isModule = true
        this.attributes.typescript.path = module
        if (alias !== undefined) {
            this.attributes.typescript.aliasName = alias
        }

        this.transform = transform
    }

    public override get output() {
        return []
    }
}

export function moduleSymbol(module: string, symbol: string, options: ModuleOptions = {}) {
    return memoize(() => new ModuleNode(module, symbol, options))
}

export const gotSymbols = {
    CancableRequest: moduleSymbol('got', 'CancelableRequest'),
    Got: moduleSymbol('got', 'Got'),
    Options: moduleSymbol('got', 'Options'),
    OptionsInit: moduleSymbol('got', 'OptionsInit'),
    Response: moduleSymbol('got', 'Response'),
    got: moduleSymbol('got', 'got'),
}

export const ajvSymbols = {
    ValidationError: moduleSymbol('ajv', 'ValidationError'),
    DefinedError: moduleSymbol('ajv', 'DefinedError'),
    ValidateFunction: moduleSymbol('ajv', 'ValidateFunction'),
    AjvValidator: moduleSymbol('ajv', 'default', { alias: 'AjvValidator' }),
}

export const ajvFormatsSymbols = {
    addFormats: moduleSymbol('ajv-formats', 'default', { alias: 'addFormats' }),
    FormatName: moduleSymbol('ajv-formats', 'FormatName'),
}

export const httpSymbols = {
    IncomingHttpHeaders: moduleSymbol('node:http', 'IncomingHttpHeaders'),
}
