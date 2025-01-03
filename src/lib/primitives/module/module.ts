import { moduleSymbol } from '../../cst/module.js'

export function $moduleRef(module: string, path: string) {
    return moduleSymbol(module, path)()
}
