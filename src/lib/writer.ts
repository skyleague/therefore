import CodeBlockWriter from 'code-block-writer'

export const createWriter = () =>
    new CodeBlockWriter({
        indentNumberOfSpaces: 4,
        useSingleQuote: true,
    })
