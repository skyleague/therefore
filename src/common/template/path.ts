export const extensionMatch = /(\.[^/.]+)+$/

export function replaceExtension(file: string, extension: string | undefined): string {
    return extension !== undefined ? `${file.replace(extensionMatch, '')}${extension}` : file
}
