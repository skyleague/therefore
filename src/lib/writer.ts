import _CodeBlockWriter from 'code-block-writer'

const CodeBlockWriter = (_CodeBlockWriter as unknown as typeof import('code-block-writer')).default ?? _CodeBlockWriter

export const createWriter = () =>
    new CodeBlockWriter({
        indentNumberOfSpaces: 4,
        useSingleQuote: true,
    })
