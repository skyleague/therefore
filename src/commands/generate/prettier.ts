import type { ThereforeOutputType } from './types'

import type { Maybe } from '@skyleague/axioms'
import { Nothing } from '@skyleague/axioms'

export function maybeLoadPrettier() {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    let prettier: Maybe<typeof import('prettier')> = Nothing
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        prettier = require('prettier')
    } catch {
        // prettier not found, skip formatting
    }
    return prettier
}

export async function formatFile(
    prettier: ReturnType<typeof maybeLoadPrettier>,
    input: string,
    file: string,
    type: ThereforeOutputType
): Promise<string> {
    if (prettier === Nothing) {
        return input
    }
    const options = await prettier.resolveConfig(file)
    return prettier.format(input, {
        ...(options ?? {}),
        ...(type === 'jsonschema' ? { parser: 'json' } : {}),
    })
}
