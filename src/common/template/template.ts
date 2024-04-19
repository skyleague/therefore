export const templateVar = /\{\{[a-zA-Z0-9:-]+\}\}/g
export function renderTemplate(templ: string, data: Record<string, string | undefined> = {}): string {
    return templ.replace(templateVar, (match) => {
        const cleanedMatch = match.slice(2, -2).split('~')[0]
        const val = cleanedMatch !== undefined ? data[cleanedMatch] : undefined
        if (val !== undefined) {
            return val
        }
        return match
    })
}
