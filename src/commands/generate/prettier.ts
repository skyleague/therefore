import type { ThereforeOutputType } from './types.js'

import { Nothing, isNothing } from '@skyleague/axioms'

export async function maybeLoadPrettier() {
    try {
        return await import('prettier')
    } catch {
        return Nothing
    }
}

export async function formatFile(
    prettier: Awaited<ReturnType<typeof maybeLoadPrettier>>,
    input: string,
    file: string,
    type: ThereforeOutputType
): Promise<string> {
    if (isNothing(prettier)) {
        return input
    }
    const options = await prettier.resolveConfig(file)
    return prettier.format(input, {
        ...(options ?? {}),
        ...(type === 'jsonschema' ? { parser: 'json' } : {}),
    })
}
