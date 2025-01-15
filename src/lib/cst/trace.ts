import fs from 'node:fs'

// Add cache at module level
const fileCache = new Map<string, string[]>()

export interface NodeTrace {
    line: string | undefined
    source: string | undefined
    column: string | undefined
    symbolName: string | undefined
}

export function fileFromNodeTrace(trace: string | undefined): NodeTrace | undefined {
    if (!trace) {
        return undefined
    }
    const parts = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i.exec(trace)
    const source = parts?.[2]
    const line = parts?.[3]
    const column = parts?.[4]
    if (!parts || !source || source.includes('node:')) {
        return undefined
    }
    const nodeTrace: NodeTrace = {
        source: source,
        line: line,
        column: column,
        symbolName: undefined,
    }
    try {
        // Check cache first
        let lines = fileCache.get(source)
        if (!lines) {
            const file = fs.readFileSync(source)
            lines = file.toString().split('\n')
            fileCache.set(source, lines)
        }
        const lineNumber = Number.parseInt(line ?? '0', 10)

        // Search through the whole file for better context
        let symbolName: string | undefined

        // First try to find direct assignment at the line number
        const lineContent = lines[lineNumber - 1]
        const directMatch = lineContent?.match(/^(?:\s*export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1]

        if (directMatch) {
            symbolName = directMatch
        } else {
            // If not found, search backwards until we find a schema definition
            let currentLine = lineNumber - 1
            let openBraces = 0
            let foundStart = false

            // Count braces on the current line
            openBraces += lineContent?.match(/\{/g)?.length ?? 0
            openBraces -= lineContent?.match(/\}/g)?.length ?? 0

            while (currentLine >= 0 && !symbolName) {
                const currentLineContent = lines[currentLine]
                if (currentLineContent === undefined) {
                    break
                }

                // Keep track of code blocks
                openBraces += currentLineContent.match(/\{/g)?.length ?? 0
                openBraces -= currentLineContent.match(/\}/g)?.length ?? 0

                // If we're at brace level 0 and we found a start, we've gone too far back
                if (foundStart && openBraces === 0) {
                    break
                }

                // Look for schema definitions - must start at beginning of line (with optional whitespace and export)
                const schemaMatch = currentLineContent.match(
                    /^(?:\s*export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*z[\s\S]*/,
                )?.[1]
                if (schemaMatch) {
                    symbolName = schemaMatch
                    break
                }

                // Mark when we find a schema start
                if (currentLineContent.match(/^\s*z\./)) {
                    foundStart = true
                }

                currentLine--
            }
        }

        if (symbolName !== undefined) {
            nodeTrace.symbolName = symbolName
        }
    } catch {
        // Ignore if file doesn't exist
    }
    return nodeTrace
}

export function getGuessedTrace(): NodeTrace | undefined {
    const obj: Error = {} as Error
    Error.captureStackTrace(obj)
    const rootPath = import.meta.url.replace('file://', '').split('/').slice(0, -3).join('/')
    return fileFromNodeTrace(
        obj.stack
            ?.split('\n')
            .slice(2)
            .find(
                (line) =>
                    !(line.includes('node_modules') || line.includes('node:') || line.includes('@skyleague/therefore')) &&
                    !line.includes(rootPath),
            ) ?? undefined,
    )
}
