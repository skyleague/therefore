import _CodeBlockWriter from 'code-block-writer'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/consistent-type-imports
const CodeBlockWriter = (_CodeBlockWriter as unknown as typeof import('code-block-writer')).default ?? _CodeBlockWriter

export const createWriter = () =>
    new CodeBlockWriter({
        indentNumberOfSpaces: 4,
        useSingleQuote: true,
    })
