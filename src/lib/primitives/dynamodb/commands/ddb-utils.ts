import { isValidIdentifier } from '../../../visitor/typescript/literal.js'

export function ddbSafeProperty(property: string) {
    if (isValidIdentifier(property)) {
        return { changed: false as const, property, original: property }
    }
    return { changed: true as const, property: `_${property.replaceAll(/[^a-zA-Z0-9]/g, '_')}`, original: property }
}
