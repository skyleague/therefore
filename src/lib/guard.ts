import { isArray } from '@skyleague/axioms'

export function isNamedArray<T>(x: [name: string, node: T][] | T[]): x is [name: string, node: T][] {
    return x.length > 0 && isArray(x[0]) && x[0].length === 2
}
