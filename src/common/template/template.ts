export function renderTemplate(templ: string, data: Record<string, string | undefined> = {}): string {
    return templ.replace(/\{\{([^}]+)\}\}/g, (match) => {
        match = match.slice(2, -2)
        const val = data[match]
        if (val !== undefined) {
            return val
        }
        throw new Error(`Reference ${match} not found`)
    })
}
