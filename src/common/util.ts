import type { Traversable } from '@skyleague/axioms'

export async function awaitAll<T>(xs: Traversable<Promise<T>> | Traversable<T>): Promise<T[]>
export async function awaitAll<T, U = T>(xs: Traversable<T>, f: (x: T) => Promise<U> | U): Promise<U[]>
export async function awaitAll<T, U = T>(xs: Traversable<T>, f?: (x: T) => Promise<U> | U): Promise<U[]> {
    const results: U[] = []
    if (f !== undefined) {
        for (const x of xs) {
            results.push(await f(x))
        }
    } else {
        for (const x of xs) {
            results.push(await (x as unknown as Promise<U>))
        }
    }
    return results
}
