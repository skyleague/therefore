import { buildTypescriptTypeContext } from '../src/lib/visitor/typescript/typescript-type.js'

export const mockTypescriptContext = (options: Partial<Parameters<typeof buildTypescriptTypeContext>[0]> = {}) =>
    buildTypescriptTypeContext({
        exportSymbol: false,
        targetPath: 'test',
        ...options,
    })
