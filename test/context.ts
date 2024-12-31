import { buildTypescriptAjvContext } from '../src/lib/visitor/typescript/typescript-ajv.js'

export const mockTypescriptContext = (options: Partial<Parameters<typeof buildTypescriptAjvContext>[0]> = {}) =>
    buildTypescriptAjvContext({
        exportSymbol: false,
        ...options,
    })
