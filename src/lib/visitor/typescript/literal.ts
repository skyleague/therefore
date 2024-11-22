import { isAlphaNumeric, isDigits } from '@skyleague/axioms'

export function isValidIdentifier(x: string): boolean {
    // biome-ignore lint/suspicious/noMisleadingCharacterClass: taken from mdn
    return /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u.test(x)
}

export function accessProperty(x: string): string {
    if (isValidIdentifier(x)) {
        return `.${x}`
    }
    return `[${stringLiteral(x)}]`
}

export function objectProperty(x: string) {
    if (!isValidIdentifier(x)) {
        return stringLiteral(x, { allowBacktick: !x.startsWith('{') })
    }
    return x
}

export function asString(x: string): string {
    if (x.includes('${')) {
        return `\`${x}\``
    }
    return stringLiteral(x)
}

export function stringLiteral(x: string, { allowBacktick = false }: { allowBacktick?: boolean } = {}): string {
    const escaped = x.replaceAll('\\', '\\\\')
    if (escaped.includes("'") || escaped.includes('"')) {
        if (allowBacktick) {
            return `\`${escaped.replaceAll(/`/g, '\\`').replaceAll('${', '\\${')}\``
        }
        return `'${escaped.replaceAll(/'/g, "\\'")}'`
    }
    return `'${escaped}'`
}

export function toLiteral(obj: unknown): string {
    // biome-ignore lint/suspicious/noExplicitAny: this is a generic walker
    const unsupported = (_: any) => {
        throw new Error('not supported')
    }
    const walker = {
        object: (n: Record<string, unknown> | unknown[] | null): string => {
            if (Array.isArray(n)) {
                return `[${n.map((v) => walker[typeof v](v)).join(', ')}]`
            }
            if (n === null) {
                return 'null'
            }
            return `{ ${Object.entries(n)
                .map(([k, v]) =>
                    // biome-ignore lint/style/noNonNullAssertion: length is checked explicitly
                    isAlphaNumeric(k) && k.length > 0 && !isDigits(k[0]!)
                        ? `${k}: ${walker[typeof v](v)}`
                        : `${stringLiteral(k)}: ${walker[typeof v](v)}`,
                )
                .join(', ')} }`
        },
        number: (n: number) => `${n}`,
        bigint: (n: bigint) => `${n}`,
        string: (n: string) => stringLiteral(n, { allowBacktick: true }),
        boolean: (n: boolean) => n.toString(),
        undefined: (_: undefined) => 'undefined',
        symbol: unsupported,
        function: unsupported,
    }
    return walker[typeof obj](obj).replaceAll('\n', '\\n').replaceAll('\r', '\\r')
}
