import { moduleSymbol } from '../../cst/module.js'
import { $ref } from '../ref/ref.js'

export function $moduleRef(module: string, path: string) {
    return $ref(moduleSymbol(module, path)())
}
