import { buildContext } from '../src/lib/visitor/typescript/typescript.js'

export const mockTypescriptContext = (options: Partial<Parameters<typeof buildContext>[0]> = {}) =>
    buildContext({
        exportSymbol: false,
        ...options,
    })
