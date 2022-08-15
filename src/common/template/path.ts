export const extensionMatch = /(\.[^/.]+)+$/

export function replaceExtension(file: string, extension: string | undefined): string {
    return extension !== undefined ? `${file.replace(extensionMatch, '')}${extension}` : file
}

export function getExtension(file: string): string | undefined {
    return file.match(extensionMatch)?.[0]
}
