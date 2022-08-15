import type { Options } from 'code-block-writer'
import CodeBlockWriter from 'code-block-writer'

export class CodeBlockWriterAsync extends CodeBlockWriter {
    private _newLineOnNextWrite = false

    public constructor(opts?: Partial<Options>) {
        super(opts)
    }

    /**
     * Writes a block using braces.
     * @param block - Write using the writer within this block.
     */
    public async blockAsync(block?: () => Promise<void>): Promise<this> {
        this._newLineIfNewLineOnNextWrite()
        if (this.getLength() > 0 && !this.isLastNewLine()) {
            this.spaceIfLastNot()
        }
        await this.inlineBlockAsync(block)
        this._newLineOnNextWrite = true
        return this
    }

    /**
     * Writes an inline block with braces.
     * @param block - Write using the writer within this block.
     */
    public async inlineBlockAsync(block?: () => Promise<void>): Promise<this> {
        this._newLineIfNewLineOnNextWrite()
        this.write('{')
        await this._indentBlockInternalAsync(block)
        this.newLineIfLastNot().write('}')

        return this
    }

    private _newLineIfNewLineOnNextWrite() {
        if (!this._newLineOnNextWrite) {
            return this
        }
        this._newLineOnNextWrite = false
        this.newLine()
        return this
    }

    private async _indentBlockInternalAsync(block?: () => Promise<void>) {
        if (this.getLastChar() !== undefined) {
            this.newLineIfLastNot()
        }

        this.setIndentationLevel(this.getIndentationLevel() + 1)

        if (block !== undefined) {
            await block()
        }

        this.setIndentationLevel(Math.max(0, this.getIndentationLevel() - 1))
    }
}

export const createWriter = () =>
    new CodeBlockWriterAsync({
        indentNumberOfSpaces: 4,
        useSingleQuote: true,
    })
