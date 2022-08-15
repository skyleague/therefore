import { isAlphaNumeric, isDigits } from '@skyleague/axioms'

export function objectProperty(x: string) {
    if (x.includes('.')) {
        return `[${stringLiteral(x, { allowBacktick: true })}]`
    }
    return x
}

export function stringLiteral(x: string, { allowBacktick = false }: { allowBacktick?: boolean } = {}): string {
    const escaped = x.replaceAll('\\', '\\\\')
    if (escaped.includes("'") || escaped.includes('"')) {
        if (allowBacktick) {
            return `\`${escaped.replaceAll(/`/g, '\\`')}\``
        }
        return `'${escaped.replaceAll(/'/g, "\\'")}'`
    }
    return `'${escaped}'`
}

export function toLiteral(obj: unknown): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsupported = (_: any) => {
        throw new Error('not supported')
    }
    const walker = {
        object: (n: Record<string, unknown> | unknown[]): string => {
            if (Array.isArray(n)) {
                return `[${n.map((v) => walker[typeof v](v)).join(', ')}]`
            } else if (n === null) {
                return 'null'
            } else {
                return `{ ${Object.entries(n)
                    .map(([k, v]) =>
                        isAlphaNumeric(k) && k.length > 0 && !isDigits(k[0])
                            ? `${k}: ${walker[typeof v](v)}`
                            : `${stringLiteral(k)}: ${walker[typeof v](v)}`
                    )
                    .join(', ')} }`
            }
        },
        number: (n: number) => `${n}`,
        bigint: (n: bigint) => `${n}`,
        string: (n: string) => stringLiteral(n, { allowBacktick: true }),
        boolean: (n: boolean) => `${n.toString()}`,
        undefined: (_: undefined) => 'null',
        symbol: unsupported,
        function: unsupported,
    }
    return walker[typeof obj](obj)
}
